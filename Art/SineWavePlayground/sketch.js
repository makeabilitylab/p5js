//
// Sine-wave playground: fills the bottom of the canvas with a wavy shape built by
// summing two sine waves — a fast, small ripple plus a slow, larger swell. A nice
// starting point for experimenting with frequency, amplitude, and Perlin noise.
//

let bottomColor;

// Set up the canvas and the HSB fill color used for the wave shape.
function setup() {
  createCanvas(800, 400);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A wavy translucent shape filling the bottom of the canvas, formed by combining two sine waves of different frequencies.");
  colorMode(HSB, 255);
  bottomColor = color(10, 128, 128);
}

// Each frame: trace one vertex per column across the width, where the wave height
// y is the sum of the two sine terms, then close the shape down to the bottom edge.
function draw() {
  background(220);

  beginShape();
  vertex(0, height);
  fill(hue(bottomColor), 255 * 0.2, 255 * 0.7, 200);
  for (let x = 0; x < width; x++) {
    //var angle = map(x, 0, width, 0, TWO_PI);
    let angle = x * 0.1;
    // map x between 0 and width to 0 and Two Pi
    let y = map(abs(sin(angle)), 0, 1, 0, 10);

    let angle2 = x * 0.01;
    let y2 = map(sin(angle2), -1, 1, 0, 30);
    y += y2;

    let nx = map(x, 0, width, 0, 3);
    //y += 50 + 60 * noise(nx);
    vertex(x, height - y);
  }
  vertex(width, height);
  endShape();
}