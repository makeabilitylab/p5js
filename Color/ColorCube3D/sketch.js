//
// Entry point for the interactive 3D RGB color-cube explorer (WEBGL).
// Sets up the cube, wires its color-change events to logging handlers, and
// each frame renders the cube and lets the mouse orbit the camera. The cube
// model and its axes live in color-cube-3d.js.
//

let pFrameRate;
let myFont;

let colorCube3D;

// Load the font used for the axis tick labels before setup() runs.
function preload() {
  //font = textFont("Inconsolata");
  myFont = loadFont('assets/AvenirNextLTPro-Demi.ttf');
}

// Create the WEBGL canvas, build the color cube, and subscribe to its events.
function setup() {
  createCanvas(500, 400, WEBGL);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("An interactive 3D RGB color cube made of small colored boxes that you can rotate with the mouse and navigate to hover and select colors.");
  //debugMode();
  pFrameRate = createP('Framerate');
  textFont(myFont);

  const boxSize = 10;
  const boxMargin = 2;
  const numCols = 10;


  colorCube3D = new ColorCube3D(0, 0, 0);
  colorCube3D.on(ColorEvents.NEW_HOVER_COLOR, onNewHoverColorEvent);
  colorCube3D.on(ColorEvents.NEW_SELECTED_COLOR, onNewSelectedColorEvent);
}

// Color-change event handlers (fired by the cube, not per-frame): log the new
// hover / selected color for debugging.
function onNewHoverColorEvent(sender, newHoverColor) {
  print("onNewHoverColorEvent", sender, newHoverColor);
}

function onNewSelectedColorEvent(sender, newSelectedColor){
  print("onNewSelectedColorEvent", sender, newSelectedColor);
}

// Each frame: clear, draw the cube, apply mouse orbit, and update the FPS readout.
function draw() {
  background(100);
  fill(255);

  colorCube3D.draw();
  //draw3DColorGrid();

  orbitControl();
  pFrameRate.html(nfc(frameRate(), 1) + " fps");
}

// Forward key presses to the cube so it can move the selected color.
function keyPressed() {
  colorCube3D.keyPressed();
}
