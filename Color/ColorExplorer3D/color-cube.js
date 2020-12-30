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
 */

let angle = 0;
let boxSize = 10;
let boxMargin = 2;

const maxColor = 255;
const numCols = 20;
let colorStep = maxColor / numCols;

let myFont;

let selectedColor;

let colorAxes3D;
let colorCube3D;

function preload() {
  //font = textFont("Inconsolata");
  myFont = loadFont('assets/AvenirNextLTPro-Demi.ttf');
}

function setup() {
  createCanvas(500, 400, WEBGL);
  //debugMode();
  textFont(myFont);

  colorCube3D = new ColorCube3D(boxSize, boxMargin, maxColor, colorStep);
  colorAxes3D = new ColorAxes3D(colorCube3D.calcSize() * 1.2, boxSize, boxMargin, maxColor, colorStep);
  selectedColor = color(0);
}

function draw() {
  background(100);

  colorAxes3D.draw();
  colorCube3D.draw();

  if(parent.selectedColor && !parent.areColorLevelsEqual(selectedColor, parent.selectedColor)){
    print("colorcube: new selected color from parent!", parent.selectedColor);
    let c = color(parent.selectedColor.levels[0],
        parent.selectedColor.levels[1],
        parent.selectedColor.levels[2],
        parent.selectedColor.levels[3]);
    setSelectedColor(c);
  }

  //draw3DColorGrid();

  orbitControl();
}

function calcSelectedCubeFromColor(col) {
  let x = (red(col) / colorStep) * (boxSize + boxMargin);
  let y = (green(col) / colorStep) * (boxSize + boxMargin);
  let z = (blue(col) / colorStep) * (boxSize + boxMargin);

  return {
    "x": x,
    "y": y,
    "z": z
  }
}

function setSelectedColor(c, callParent = false){
  selectedColor = c;
  colorCube3D.selectedColor = c;

  if(callParent){
      parent.setSelectedColor(c);
  }

}

function keyPressed() {

  let r = red(selectedColor);
  let g = green(selectedColor);
  let b = blue(selectedColor);

  switch (keyCode) {
    case LEFT_ARROW:
      r = max(0, red(selectedColor) - colorStep);
      break;
    case RIGHT_ARROW:
      r = min(maxColor, red(selectedColor) + colorStep);
      break;
    case UP_ARROW:
      g = min(maxColor, green(selectedColor) + colorStep);
      break;
    case DOWN_ARROW:
      g = max(0, green(selectedColor) - colorStep);
      break;
  }

  if(key === ' '){
    b = blue(selectedColor) + colorStep;
    if (b > maxColor){
      b = 0;
    }
  }

  let newSelectedColor = color(r, g, b);

  setSelectedColor(newSelectedColor, true);
}
