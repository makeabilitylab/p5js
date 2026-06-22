// A minimal p5.js starter scaffold. Copy this folder when beginning a new
// sketch, then build out setup() and draw().

// Run once at startup: create the canvas.
function setup() {
  createCanvas(400, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A blank dark gray canvas serving as a starting template for a p5.js sketch.");
}

// Each frame: clear to dark gray. Add your drawing code here.
function draw() {
  background(100);
}