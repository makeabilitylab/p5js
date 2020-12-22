// TODO: write description
// Based on:
// - Coding Train "Dot Product and Scalar Projection": 
//   https://youtu.be/_ENEsV_kNx8
//


let lineSegmentXAxis;

let lineSegmentRed;
let lineSegmentBlue = null;

function setup() {
  createCanvas(400, 400);
  let centerX = width / 2;
  let centerY = height / 2;
  lineSegmentRed = new LineSegment(centerX, centerY, mouseX, mouseY);
  lineSegmentRed.strokeColor = color(200, 0, 0);
  // lineSegmentRed.drawTextAngle = false;

  lineSegmentXAxis = new LineSegment(centerX, centerY, width * 0.9, centerY);

  lineSegmentXAxis.strokeColor = color(120, 120, 120, 50);
  lineSegmentXAxis.isDashedLine = true;
  lineSegmentXAxis.drawTextMagnitude = false;
}

function draw() {
  background(220);

  lineSegmentXAxis.draw();

  if (lineSegmentBlue == null) {
    lineSegmentRed.x2 = mouseX;
    lineSegmentRed.y2 = mouseY;
  } else if (lineSegmentBlue.frozen != true) {
    lineSegmentBlue.x2 = mouseX;
    lineSegmentBlue.y2 = mouseY;

  }

  lineSegmentRed.draw();

  LineSegment.drawAngleArcs(lineSegmentXAxis, lineSegmentRed, lineSegmentRed.strokeColor, 80, 50);

  if (lineSegmentBlue) {
    lineSegmentBlue.draw();
    LineSegment.drawAngleArcs(lineSegmentRed, lineSegmentBlue, lineSegmentBlue.strokeColor, 150, 120);
  }


}

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

function mousePressed(event) {
  // Reset with right mouse click
  if (mouseButton === RIGHT) {
    lineSegmentBlue = null;
    lineSegmentRed.frozen = false;
  }
}

// disable right click
document.oncontextmenu = function () {
  return false;
}

