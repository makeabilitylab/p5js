var rgbColorPickerPanel;

function setup() {
  createCanvas(600, 120);

  rgbColorPickerPanel = new RgbColorPickerPanel(0, 0, width, height);
  rgbColorPickerPanel.on(ColorEvents.NEW_HOVER_COLOR, onNewHoverColorEvent);
  rgbColorPickerPanel.on(ColorEvents.NEW_SELECTED_COLOR, onNewSelectedColorEvent);
}

function onNewHoverColorEvent(sender, newHoverColor) {
  parent.broadcastNewHoverColor(sender, newHoverColor);
}

function onNewSelectedColorEvent(sender, newSelectedColor){
  //print("I'm here in that iframe!");
  //setSelectedColor(newSelectedColor, true);
  //print("color-picker-2d onNewSelectedColorEvent", sender, newSelectedColor);
  parent.broadcastNewSelectedColor(sender, newSelectedColor);
}

function draw() {
  background(0);

  rgbColorPickerPanel.draw();
}

function mouseMoved(){
  rgbColorPickerPanel.mouseMoved();
}

function mousePressed(){
  rgbColorPickerPanel.mousePressed();
}

function keyPressed(){
  rgbColorPickerPanel.keyPressed();
}