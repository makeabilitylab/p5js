

let pFrameRate;
let myFont;

let colorCube3D;

function preload() {
  //font = textFont("Inconsolata");
  myFont = loadFont('assets/AvenirNextLTPro-Demi.ttf');
}

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

function onNewHoverColorEvent(sender, newHoverColor) {
  print("onNewHoverColorEvent", sender, newHoverColor);
}

function onNewSelectedColorEvent(sender, newSelectedColor){
  print("onNewSelectedColorEvent", sender, newSelectedColor);
}

function draw() {
  background(100);
  fill(255);

  colorCube3D.draw();
  //draw3DColorGrid();

  orbitControl();
  pFrameRate.html(nfc(frameRate(), 1) + " fps");
}

function keyPressed() {
  colorCube3D.keyPressed();
}
