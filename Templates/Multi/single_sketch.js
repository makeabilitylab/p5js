// Single-sketch example

function setup (){
  createCanvas (800, 600);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A white square that follows the mouse around a dark gray canvas; replace this description with one that describes your sketch.");
}

function draw(){
  background(100);
  fill(255);
  noStroke();
  rectMode(CENTER);
  rect(mouseX, mouseY, 50, 50);
}
