// A sketch that demonstrates how to calculate angles between vectors 
//
// For more on vectors, see the Coding Train's "Dot Product and Scalar Projection": 
// https://youtu.be/_ENEsV_kNx8
//
// By Jon E. Froehlich
// UW CSE Professor
// http://makeabilitylab.cs.uw.edu
//
//

let lineSegmentXAxis;
let lineSegmentRed;
let lineSegmentBlue = null;

// Create the gray x-axis reference line and the red vector that tracks the mouse.
function setup() {
  createCanvas(400, 400);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("An interactive vector-angle demo: a red arrow follows the mouse from the center against a gray horizontal x-axis, with arcs showing the angle between them; click to freeze the red arrow and draw a blue arrow whose angle to the red one is also arced, and right-click to reset.");
  let centerX = width / 2;
  let centerY = height / 2;
  lineSegmentRed = new LineSegment(centerX, centerY, mouseX, mouseY);
  lineSegmentRed.strokeColor = color(200, 0, 0);
  // lineSegmentRed.drawTextAngle = false;

  lineSegmentXAxis = new LineSegment(centerX, centerY, width * 0.9, centerY);

  lineSegmentXAxis.strokeColor = color(120, 120, 120, 50);
  lineSegmentXAxis.isDashedLine = true;
  lineSegmentXAxis.drawTextMagnitude = false;

  createP('Right-click to reset.');
}

// Each frame: aim the "live" vector at the mouse, then draw both vectors and
// the arcs marking the angle between them.
function draw() {
  background(220);

  // Draw title and info
  // textSize(18);
  noStroke();
  fill(150);
  text("Angle Explorer", 10, 20);

  // Draw the light gray x-axis line segment
  lineSegmentXAxis.draw();

  // We use whether lineSegmentBlue is null for state tracking
  // If null, then use mouseX and mouseY for lineSegmentRed
  // Otherwise, use for lineSegmentBlue
  if (lineSegmentBlue == null) {
    lineSegmentRed.x2 = mouseX;
    lineSegmentRed.y2 = mouseY;
  } else if (lineSegmentBlue.frozen != true) {
    lineSegmentBlue.x2 = mouseX;
    lineSegmentBlue.y2 = mouseY;
  }

  // Draw red line segment and angle arcs
  lineSegmentRed.draw();
  LineSegment.drawAngleArcs(lineSegmentXAxis, lineSegmentRed, lineSegmentRed.strokeColor, 80, 50);

  // Draw blue line segment and angle arcs (if not null)
  if (lineSegmentBlue) {
    lineSegmentBlue.draw();
    LineSegment.drawAngleArcs(lineSegmentRed, lineSegmentBlue, lineSegmentBlue.strokeColor, 150, 120);
  }
}

// First click freezes the red vector and starts the blue one; second click
// freezes the blue vector so its angle to red stays put.
function mouseClicked() {
  if (lineSegmentRed.frozen != true) {
    lineSegmentRed.frozen = true;
    lineSegmentBlue = new LineSegment(lineSegmentRed.x1, lineSegmentRed.y1,
      mouseX, mouseY);
    lineSegmentBlue.strokeColor = color(0, 0, 240);
  } else if (lineSegmentBlue.frozen != true) {
    lineSegmentBlue.frozen = true;
  }
}

// Right-click resets: unfreeze the red vector and clear the blue one.
function mousePressed(event) {
  if (mouseButton === RIGHT) {
    lineSegmentBlue = null;
    lineSegmentRed.frozen = false;
  }
}

// disable right click
document.oncontextmenu = function () {
  return false;
}

