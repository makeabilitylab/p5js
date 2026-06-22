//
// Mixes a p5.js canvas with an HTML DOM sidebar (W3.CSS) of controls.
// The sidebar's range/color/checkbox inputs (in index.html) call the
// *Changed() handlers below to update the sketch, which has noLoop()-style
// redraw-on-event behavior. The sidebar open/close *toggle* logic lives in
// the inline <script> in index.html (openSidebar()/closeSidebar()), which
// shows/hides the #sidebar div and shifts the #main margin; the handlers here
// only react to the control values, not the toggle.
//

let _ballSize = 50;
let _ballFillColor = null;
let DEFAULT_HEIGHT = 400;
let DEFAULT_WIDTH = 400;
let _autoFillDiv = false;
var canvas = null;

// Create the canvas, place it inside the sketch-container div, and sync the
// sidebar's size slider max and color picker to the sketch's starting values.
function setup() {
  canvas = createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A single circle centered on the canvas whose size and color can be changed using the controls in the sidebar.");

  // Move the canvas so it’s inside our <div id="sketch-container">.
  canvas.parent('sketch-container');
  _ballFillColor = color(220, 0, 220);
 
  // Two different ways of accessing the same element. One is the p5js way
  // the other is the standard js way
  // print(select("#slider-size").attribute('max')); // p5 way
  // print(document.getElementById("slider-size").max); // standard js way
  document.getElementById("slider-size").max = min(width, height);

  let hexColor = "#" + hex(red(_ballFillColor),2) + hex(green(_ballFillColor),2) + hex(blue(_ballFillColor),2);
  document.getElementById("color-picker").value = hexColor;
  
  // Since there is no animation, we only need to redraw when we have a new event
  //noLoop();
}

// Draw the single circle, centered, using the current sidebar size/color.
function draw() {
  background(220);
  fill(_ballFillColor);
  circle(width/2, height/2, _ballSize);
}

// Sidebar size-slider handler: update ball diameter and redraw.
function ballSizeChanged(src, e){
  print("ballSizeChanged", src, e);
  _ballSize = src.value;
  redraw();
}

// Sidebar color-picker handler: update ball fill color and redraw.
function ballColorChanged(src, e){
  print("ballColorChanged", src, e);
  _ballFillColor = src.value;
  redraw();
}

// Sidebar "Auto-fill div" checkbox handler: toggle whether the canvas fills
// the window, then resize.
function autoFillDivChanged(src, e){
  print("autoFillDivChanged", src, e);
  _autoFillDiv = src.checked;
  resizeCanvasEvent();
}

// Sidebar "Full screen" checkbox handler: enter/exit fullscreen, then resize.
function fullScreenModeChanged(src, e){
  print("fullScreenModeChanged", src, e);
  fullscreen(src.checked);
  resizeCanvasEvent();
  redraw();
}

// Resize the canvas to either fill the window (auto-fill on) or the default
// size, then redraw.
function resizeCanvasEvent(){
  if(_autoFillDiv){
    // assigns new values for width and height variables
    w = window.innerWidth;
    h = window.innerHeight;  
    // canvas.size(w,h);
    resizeCanvas(w, h);
    print(w, h);
  }else{
    resizeCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT);
  }
  redraw();
}

// Re-fit the canvas whenever the browser window is resized.
window.onresize = function() {
  print("onresize event");
  resizeCanvasEvent();
}
