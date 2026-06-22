// Generate looping animated-WebP (and static poster) previews for every example
// in this repo, for use as thumbnails in the auto-generated gallery (see
// scripts/build_gallery.py). Canvas-based sketches are recorded as short loops;
// Web Serial / canvas-less examples get a single poster screenshot instead.
//
// Drives a headless browser via Playwright and encodes frames with ffmpeg (both
// expected on PATH; ffmpeg needs libwebp). Runs locally and in CI:
//   - Local:  PW_CHANNEL=chrome  uses your installed Google Chrome (no download)
//   - CI:     (no channel)       uses Playwright's bundled Chromium
//
// Which folders count as "examples" is decided ENTIRELY by build_gallery.py;
// this script asks it via `--list-json` rather than re-walking the tree, so the
// gallery and the previews can never disagree about the example set.
//
// Output (mirrors each example's path under the repo root):
//   previews/<rel_path>.webp         (animated loop)
//   previews/<rel_path>.poster.png   (static fallback / reduced-motion)
//   previews/manifest.json           (content hashes, to skip unchanged examples)
//
// Usage:
//   node scripts/capture_previews.mjs [--force] [--only <substr>]
//
// Per-example overrides live in a preview.json next to the example's index.html:
//   { "skip": false, "mode": "animated" | "poster",
//     "duration": 4, "fps": 15, "delay": 250, "width": 480, "quality": 72 }

