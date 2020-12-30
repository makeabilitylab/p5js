

let angle = 0;
let boxSize = 10;
let boxMargin = 2;

const maxColor = 255;
const numCols = 10;
let colorStep = maxColor / numCols;

let pFrameRate;
let myFont;

let selectedColor;

let colorAxes3D;
let colorCube3D;

let redGreenColorPanel;
let redBlueColorPanel;
let greenBlueColorPanel;

function preload() {
  //font = textFont("Inconsolata");
  myFont = loadFont('assets/AvenirNextLTPro-Demi.ttf');
}

function setup() {
  createCanvas(500, 400);
  //debugMode();
  pFrameRate = createP('Framerate');
  textFont(myFont);

  // colorCube3D = new ColorCube3D(boxSize, boxMargin, maxColor, colorStep);
  // colorAxes3D = new ColorAxes3D(colorCube3D.calcSize() * 1.2, boxSize, boxMargin, maxColor, colorStep);
  selectedColor = color(0);

  let xColorPanel = 0;
  let yColorPanel = 0;
  let wColorPanel = width / 4;
  redGreenColorPanel = new ColorPanel2D(xColorPanel, yColorPanel, wColorPanel, height, ColorAxes2D.RED_GREEN);

  xColorPanel += wColorPanel;
  redBlueColorPanel = new ColorPanel2D(xColorPanel, yColorPanel, wColorPanel, height, ColorAxes2D.RED_BLUE);

  xColorPanel += wColorPanel;
  greenBlueColorPanel = new ColorPanel2D(xColorPanel, yColorPanel, wColorPanel, height, ColorAxes2D.GREEN_BLUE);
}

function draw() {
  background(100);

  // colorAxes3D.draw();
  // colorCube3D.draw();
  //draw3DColorGrid();

  // orbitControl();
  pFrameRate.html(nfc(frameRate(), 1) + " fps");

  redGreenColorPanel.draw();
  redBlueColorPanel.draw();
  greenBlueColorPanel.draw();
}

// Enum formulation from: https://stackoverflow.com/a/44447975/388117
const ColorAxes2D = Object.freeze({
  RED_GREEN: Symbol("Red-green"),
  RED_BLUE: Symbol("Red-blue"),
  GREEN_BLUE: Symbol("Green-blue")
});

class ColorPanel2D {

  constructor(x, y, width, height, colorAxes2D) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;

    this.colorAxes = colorAxes2D;
    this.selectedColor = color(0);
  }

  getRight(){
    return this.x + this.width;
  }

  getBottom(){
    return this.y + this.height;
  }

  /**
   * Returns the closest pixel to the given color
   * 
   * @param {p5.Color} col  
   */
  getPixelForColor(col) {

  }

  getColorForPixel(x, y) {
    let x_c = map(x, this.x, this.getRight(), 0, 255);

    // TODO: have to use getBottom()
    let y_c = map(y, this.height, this.y, 0, 255);

    let other_c;
    switch (this.colorAxes) {
      case ColorAxes2D.RED_GREEN:
        other_c = blue(this.selectedColor);
        return color(x_c, y_c, other_c);
      case ColorAxes2D.RED_BLUE:
        other_c = green(this.selectedColor);
        return color(x_c, other_c, y_c);
      case ColorAxes2D.GREEN_BLUE:
        other_c = red(this.selectedColor);
        return color(other_c, y_c, x_c);
    }


  }

  draw() {

    // TODO: to speed this up, access pixels directly OR paint via CreateGraphics
    push();
    strokeWeight(1);
    for (let x = this.x; x < this.getRight(); x++) {
      for (let y = this.y; y < this.getBottom(); y++) {
        let c = this.getColorForPixel(x, y);
        stroke(c);
        point(x, y);
      }
    }
    pop();

  }
}
