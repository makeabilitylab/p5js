/**
 * 
 * TODO:
 * - [done] Draw grid (for debugging)
 * - [done] Draw axes
 * - [done] Draw axes ticks and tick labels
 * - [done] Allow cube selection (via keyboard)
 * - [] Show 2D slices (allow those to be interactive), which will change cursor in cube
 *      - Will need to run multiple p5 sketches though? With 2D slices rendered elsewhere? And immune to orbit control camera?
 * - [] When a cube is selected, highlight axis point as well (in white?) Maybe with tick or arrow?
 * - [] Show selected color in text (somewhere... maybe overlay as div)
 * - [] Convert library to instance mode? https://discourse.processing.org/t/how-to-adapt-a-library-for-instance-mode-p5js/11775
 * - [] Try texture mapped version where we draw just one large cube where the faces are textured based
 *      on current selected color and slice?
 */

let pFrameRate;
let myFont;

let colorAxes3D;
let colorCube3D;

function preload() {
  //font = textFont("Inconsolata");
  myFont = loadFont('assets/AvenirNextLTPro-Demi.ttf');
}

function setup() {
  createCanvas(500, 400, WEBGL);
  //debugMode();
  pFrameRate = createP('Framerate');
  textFont(myFont);

  const boxSize = 10;
  const boxMargin = 2;
  const numCols = 10;


  colorCube3D = new ColorCube3D(0, 0, 0);
  colorAxes3D = new ColorAxes3D(colorCube3D.width * 1.2, numCols, boxSize, boxMargin);
  colorCube3D.on(ColorEvents.NEW_HOVER_COLOR, onNewHoverColorEvent);
  colorCube3D.on(ColorEvents.NEW_SELECTED_COLOR, onNewSelectedColorEvent);
}

function onNewHoverColorEvent(sender, newHoverColor) {
  print("onNewHoverColorEvent", sender, newHoverColor);
}

function onNewSelectedColorEvent(sender, newSelectedColor){
  print("onNewSelectedColorEvent", sender, newSelectedColor);
}

function draw() {
  background(100);
  fill(255);

  colorAxes3D.draw();
  colorCube3D.draw();
  //draw3DColorGrid();

  orbitControl();
  pFrameRate.html(nfc(frameRate(), 1) + " fps");
}

function keyPressed() {
  colorCube3D.keyPressed();
}
