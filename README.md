# Makeability Lab p5.js Examples

[![Build Gallery](https://github.com/makeabilitylab/p5js/actions/workflows/build-gallery.yml/badge.svg)](https://github.com/makeabilitylab/p5js/actions/workflows/build-gallery.yml)

A collection of [p5.js](https://p5js.org/) examples for teaching, learning, and experimenting — created by [Jon E. Froehlich](https://jonfroehlich.github.io/) and the [Makeability Lab](https://makeabilitylab.cs.washington.edu/) at the University of Washington. You can view many more p5js projects by Professor Froehlich in the [p5js editor here](https://editor.p5js.org/jonfroehlich/sketches).

**🎨 [Browse the interactive gallery →](https://makeabilitylab.github.io/p5js/)**

## What's here

Examples span several categories including sound visualization, computer vision, games, generative art, Web Serial communication, and more. Each example is a self-contained folder with an `index.html` you can open directly in a browser.

Many of these examples accompany the [Physical Computing](https://makeabilitylab.github.io/physcomp/) course, particularly the [Web Serial](https://makeabilitylab.github.io/physcomp/communication/web-serial.html) and [p5.js Serial](https://makeabilitylab.github.io/physcomp/communication/p5js-serial.html) lessons.

## Running locally

Most examples run by simply opening `index.html` in a browser. For **Web Serial** examples, you need a local web server (the browser blocks serial access from `file://` URLs).

The easiest approach is [VS Code](https://code.visualstudio.com/) with the [Live Server](https://marketplace.visualstudio.com/items?itemName=ritwickdey.LiveServer) extension: open any example folder, right-click `index.html`, and choose "Open with Live Server."

## Web Serial examples

The `WebSerial/` folder contains examples that communicate with Arduino and other microcontrollers via the browser's [Web Serial API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Serial_API). These use the [`serial.js`](https://github.com/makeabilitylab/js#serial-module) wrapper from the [Makeability Lab JS library](https://github.com/makeabilitylab/js), loaded via CDN:

```html
<script src="https://cdn.jsdelivr.net/gh/makeabilitylab/js@main/dist/makelab.serial.iife.js"></script>
```

Web Serial requires **Chrome**, **Edge**, or **Opera**. See the [Web Serial lesson](https://makeabilitylab.github.io/physcomp/communication/web-serial.html) for setup instructions.

## Adding a new example

1. Create a folder under the appropriate category (e.g., `Sound/MyNewVis/`)
2. Add an `index.html` (and optional `sketch.js`, `css/style.css`, etc.)
3. Commit and push — the gallery rebuilds automatically, and a thumbnail preview
   (an animated WebP for canvas sketches) is generated for your example. To tune
   or skip that capture, drop a `preview.json` next to your `index.html` (see
   [`scripts/README.md`](scripts/README.md)).

## How the gallery works

The [interactive gallery](https://makeabilitylab.github.io/p5js/) is auto-generated on every push to `main` by a GitHub Actions workflow. Here's how it's set up (see [`scripts/README.md`](scripts/README.md) for the full pipeline):

**[`scripts/capture_previews.mjs`](scripts/capture_previews.mjs)** drives a headless browser (Playwright + ffmpeg) to capture a thumbnail for each example — an animated WebP loop for canvas sketches, a static poster otherwise — into `previews/`. It content-hashes each example and **skips unchanged ones**, so previews are generated once and only regenerated when that example's code changes.

**[`scripts/build_gallery.py`](scripts/build_gallery.py)** walks the repo, finds every folder containing an `index.html`, groups them by category and subcategory, and writes a self-contained `index.html` at the repo root. Each card uses the captured preview, falling back to a static poster, a hand-added `screenshot.*`, or a category emoji. Configuration (excluded directories, branch name, repo URL) is defined as constants at the top of the script.

**[`.github/workflows/build-gallery.yml`](.github/workflows/build-gallery.yml)** runs both scripts and commits the generated `index.html` and `previews/` back to `main`. The `[skip ci]` tag in the commit message prevents an infinite loop. (Preview generation needs Node + ffmpeg, but **running the examples needs neither** — they load p5.js from CDN.)

**GitHub Pages** is configured under Settings → Pages to deploy from the `main` branch at `/` (root). No special "GitHub Actions" source setting is needed — the workflow simply commits the file to the branch that Pages already serves.

To replicate this pattern in another repo, you need three things: the build script (adapted for your folder structure), the workflow file, and Pages set to "Deploy from a branch" pointing at your default branch.

## Related repositories

- **[makeabilitylab/js](https://github.com/makeabilitylab/js)** — Makeability Lab JavaScript library (serial, math, graphics, logo modules)
- **[makeabilitylab/arduino](https://github.com/makeabilitylab/arduino)** — Arduino sketches that pair with the Web Serial examples
- **[Physical Computing course](https://makeabilitylab.github.io/physcomp/)** — Full course website with lessons, labs, and references

## License

[MIT](LICENSE)