let _ballSize = 50;
let _ballFillColor = null;
let DEFAULT_HEIGHT = 400;
let DEFAULT_WIDTH = 400;
let _autoFillDiv = false;
var canvas = null;

function setup() {
  canvas = createCanvas(DEFAULT_WIDTH, DEFAULT_HEIGHT);

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

function draw() {
  background(220);
  fill(_ballFillColor);
  circle(width/2, height/2, _ballSize);
}

function ballSizeChanged(src, e){
  print("ballSizeChanged", src, e);
  _ballSize = src.value;
  redraw();
}

function ballColorChanged(src, e){
  print("ballColorChanged", src, e);
  _ballFillColor = src.value;
  redraw();
}

function autoFillDivChanged(src, e){
  print("autoFillDivChanged", src, e);
  _autoFillDiv = src.checked;
  resizeCanvasEvent();
}

function fullScreenModeChanged(src, e){
  print("fullScreenModeChanged", src, e);
  fullscreen(src.checked);
  resizeCanvasEvent();
  redraw();
}

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

window.onresize = function() {
  print("onresize event");
  resizeCanvasEvent();
}
