/**
 * A simple flower
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/


// Set up the canvas and switch to degrees so the petal rotation reads naturally.
function setup() {
  createCanvas(600, 400);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A flower made of rainbow-colored translucent ellipses rotated around the center of a dark canvas.");

  angleMode(DEGREES);
}

// Draw the flower: from the center, rotate by angleStep and stamp a translucent
// ellipse "petal" each step, sweeping the hue through 360 degrees for a rainbow.
function draw() {
  background(10);

  push();
  colorMode(HSB);
  const angleStep = 10;

  ellipseMode(CORNER);
  translate(width / 2, height / 2);
  for(let angle = 0; angle < 360; angle += angleStep){
    const hue = angle;
    stroke(hue, 100, 100, 0.8);
    fill(hue, 100, 100, 0.2);
    rotate(angleStep);
    ellipse(0, 0, 150, 50);
  }
  noStroke();

  // ellipseMode(CENTER);
  // fill(44, 100, 100, 0.8);
  // circle(0, 0, 18)
  pop();
}