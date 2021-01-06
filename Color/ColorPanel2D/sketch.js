let pFrameRate;
let rgbColorPickerPanel;

function setup() {
  createCanvas(500, 100);

  pFrameRate = createP('Framerate');
  selectedColor = color(0);

  rgbColorPickerPanel = new RgbColorPickerPanel(0, 0, width, height);
}

function draw() {
  background(0);

  rgbColorPickerPanel.draw();
  pFrameRate.html(nfc(frameRate(), 1) + " fps");
}

function mousePressed(){
  rgbColorPickerPanel.mousePressed();
}

function mouseReleased(){
  rgbColorPickerPanel.mouseReleased();
}

function mouseDragged(){
  rgbColorPickerPanel.mouseDragged();
}

function mouseMoved(){
  rgbColorPickerPanel.mouseMoved();
}

function keyPressed(){
  rgbColorPickerPanel.keyPressed();
}
