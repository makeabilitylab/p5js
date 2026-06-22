// A simple one dimensional animation of a circle bouncing back and forth
//
// By Jon Froehlich
// http://makeabilitylab.io
// 
// See:
//  - https://learning.oreilly.com/library/view/make-getting-started/9781457186769/ch08.html#motion


let x;
let y;
let xSpeed = 3; // moves 3 pixels per frame
let diameter = 40;

// Place the circle at the canvas center and set its appearance.
function setup() {
  createCanvas(400, 400);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A red circle that moves horizontally and bounces back and forth between the left and right edges of the canvas.");
  x = width / 2;
  y = height / 2;
  fill(200, 0, 0);
  noStroke();
}

// Each frame: move the circle horizontally, then reverse direction at the walls.
function draw() {
  background(220);
  x += xSpeed;
  ellipse(x, y, diameter);
  
  // check to make sure it doesn't go offscreen
  let radius = diameter / 2;
  if(x - radius < 0 || x + radius > width){
    xSpeed = xSpeed * -1;
  }
}