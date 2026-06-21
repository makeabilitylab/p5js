// NOTE: Intentional variant of Color/ColorExplorer3D/color-cube.js, trimmed
// and tuned for this auto-fade demo (no keyboard nav / console output). Kept
// separate on purpose — please don't auto-consolidate.

let myFont;

var colorCube3D;

function preload() {
  //font = textFont("Inconsolata");
  myFont = loadFont('assets/AvenirNextLTPro-Demi.ttf');
}

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

function onNewHoverColorEvent(sender, newHoverColor) {
  print("color-cube onNewHoverColorEvent", sender, newHoverColor);
}

function onNewSelectedColorEvent(sender, newSelectedColor) {
  print("color-cube onNewSelectedColorEvent", sender, newSelectedColor);
  parent.broadcastNewSelectedColor(sender, newSelectedColor);
}

function draw() {
  background(100);

  colorCube3D.draw();

  orbitControl();
}
