var rgbColorPickerPanel;

function setup() {
  createCanvas(500, 100);

  rgbColorPickerPanel = new RgbColorPickerPanel(0, 0, width, height);
  rgbColorPickerPanel.on(ColorEvents.NEW_HOVER_COLOR, onNewHoverColorEvent);
  rgbColorPickerPanel.on(ColorEvents.NEW_SELECTED_COLOR, onNewSelectedColorEvent);
}

function onNewHoverColorEvent(sender, newHoverColor) {

}

function onNewSelectedColorEvent(sender, newSelectedColor){
  //print("I'm here in that iframe!");
  //setSelectedColor(newSelectedColor, true);
  print("color-picker-2d onNewSelectedColorEvent", sender, newSelectedColor);
  parent.broadcastNewSelectedColor(sender, newSelectedColor);
}

function draw() {
  background(0);

  // if (parent.selectedColor && !parent.areColorLevelsEqual(selectedColor, parent.selectedColor)) {
  //   print("color-panel: new selected color from parent!", parent.selectedColor);
  //   let c = color(parent.selectedColor.levels[0],
  //     parent.selectedColor.levels[1],
  //     parent.selectedColor.levels[2],
  //     parent.selectedColor.levels[3]);
  //   setSelectedColor(c);
  // }

  rgbColorPickerPanel.draw();
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