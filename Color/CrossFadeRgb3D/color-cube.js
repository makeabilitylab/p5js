// NOTE: Intentional variant of Color/ColorExplorer3D/color-cube.js, trimmed
// and tuned for this auto-fade demo (no keyboard nav / console output). Kept
// separate on purpose — please don't auto-consolidate.

// 3D RGB color cube for the cross-fade demo: the cube auto-fades through colors
// and highlights the current one (no keyboard nav, hover bar, or background).
// The ColorCube3D class lives in the Makeability Lab color library; this file
// wires up the p5 lifecycle and forwards events to the parent page (iframe).

let myFont;

var colorCube3D;

// Load the label font before setup() runs.
function preload() {
  //font = textFont("Inconsolata");
  myFont = loadFont('assets/AvenirNextLTPro-Demi.ttf');
}

// Build the cube (17 cols), disable the hover bar/background, and subscribe to
// its color events.
function setup() {
  createCanvas(600, 400, WEBGL);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("An interactive 3D RGB color cube made of small colored boxes that you can rotate with the mouse, highlighting the color it auto-fades through.");
  //debugMode();
  textFont(myFont);

  const boxSize = 10;
  const boxMargin = 2;
  const numCols = 10;

  colorCube3D = new ColorCube3D(0, 0, 0, 17);
  colorCube3D.showHoverColor = false;
  colorCube3D.showBackground = false;
  colorCube3D.on(ColorEvents.NEW_HOVER_COLOR, onNewHoverColorEvent);
  colorCube3D.on(ColorEvents.NEW_SELECTED_COLOR, onNewSelectedColorEvent);
}

// Fired when the highlighted (auto-faded) color changes.
function onNewHoverColorEvent(sender, newHoverColor) {
  print("color-cube onNewHoverColorEvent", sender, newHoverColor);
}

// Fired when a color is selected; relay it up to the embedding page.
function onNewSelectedColorEvent(sender, newSelectedColor) {
  print("color-cube onNewSelectedColorEvent", sender, newSelectedColor);
  parent.broadcastNewSelectedColor(sender, newSelectedColor);
}

// Each frame: clear to gray, draw the cube, and let orbitControl() handle
// mouse rotation/zoom.
function draw() {
  background(100);

  colorCube3D.draw();

  orbitControl();
}
