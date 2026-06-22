# `scripts/` — maintenance & gallery tooling

Helper scripts for this repo. **None of these are needed to run or develop the
examples** — examples load p5.js from CDN and run by opening their `index.html`.
These scripts maintain the **auto-generated gallery** (the repo-root `index.html`,
served at <https://makeabilitylab.github.io/p5js/>) and keep library imports tidy.

## The gallery pipeline

The gallery is rebuilt automatically on every push to `main` by
[`.github/workflows/build-gallery.yml`](../.github/workflows/build-gallery.yml),
in two stages:

```
                 ┌─────────────────────────┐
  examples  ───► │  capture_previews.mjs   │ ──► previews/<path>.webp   (animated)
 (index.html     │  Playwright + ffmpeg    │     previews/<path>.poster.png
  per folder)    └─────────────────────────┘     previews/manifest.json
        │                                                     │
        │              ┌─────────────────────────┐            │
        └────────────► │     build_gallery.py    │ ◄──────────┘
                       │  walks tree, emits HTML │
                       └─────────────────────────┘
                                   │
                                   ▼
                          repo-root index.html  ──►  GitHub Pages
```

The workflow commits both `index.html` and `previews/` back to `main` with a
`[skip ci]` tag (so the commit doesn't retrigger the workflow).

---

## `build_gallery.py` — generate the gallery page

Walks the repo, finds every folder containing an `index.html`, groups them by
category (top-level folder) and optional subcategory, and writes a self-contained
`index.html` at the repo root (live search, category nav, dark mode). It is the
**single source of truth for which folders count as examples** — excluded
directories, hidden dirs, and the variable-depth rules all live here.

```bash
python scripts/build_gallery.py            # regenerate root index.html
python scripts/build_gallery.py --list-json  # print the example list as JSON (used by capture_previews.mjs)
```

Each card's thumbnail degrades gracefully through four tiers:

1. `previews/<path>.webp` — animated loop (preferred)
2. `previews/<path>.poster.png` — static poster (also shown under
   `prefers-reduced-motion`)
3. a hand-added `screenshot.*` / `thumbnail.*` in the example folder
4. a category emoji placeholder

Configuration (excluded dirs, branch, repo, category emoji) lives in constants at
the top of the file. **Never hand-edit the generated `index.html`** — it is
overwritten on every build.

## `capture_previews.mjs` — generate thumbnail previews

Drives a headless browser ([Playwright](https://playwright.dev)) to capture a
thumbnail for each example, encoded with **ffmpeg**. Canvas sketches are recorded
as a short looping **animated WebP** (with a static **poster PNG** derived from
the last frame); Web Serial / canvas-less examples get a single poster screenshot
of their UI instead. It asks `build_gallery.py --list-json` for the example set,
so it can never disagree with the gallery.

```bash
node scripts/capture_previews.mjs              # update all previews (skips unchanged)
node scripts/capture_previews.mjs --force      # rebuild every preview
node scripts/capture_previews.mjs --only Sound # only examples whose path contains "Sound"
```

**Caching (generate once).** `previews/manifest.json` stores a content hash of
each example's files. On each run, an example is re-captured **only if its code
changed** (or `--force`), so steady-state runs are nearly instant — both locally
and in CI.

**Per-example overrides.** Drop a `preview.json` next to an example's
`index.html` to tune or skip capture:

```jsonc
{
  "skip": false,             // true → no preview generated (use a hand-made screenshot.* instead)
  "mode": "animated",        // "animated" (canvas loop) or "poster" (single shot)
  "duration": 4,             // seconds of loop to record (animated)
  "fps": 15,                 // frames per second (animated)
  "delay": 250,              // ms to wait before the first frame (let it settle)
  "width": 480,              // output width in px
  "quality": 72,             // libwebp quality (0–100)
  "click": true,             // click the canvas once before recording (animated only)
  "captureSelector": null,   // CSS selector of the element to record (default: first <canvas>)
  "interact": null           // scripted input played while recording (see below)
}
```

Defaults: animated for most categories; **poster** for `WebSerial/` (no serial
device is attached headless, so we capture the UI). An animated capture that
finds no capture target automatically falls back to a poster.

**Recording a non-`<canvas>` element / driving interaction.** Some sketches put
their canvas in an `<iframe>`, or only animate when you interact (a p5 `WEBGL`
sketch with `orbitControl()`, say). Two options handle these:

- `captureSelector` records a specific element instead of the first `<canvas>`
  (e.g. `"#color-cube-iframe"`).
- `interact` plays scripted input *while* the loop records, so the preview shows
  the sketch being driven:
  ```jsonc
  "interact": {
    "drag": "orbit",                                  // "orbit" | "horizontal" | "none"
    "keys": ["ArrowRight", "ArrowUp", "ArrowLeft", "ArrowDown"],  // pressed in order
    "keyEveryFrames": 6                               // press a key every N frames
  }
  ```
  The drag sweeps one full cycle over the recording so the loop returns near its
  start; a balanced key sequence (e.g. the diamond above) keeps state from
  drifting. See `Color/ColorExplorer3D/preview.json` for a worked example (it
  orbits a 3D RGB cube living in an iframe).

**Caching / determinism.** The manifest stores a content hash *and* a signature
of these options, and compares against the **mode actually produced** — so an
`animated` example that falls back to a poster at runtime stays cached instead
of re-rendering (and, for non-deterministic WebGL sketches, re-committing) on
every CI run.

**Getting past start gates.** Two things help sketches that don't run on their
own headless:

- The browser launches with Chromium's **fake media stream** flags and mic
  permission auto-granted, so audio/mic visualizers (e.g. the `Sound/` examples)
  get a running `getUserMedia` stream fed by a synthetic tone — their FFT bars
  actually animate instead of showing "click to begin".
- Before recording an animated capture, the script **clicks the canvas once** to
  dismiss "click to start" splashes and kick off `mousePressed`-driven sketches.
  Set `"click": false` in `preview.json` for the rare sketch where a click is
  unwanted.

### Prerequisites (only to regenerate previews)

- **Node 20+** and the dev dependency: `npm ci` (installs Playwright).
- **ffmpeg** with libwebp on `PATH` (`brew install ffmpeg`).
- A Chromium for Playwright. Two options:
  - Local: `PW_CHANNEL=chrome node scripts/capture_previews.mjs` reuses your
    installed Google Chrome (no download).
  - Bundled: `npx playwright install chromium`, then run without `PW_CHANNEL`.

You normally don't run this by hand — CI regenerates previews on push. Run it
locally only to preview your changes before pushing.

---

## Library maintenance scripts

These keep CDN library imports consistent (see the repo `CLAUDE.md` for the pinned
versions — currently p5.js & p5.sound `1.11.13`, ml5.js `0.12.2`).

### `audit_libraries.py`
Scans every example for library import issues — unpinned (`@latest`) CDN URLs,
local `_libraries/` references that should be CDN, version mismatches — and prints
a report. Read-only; makes no changes.

```bash
python scripts/audit_libraries.py
```

### `fix_libraries.py`
Applies the fixes `audit_libraries.py` reports: pins CDN versions, replaces local
lib refs with CDN, and cleans up stray local copies.

```bash
python scripts/fix_libraries.py --dry-run   # show what would change
python scripts/fix_libraries.py             # apply
```

### `migrate_serial_imports.py`
One-off migration: rewrites old `_libraries/serial.js` references to the
`makeabilitylab/js` CDN (`makelab.serial.iife.js`).

```bash
python scripts/migrate_serial_imports.py
```