import { chromium } from 'playwright';
import { spawn, spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import {
  mkdir, rm, readFile, writeFile, readdir,
} from 'node:fs/promises';
import { existsSync, readFileSync } from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const OUT_DIR = path.join(ROOT, 'previews');
const MANIFEST = path.join(OUT_DIR, 'manifest.json');
const PORT = 8123;

// Defaults (overridable per example via preview.json). The capture viewport is
// roughly 16:10; frames are scaled down to `width` at encode time, and the
// gallery card crops to 16:9 via object-fit, so exact source aspect is flexible.
const DEFAULTS = {
  mode: 'animated',
  duration: 4, // seconds of loop to record
  fps: 15,
  delay: 250, // ms warm-up before the first frame (let the sketch settle)
  width: 480, // output px width
  quality: 72, // libwebp q:v
  click: true, // click the canvas once before capturing (dismiss "click to start" gates)
  // What element to record. Defaults to the first <canvas>; set a CSS selector
  // (e.g. an iframe) to record sketches whose canvas lives elsewhere.
  captureSelector: null,
  // Optional scripted input played WHILE recording, so the loop shows the sketch
  // being driven. Shape (all optional):
  //   { "drag": "orbit" | "horizontal", "keys": ["ArrowRight"], "keyEveryFrames": 6 }
  interact: null,
};
const VIEWPORT = { width: 900, height: 560 };

// Categories whose examples need hardware / interaction we can't drive headless
// (no serial device attached), so a static poster of the UI is the best we can
// do. Per-example preview.json can still override this.
const POSTER_CATEGORIES = new Set(['WebSerial']);

const args = process.argv.slice(2);
const FORCE = args.includes('--force');
const ONLY = args.includes('--only') ? args[args.indexOf('--only') + 1] : null;
const CHANNEL = process.env.PW_CHANNEL || undefined; // 'chrome' locally, unset in CI

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const sh = (cmd, a) => spawnSync(cmd, a, { encoding: 'utf8' });

// ---------- discovery (build_gallery.py is the source of truth) ----------

/** Ask build_gallery.py for the list of examples; map to the capture model. */
function discoverApps() {
  const r = sh('python3', ['scripts/build_gallery.py', '--list-json']);
  if (r.status !== 0) {
    throw new Error(`build_gallery.py --list-json failed: ${r.stderr || r.stdout}`);
  }
  const entries = JSON.parse(r.stdout);
  return entries.map((e) => {
    const rel = e.rel_path; // e.g. "WebSerial/p5js/CircleSizeIn"
    const dir = path.join(ROOT, rel);
    let config = {};
    const cfgPath = path.join(dir, 'preview.json');
    if (existsSync(cfgPath)) {
      try { config = JSON.parse(readFileSync(cfgPath, 'utf8')); }
      catch (err) { console.warn(`  ! bad preview.json in ${rel}: ${err.message}`); }
    }
    // Hardware/serial categories default to a poster of their UI, and we don't
    // click them (their loaded UI *is* the thumbnail; a click could trip a
    // serial-connect prompt). Everything else defaults to an animated capture.
    const categoryDefaults = POSTER_CATEGORIES.has(e.category)
      ? { mode: 'poster', click: false }
      : {};
    const opts = { ...DEFAULTS, ...categoryDefaults, ...config };
    return {
      key: rel,
      category: e.category,
      dir,
      url: `http://localhost:${PORT}/${rel}/index.html`,
      opts,
      skip: config.skip === true,
    };
  });
}

// ---------- file discovery + hashing ----------

/**
 * Recursively list files under `dir` (absolute paths). Dotfiles/dot-dirs are
 * skipped so machine-local junk (e.g. macOS `.DS_Store`, which is gitignored)
 * doesn't pollute content hashes and make them differ between local and CI.
 */
async function listFiles(dir) {
  const out = [];
  async function walk(d) {
    let entries;
    try { entries = await readdir(d, { withFileTypes: true }); } catch { return; }
    for (const e of entries) {
      if (e.name.startsWith('.')) continue; // .DS_Store, .git, etc.
      const p = path.join(d, e.name);
      if (e.isDirectory()) await walk(p);
      else out.push(p);
    }
  }
  await walk(dir);
  return out.sort();
}

/** Stable content hash of a set of files (path-relative-to-ROOT + bytes). */
async function hashFiles(files) {
  const h = createHash('sha256');
  for (const f of files) {
    h.update(path.relative(ROOT, f).replace(/\\/g, '/'));
    h.update('\0');
    h.update(await readFile(f));
    h.update('\0');
  }
  return h.digest('hex').slice(0, 16);
}

// ---------- capture + encode ----------

/**
 * Many sketches gate on a user gesture (audio needs one; games/interactive art
 * often start drawing on mousePressed). Dispatch a single click at the center of
 * the canvas (or page) so the recorded loop shows the running sketch, not a
 * "click to begin" splash. Disable per-example with `"click": false`.
 */
async function maybeClick(page, app) {
  if (!app.opts.click) return;
  const target = (await page.locator('canvas').count()) > 0
    ? page.locator('canvas').first()
    : page.locator('body');
  try {
    const box = await target.boundingBox();
    if (box) await page.mouse.click(box.x + box.width / 2, box.y + box.height / 2);
  } catch { /* non-fatal: capture whatever is on screen */ }
}

async function captureAnimated(page, app, framesDir) {
  const { duration, fps, delay } = app.opts;
  const frameCount = Math.round(fps * duration);
  const intervalMs = 1000 / fps;

  const target = page.locator(app.opts.captureSelector || 'canvas').first();
  await target.waitFor({ state: 'visible', timeout: 8000 });
  await maybeClick(page, app);
  await sleep(delay);

  // Optional scripted interaction (drag-to-orbit, arrow keys) played as the loop
  // records, so e.g. a p5 WEBGL sketch visibly rotates in its preview.
  const inter = app.opts.interact;
  const box = inter ? await target.boundingBox() : null;
  const cx = box ? box.x + box.width / 2 : 0;
  const cy = box ? box.y + box.height / 2 : 0;
  let dragging = false;
  if (inter && box && inter.drag && inter.drag !== 'none') {
    await page.mouse.move(cx, cy);
    await page.mouse.down();        // grabs the canvas (and focuses it for key input)
    dragging = true;
  }
  const keys = (inter && inter.keys) || [];
  const keyEvery = (inter && inter.keyEveryFrames) || 6;

  const t0 = Date.now();
  for (let i = 0; i < frameCount; i++) {
    if (inter && box) {
      if (dragging) {
        // Sweep one full cycle over the recording so the loop returns near start.
        const phase = (i / frameCount) * Math.PI * 2;
        const dx = Math.sin(phase) * box.width * (inter.drag === 'horizontal' ? 0.35 : 0.30);
        const dy = inter.drag === 'orbit' ? Math.cos(phase) * box.height * 0.16 : 0;
        await page.mouse.move(cx + dx, cy + dy, { steps: 3 });
      }
      if (keys.length && i % keyEvery === 0) {
        await page.keyboard.press(keys[Math.floor(i / keyEvery) % keys.length]);
      }
    }
    const drift = Date.now() - t0 - i * intervalMs;
    if (drift < 0) await sleep(-drift); // pace toward real-time fps
    await target.screenshot({ path: path.join(framesDir, `f_${String(i).padStart(4, '0')}.png`) });
  }
  if (dragging) await page.mouse.up();
  return frameCount;
}

function encodeWebp(framesDir, fps, width, quality, outFile) {
  const r = sh('ffmpeg', [
    '-y', '-loglevel', 'error',
    '-framerate', String(fps),
    '-i', path.join(framesDir, 'f_%04d.png'),
    '-vf', `scale=${width}:-1:flags=lanczos`,
    '-c:v', 'libwebp', '-lossless', '0', '-q:v', String(quality),
    '-compression_level', '6', '-loop', '0',
    outFile,
  ]);
  if (r.status !== 0) throw new Error(`ffmpeg webp failed: ${r.stderr}`);
}

function encodePoster(srcPng, width, outFile) {
  const r = sh('ffmpeg', [
    '-y', '-loglevel', 'error', '-i', srcPng,
    '-vf', `scale=${width}:-1:flags=lanczos`, outFile,
  ]);
  if (r.status !== 0) throw new Error(`ffmpeg poster failed: ${r.stderr}`);
}

/** Render one example to previews/. Returns the produced mode. */
async function renderApp(browser, app) {
  const webpOut = path.join(OUT_DIR, `${app.key}.webp`);
  const posterOut = path.join(OUT_DIR, `${app.key}.poster.png`);
  await mkdir(path.dirname(webpOut), { recursive: true });
  const tmp = path.join(os.tmpdir(), `p5-preview-${app.key.replace(/[\\/]/g, '-')}`);
  await rm(tmp, { recursive: true, force: true });
  await mkdir(tmp, { recursive: true });

  const page = await browser.newPage({
    viewport: VIEWPORT,
    deviceScaleFactor: 1,
    // Auto-grant mic so audio visualizers (getUserMedia) start; the fake device
    // (browser launch flags) feeds a synthetic tone the FFT can render.
    permissions: ['microphone'],
  });
  try {
    await page.goto(app.url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.addStyleTag({ content: '.hint{display:none !important;}' });

    // Animated mode still falls back to a poster if there's nothing to record.
    let mode = app.opts.mode;
    if (mode === 'animated'
        && (await page.locator(app.opts.captureSelector || 'canvas').count()) === 0) {
      console.warn(`  no capture target → poster: ${app.key}`);
      mode = 'poster';
    }

    if (mode === 'poster') {
      // Static thumbnail. For sketches that gate on a gesture (e.g. audio
      // visualizers), maybeClick + the warm-up settle let the canvas fill in
      // before the screenshot, so the poster shows real content rather than a
      // "click to begin" splash. WebSerial keeps click:false (its loaded UI is
      // the intended thumbnail), and maybeClick no-ops when click is false.
      await maybeClick(page, app);
      await sleep(app.opts.delay);
      const raw = path.join(tmp, 'page.png');
      await page.screenshot({ path: raw });
      encodePoster(raw, app.opts.width, posterOut);
      await rm(webpOut, { force: true }); // drop any stale animation
      return 'poster';
    }

    // Animated: record the canvas loop, derive the poster from the last frame.
    const n = await captureAnimated(page, app, tmp);
    encodeWebp(tmp, app.opts.fps, app.opts.width, app.opts.quality, webpOut);
    const last = path.join(tmp, `f_${String(n - 1).padStart(4, '0')}.png`);
    encodePoster(last, app.opts.width, posterOut);
    return 'animated';
  } finally {
    await page.close();
    await rm(tmp, { recursive: true, force: true });
  }
}

// ---------- server ----------

function startServer() {
  return spawn('python3', ['-m', 'http.server', String(PORT)], {
    cwd: ROOT, stdio: 'ignore',
  });
}

// ---------- main ----------

/**
 * Signature of the output-affecting options, stored in the manifest so a change
 * to preview.json (which is excluded from the content hash) still triggers a
 * rebuild. Note: NOT compared against the produced mode — an `animated` example
 * that falls back to a poster at runtime stores mode:"poster", and we treat it
 * as fresh on the next run as long as this signature and the content hash match.
 */
function optsSignature(opts) {
  return JSON.stringify({
    mode: opts.mode,
    captureSelector: opts.captureSelector,
    interact: opts.interact,
    duration: opts.duration,
    fps: opts.fps,
    width: opts.width,
    quality: opts.quality,
    click: opts.click,
  });
}

async function main() {
  const apps = discoverApps();

  let manifest = {};
  if (existsSync(MANIFEST)) {
    try { manifest = JSON.parse(await readFile(MANIFEST, 'utf8')); } catch { /* rebuild */ }
  }
  await mkdir(OUT_DIR, { recursive: true });

  // Decide what needs work.
  const work = [];
  for (const app of apps) {
    if (ONLY && !app.key.includes(ONLY)) continue;
    if (app.skip) {
      console.log(`skip   ${app.key} (preview.json skip)`);
      delete manifest[app.key];
      continue;
    }
    const appFiles = await listFiles(app.dir);
    const appHash = await hashFiles(appFiles.filter((f) => !f.endsWith('preview.json')));
    const optsSig = optsSignature(app.opts);
    const prev = manifest[app.key];
    const webpOut = path.join(OUT_DIR, `${app.key}.webp`);
    const posterOut = path.join(OUT_DIR, `${app.key}.poster.png`);
    // Compare against the mode actually produced last time (prev.mode), so a
    // runtime poster-fallback stays cached instead of re-rendering every run.
    const expected = prev && prev.mode === 'poster' ? posterOut : webpOut;

    const fresh = !FORCE && prev
      && prev.appHash === appHash
      // Legacy manifest entries predate optsSig; treat them as opts-fresh so this
      // change doesn't force a one-time re-render (and re-commit) of everything.
      && (prev.optsSig === undefined || prev.optsSig === optsSig)
      && existsSync(expected);

    if (fresh) { console.log(`ok     ${app.key} (unchanged)`); continue; }
    work.push({ app, appHash, optsSig });
  }

  if (work.length === 0) {
    console.log('\nAll previews up to date.');
    await writeFile(MANIFEST, `${JSON.stringify(sortObj(manifest), null, 2)}\n`);
    return;
  }

  console.log(`\nGenerating ${work.length} preview(s)…`);
  const server = startServer();
  await sleep(1200); // let the static server come up
  const browser = await chromium.launch({
    channel: CHANNEL,
    headless: true,
    // Synthetic audio/video so mic-based sketches (e.g. the Sound visualizers)
    // get a running getUserMedia stream and actually animate, and so any
    // autoplaying audio starts without a real user gesture.
    args: [
      '--use-fake-device-for-media-stream',
      '--use-fake-ui-for-media-stream',
      '--autoplay-policy=no-user-gesture-required',
    ],
  });
  try {
    for (const { app, appHash, optsSig } of work) {
      const label = `${app.key} [${app.opts.mode}]`;
      try {
        const t = Date.now();
        const mode = await renderApp(browser, app);
        manifest[app.key] = { mode, appHash, optsSig };
        console.log(`build  ${label} (${((Date.now() - t) / 1000).toFixed(1)}s)`);
      } catch (e) {
        console.error(`FAIL   ${label}: ${e.message}`);
        process.exitCode = 1;
      }
    }
  } finally {
    await browser.close();
    server.kill();
  }

  await writeFile(MANIFEST, `${JSON.stringify(sortObj(manifest), null, 2)}\n`);
  console.log(`\nWrote ${path.relative(ROOT, OUT_DIR)}/`);
}

function sortObj(o) {
  return Object.fromEntries(Object.keys(o).sort().map((k) => [k, o[k]]));
}

await main();
