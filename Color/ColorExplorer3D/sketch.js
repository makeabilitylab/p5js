

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

let rgbColorPickerPanel;

function preload() {
  //font = textFont("Inconsolata");
  myFont = loadFont('assets/AvenirNextLTPro-Demi.ttf');
}

function setup() {
  createCanvas(500, 100);
  // pixelDensity(1);
  //debugMode();
  pFrameRate = createP('Framerate');
  textFont(myFont);

  // colorCube3D = new ColorCube3D(boxSize, boxMargin, maxColor, colorStep);
  // colorAxes3D = new ColorAxes3D(colorCube3D.calcSize() * 1.2, boxSize, boxMargin, maxColor, colorStep);
  selectedColor = color(0);

  rgbColorPickerPanel = new RgbColorPickerPanel(0, 0, width, height);
}

function draw() {
  background(0);

  // colorAxes3D.draw();
  // colorCube3D.draw();
  //draw3DColorGrid();

  // orbitControl();
  rgbColorPickerPanel.draw();
  pFrameRate.html(nfc(frameRate(), 1) + " fps");

  
}

function setSelectedColor(c){
  selectedColor = c;
  rgbColorPickerPanel.setSelectedColor(c);
}

// function getColorPanelAtCoords(x, y){
//   for(colorPanel of colorPanels){
//     if(colorPanel.contains(x, y)){
//       return colorPanel;
//     }
//   }
//   return null;
// }

function mousePressed(){
  let colorPanelAtMouse = rgbColorPickerPanel.getColorPanelAtCoords(mouseX, mouseY);
  if(colorPanelAtMouse){
    let c = colorPanelAtMouse.getColorForPixel(mouseX, mouseY, true);
    setSelectedColor(c);
  }
}

function mouseMoved(){
  let colorPanelAtMouse = rgbColorPickerPanel.getColorPanelAtCoords(mouseX, mouseY);
  if(colorPanelAtMouse){
    let c = colorPanelAtMouse.getColorForPixel(mouseX, mouseY, true);
    //setHoverColor(c);
    rgbColorPickerPanel.setHoverColor(c);
  }
}
