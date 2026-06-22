/**
 * 
 * TODO:
 * - [done] Draw grid (for debugging)
 * - [done] Draw axes
 * - [done] Draw axes ticks and tick labels
 * - [done] Allow cube selection (via keyboard)
 * - [] Show 2D slices (allow those to be interactive), which will change cursor in cube
 *      - Will need to run multiple p5 sketches though? With 2D slices rendered elsewhere? And immune to orbit control camera?
 * - [] When a cube is selected, highlight axis point as well (in white?)
 * - [] Show selected color in text (somewhere... maybe overlay as div)
 * - [] Convert library to instance mode? https://discourse.processing.org/t/how-to-adapt-a-library-for-instance-mode-p5js/11775
 * - [] Add hover support
 */


// Interactive 3D RGB color explorer: a cube of small colored boxes (one per
// sampled RGB value) that you rotate with the mouse (orbitControl) and navigate
// with the keyboard to hover/select a color. The ColorCube3D class lives in the
// Makeability Lab color library; this file just wires up the p5 lifecycle and
// forwards color events to the parent page (the cube renders inside an iframe).

let myFont;

var colorCube3D;
let hoverColor;

// Load the label font and pick the initial hover color before setup() runs.
function preload() {
  //font = textFont("Inconsolata");
  myFont = loadFont('assets/AvenirNextLTPro-Demi.ttf');
  hoverColor = color(100);
}

// Build the cube, subscribe to its color events, and print usage help once.
function setup() {
  createCanvas(600, 400, WEBGL);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("An interactive 3D RGB color cube made of small colored boxes that you can rotate with the mouse and navigate with the keyboard to select a color.");
  //debugMode();
  textFont(myFont);

  const boxSize = 10;
  const boxMargin = 2;
  const numCols = 10;

  colorCube3D = new ColorCube3D(0, 0, 0);
  colorCube3D.on(ColorEvents.NEW_HOVER_COLOR, onNewHoverColorEvent);
  colorCube3D.on(ColorEvents.NEW_SELECTED_COLOR, onNewSelectedColorEvent);

  colorCube3D.setSelectedColor(color(100));

  print("The default cube size is", colorCube3D.numCols)
  print("To create a more granular cube, type: getColorCube().setNumCols(<num cols>);")
  print("For example, getColorCube().setNumCols(20);")
  print("");
  print("With the cube selected and in focus...")
  print("You can navigate the cube with arrow keys and space bar (shift+space to go back)");
  print("Hit esc to hide the hover bar");
}

// Fired when the cursor moves to a new box (the hovered color changed).
function onNewHoverColorEvent(sender, newHoverColor) {
  print("color-cube onNewHoverColorEvent", sender, newHoverColor);
  //hoverColor = ColorPanel.parseColor(newHoverColor);
}

// Fired when a color is selected; relay it up to the embedding page.
function onNewSelectedColorEvent(sender, newSelectedColor) {
  print("color-cube onNewSelectedColorEvent", sender, newSelectedColor);
  parent.broadcastNewSelectedColor(sender, newSelectedColor);
}

// Each frame: paint the background with the selected color, draw the cube, and
// let orbitControl() handle mouse rotation/zoom.
function draw() {
  //background(hoverColor);
  background(colorCube3D.selectedColor);

  colorCube3D.draw();

  orbitControl();
}

// Forward key presses to the cube for arrow-key/space-bar navigation.
function keyPressed() {
  colorCube3D.keyPressed();
}
