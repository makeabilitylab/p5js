// NOTE: Intentional variant of Color/ColorExplorer3D/color-picker-2d.js, with
// added mouse drag/release handling for this demo. Kept separate on purpose —
// please don't auto-consolidate.

var rgbColorPickerPanel;

function setup() {
  createCanvas(600, 120);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A 2D RGB color picker panel that lets you choose a color with the mouse or keyboard.");

  rgbColorPickerPanel = new RgbColorPickerPanel(0, 0, width, height);
  rgbColorPickerPanel.setShowHoverColor(false);
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