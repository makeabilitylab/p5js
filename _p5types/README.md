# Vendored p5.js type definitions

These are the [DefinitelyTyped](https://github.com/DefinitelyTyped/DefinitelyTyped)
TypeScript definitions for p5.js, vendored here so VS Code IntelliSense works
**with no toolchain** — no npm, no `npm install`, no build step. The root
`jsconfig.json` includes `global.d.ts`, which augments the global scope so
p5's global-mode functions (`createCanvas`, `ellipse`, `fft`, …) autocomplete
in every sketch.

- **Source:** `@types/p5`
- **Version:** 1.7.7 (the newest `@types/p5` for the p5 1.x line; p5 2.0 ships
  its own types separately)

## Refreshing to a newer version (npm-free)

```bash
# Find the latest version
curl -s https://registry.npmjs.org/@types/p5 | python3 -c "import sys,json;print(json.load(sys.stdin)['dist-tags']['latest'])"

# Download + extract (tarball top dir is ./p5)
curl -sL https://registry.npmjs.org/@types/p5/-/p5-<VERSION>.tgz | tar -xz

# Replace the type files here (keep this README + LICENSE)
rm -rf constants.d.ts global.d.ts index.d.ts literals.d.ts lib src
cp -R p5/constants.d.ts p5/global.d.ts p5/index.d.ts p5/literals.d.ts p5/lib p5/src p5/LICENSE .
```

Do not hand-edit the `.d.ts` files — they are auto-generated upstream.
