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
  lineSegmentRed.drawTextAngle = false;

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

  if (lineSegmentBlue) {
    lineSegmentBlue.draw();
  }

  push();
  noFill();
  stroke(lineSegmentRed.strokeColor);
  // drawingContext.setLineDash([1, 2]);
  translate(lineSegmentRed.x1, lineSegmentRed.y1);

  let redAngle = lineSegmentRed.getHeading();

  const arcSizePositiveAngle = 50;
  arc(0, 0, arcSizePositiveAngle, arcSizePositiveAngle, 0, redAngle);
  let arcMiddleV = p5.Vector.fromAngle(redAngle / 2, arcSizePositiveAngle * 0.6);

  //line(0, 0, arcMiddleV.x, arcMiddleV.y); //uncomment to see where text drawn
  noStroke();
  textSize(8);
  fill(lineSegmentRed.strokeColor);
  let redAngleDegrees = degrees(redAngle);
  let redAngleDegreesLabel = nfc(redAngleDegrees, 1) + "°";
  let labelWidth = textWidth(redAngleDegreesLabel);
  let xLabelOffset = labelWidth * redAngle / TWO_PI; // not needed with center align
  let yLabelOffset = (textSize() * 0.8) / 2;

  if (redAngle > PI) {
    yLabelOffset += yLabelOffset * (TWO_PI - redAngle) / PI;
  } else {
    yLabelOffset += yLabelOffset * redAngle / PI;
  }

  text(redAngleDegreesLabel, arcMiddleV.x - xLabelOffset, arcMiddleV.y + yLabelOffset);

  // another way to draw text with center align
  //textAlign(CENTER);
  //fill(0);
  //text(redAngleDegreesLabel, arcMiddleV.x, arcMiddleV.y  + yLabelOffset);

  // draw opposite arc
  const arcSizeNegativeAngle = 30;
  let negativeReadAngle = -(TWO_PI - redAngle);
  let negativeArcMiddleV = p5.Vector.fromAngle(negativeReadAngle / 2, arcSizeNegativeAngle * 0.7);

  let negativeArcColor = color(red(lineSegmentRed.strokeColor), green(lineSegmentRed.strokeColor), blue(lineSegmentRed.strokeColor));
  negativeArcColor.setAlpha(128);
  stroke(negativeArcColor);


  //drawingContext.setLineDash([]);
  //line(0, 0, negativeArcMiddleV.x, negativeArcMiddleV.y); //uncomment to see where text drawn
  noFill();
  drawingContext.setLineDash([2, 5]);
  arc(0, 0, arcSizeNegativeAngle, arcSizeNegativeAngle, redAngle, 0);

  // draw negative arc text
  noStroke();
  fill(negativeArcColor);
  let negativeRedAngleDegrees = degrees(negativeReadAngle);
  let negativeRedAngleDegreesLabel = nfc(negativeRedAngleDegrees, 1) + "°";
  labelWidth = textWidth(negativeRedAngleDegreesLabel);

  xLabelOffset = labelWidth * negativeReadAngle / TWO_PI; // not needed with center align
  yLabelOffset = (textSize() * 0.8) / 2;
  //print(negativeReadAngle);
  if (redAngle > PI) {
    yLabelOffset -= yLabelOffset * (TWO_PI - redAngle) / PI;
  } else {
    yLabelOffset -= yLabelOffset * redAngle / PI;
  }

  text(negativeRedAngleDegreesLabel, negativeArcMiddleV.x + xLabelOffset, negativeArcMiddleV.y + yLabelOffset);

  pop();

  if (lineSegmentBlue != null) {
    let angleBetweenRedAndBlueLineSegments = lineSegmentRed.getAngleBetween(lineSegmentBlue);
    print(degrees(angleBetweenRedAndBlueLineSegments));
  }

  // lineSegmentRed.draw();
  // if (lineSegmentBlue) {
  //   lineSegmentBlue.draw();

  //   // draw arc between x-axis and mouse line segment
  //   push();
  //   noFill();
  //   stroke(lineSegmentBlue.strokeColor);
  //   drawingContext.setLineDash([1, 2]);
  //   translate(lineSegmentBlue.x1, lineSegmentBlue.y1);
  //   arc(0, 0, 30, 30, 0, lineSegmentBlue.heading);
  //   pop();

  //   // draw arc between mouse line and red segment
  //   push();
  //   noFill();
  //   stroke(0);
  //   drawingContext.setLineDash([1, 2]);
  //   translate(lineSegmentRed.x1, lineSegmentRed.y1);

  //   arc(0, 0, 70, 70, lineSegmentRed.heading, lineSegmentBlue.heading);
  //   pop();

  //   // draw text angles
  //   push();
  //   textSize(10);
  //   //text("Angle Between X-Axis and Blue Vector: ");
  //   //text("Angle Between X-Axis and Red Vector: ");
  //   //text("Angle Between Red and Blue Vector: ");
  //   //noStroke();
  //   fill(0);

  //   // TODO: fix this
  //   stroke(0);
  //   let v1 = createVector(lineSegmentRed.x2 - lineSegmentRed.x1, lineSegmentRed.y2 - lineSegmentRed.y1);
  //   let v2 = createVector(lineSegmentBlue.x2 - lineSegmentBlue.x1, lineSegmentBlue.y2 - lineSegmentBlue.y1);

  //   //for debugging
  //   //line(0, 0, v1.x, v1.y);
  //   //line(0, 0, v2.x, v2.y);

  //   noStroke();
  //   let angleBetweenVectors = v1.angleBetween(v2);
  //   let angleInDegrees = degrees(angleBetweenVectors);
  //   fill(155);
  //   text("Legend: each vector measured in terms of degrees, magnitude", 5, 15);
  //   fill(0);
  //   let angle2InDegrees = 0;
  //   if (angleInDegrees < 0) {
  //     angle2InDegrees = 360 + angleInDegrees;
  //   } else {
  //     angle2InDegrees = 360 - angleInDegrees;
  //   }
  //   text("Angle Between Red & Blue: " + nfc(angleInDegrees, 1) + "° or " + nfc(angle2InDegrees, 1) + "°", 5, 30);
  //   pop();
  //   //noLoop();
  // }

  // // draw arc between x-axis and red segment
  // push();
  // noFill();
  // stroke(lineSegmentRed.strokeColor);
  // drawingContext.setLineDash([1, 2]);
  // translate(lineSegmentRed.x1, lineSegmentRed.y1);
  // arc(0, 0, 50, 50, 0, lineSegmentRed.heading);
  // pop();


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

