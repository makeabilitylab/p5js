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


let myFont;

var colorCube3D;
let hoverColor;

function preload() {
  //font = textFont("Inconsolata");
  myFont = loadFont('assets/AvenirNextLTPro-Demi.ttf');
  hoverColor = color(100);
}

function setup() {
  createCanvas(600, 400, WEBGL);
  //debugMode();
  textFont(myFont);

  const boxSize = 10;
  const boxMargin = 2;
  const numCols = 10;

  colorCube3D = new ColorCube3D(0, 0, 0);
  colorCube3D.on(ColorEvents.NEW_HOVER_COLOR, onNewHoverColorEvent);
  colorCube3D.on(ColorEvents.NEW_SELECTED_COLOR, onNewSelectedColorEvent);

  colorCube3D.setSelectedColor(color(100));
}

function onNewHoverColorEvent(sender, newHoverColor) {
  print("color-cube onNewHoverColorEvent", sender, newHoverColor);
  //hoverColor = ColorPanel.parseColor(newHoverColor);
}

function onNewSelectedColorEvent(sender, newSelectedColor) {
  print("color-cube onNewSelectedColorEvent", sender, newSelectedColor);
  parent.broadcastNewSelectedColor(sender, newSelectedColor);
}

function draw() {
  //background(hoverColor);
  background(colorCube3D.selectedColor);

  colorCube3D.draw();

  orbitControl();
}

function keyPressed() {
  colorCube3D.keyPressed();
}
