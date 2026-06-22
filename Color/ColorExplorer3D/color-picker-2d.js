// 2D RGB color-picker companion to the 3D cube: a horizontal panel you scrub
// with the mouse or keyboard to choose a color. The RgbColorPickerPanel class
// lives in the Makeability Lab color library; this file wires up the p5
// lifecycle and forwards color events to the parent page (runs in an iframe).

var rgbColorPickerPanel;

// Build the picker panel and subscribe to its hover/selected color events.
function setup() {
  createCanvas(600, 120);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A 2D RGB color picker panel that lets you choose a color with the mouse or keyboard.");

  rgbColorPickerPanel = new RgbColorPickerPanel(0, 0, width, height);
  rgbColorPickerPanel.on(ColorEvents.NEW_HOVER_COLOR, onNewHoverColorEvent);
  rgbColorPickerPanel.on(ColorEvents.NEW_SELECTED_COLOR, onNewSelectedColorEvent);
}

// Relay hover/selected color changes up to the embedding page.
function onNewHoverColorEvent(sender, newHoverColor) {
  parent.broadcastNewHoverColor(sender, newHoverColor);
}

function onNewSelectedColorEvent(sender, newSelectedColor){
  //print("I'm here in that iframe!");
  //setSelectedColor(newSelectedColor, true);
  //print("color-picker-2d onNewSelectedColorEvent", sender, newSelectedColor);
  parent.broadcastNewSelectedColor(sender, newSelectedColor);
}

// Each frame: clear to black and redraw the picker panel.
function draw() {
  background(0);

  rgbColorPickerPanel.draw();
}

// Forward mouse/keyboard input to the panel for hovering and selecting.
function mouseMoved(){
  rgbColorPickerPanel.mouseMoved();
}

function mousePressed(){
  rgbColorPickerPanel.mousePressed();
}

function keyPressed(){
  rgbColorPickerPanel.keyPressed();
}