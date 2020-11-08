var _ballSize = 50;
var _ballFillColor = null;

function setup() {
  let canvas = createCanvas(400, 400);

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
  noLoop();
}

function draw() {
  background(220);
  fill(_ballFillColor);
  circle(width/2, height/2, _ballSize);
}

function sizeChanged(src, e){
  print("sizeChanged event: ");
  print(src);
  print(e);
  _ballSize = src.value;
  redraw();
}

function colorChanged(src, e){
  print("colorChanged event: ");
  print(src);
  print(e);
  _ballFillColor = src.value;
  redraw();
}
