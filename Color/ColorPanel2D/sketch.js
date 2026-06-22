//
// A 2D RGB color picker built from several cooperating panel classes:
// three channel sliders (R/G/B), three 2D color planes (red-green, red-blue,
// green-blue), and three solid swatches (previous/current/hover). Picking a
// color in any panel updates all the others via a small event system.
//
// The panel classes live in the other files in this folder:
//   color-panel.js        - Panel base + ColorPanel (event plumbing, color utils)
//   color-slider-panel.js - 1D channel sliders (Thumb, Track, ColorSliderPanel)
//   color-panel-2d.js     - 2D color planes (ColorPanel2D)
//   color-picker-panel.js - RgbColorPickerPanel (lays out + wires up everything)
//                           and SolidColorPanel (a single swatch)
//
// By Professor Jon E. Froehlich
// https://jonfroehlich.github.io/
// http://makeabilitylab.cs.washington.edu
//

let pFrameRate;
let rgbColorPickerPanel;

// Create the framerate readout and the full RGB color picker panel.
function setup() {
  createCanvas(500, 100);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A 2D RGB color picker panel that lets you choose a color with the mouse or keyboard.");

  pFrameRate = createP('Framerate');
  selectedColor = color(0);

  rgbColorPickerPanel = new RgbColorPickerPanel(0, 0, width, height);
}

// Each frame: redraw the picker and update the framerate readout.
function draw() {
  background(0);

  rgbColorPickerPanel.draw();
  pFrameRate.html(nfc(frameRate(), 1) + " fps");
}

// Forward mouse/keyboard events to the picker, which routes them to the
// panel under the cursor.
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
