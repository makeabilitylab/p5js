// A basic painting example with the mouse
//
// By Jon Froehlich
// http://makeabilitylab.io
// 
// See:
//  - https://medium.com/comsystoreply/introduction-to-p5-js-9a7da09f20aa
//  - https://learning.oreilly.com/library/view/make-getting-started/9781457186769/ch05.html#response


// Set the brush color and paint the initial background (drawn once so the
// trail accumulates rather than being cleared each frame).
function setup() {
  createCanvas(600, 400);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A drawing canvas where moving the mouse paints a trail of semi-transparent purple circles.");
  fill(200, 0, 200, 150);
  background(204);
  noStroke();
}

// Each frame: stamp a circle at the mouse position (no background clear, so
// the circles build up into a painted trail).
function draw() {
  ellipse(mouseX, mouseY, 20);
}

