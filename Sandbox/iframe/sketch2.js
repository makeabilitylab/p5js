var g_test;

function setup() {
  createCanvas(320, 220);
  g_test = "hello!";
  parent.g_test2 = g_test; // https://stackoverflow.com/a/7647123
  parent.strokeColor = color(255, 0, 255);
}

function draw() {
  background(220);
  stroke(parent.strokeColor);
  fill(0);
  ellipse(width/2, height/2, parent.ellipseSize);
}
