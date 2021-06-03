// This library provides basic line segment functionality, including drawing
// and vector operations
//
// By Jon E. Froehlich
// UW CSE Professor
// http://makeabilitylab.io/
//
class LineSegment {
  constructor(x1, y1, x2, y2) {
    //x1 and y1 can either be vectors or the points for p1
    if (arguments.length == 2 && typeof x1 === 'object' &&
      typeof y1 === 'object') {
      this.pt1 = x1;
      this.pt2 = y1;
    } else {
      this.pt1 = createVector(x1, y1);
      this.pt2 = createVector(x2, y2);
    }

    this.fontSize = 10;
    this.strokeColor = color(0);
    this.isDashedLine = false;
    this.drawTextLabels = true;
    this.drawTextMagnitude = true;
    this.drawTextAngle = true;
    this.strokeWeight = 2;
  }

  /**
   * Returns x1
   */
  get x1() {
    return this.pt1.x;
  }

  /**
   * Set x1
   */
  set x1(val) {
    this.pt1.x = val;
  }

  /**
   * Returns y1
   */
  get y1() {
    return this.pt1.y;
  }

  /**
   * Set y1
   */
  set y1(val) {
    this.pt1.y = val;
  }

  /**
   * Returns x2
   */
  get x2() {
    return this.pt2.x;
  }

  /**
   * Set x2
   */
  set x2(val) {
    this.pt2.x = val;
  }

  /**
   * Returns y2
   */
  get y2() {
    return this.pt2.y;
  }

  /**
   * Set y2
   */
  set y2(val) {
    this.pt2.y = val;
  }

  /**
   * Returns the heading of the line segment in radians between 0 and TWO_PI
   */
  getHeading() {
    let diffVector = p5.Vector.sub(this.pt2, this.pt1);
    let heading = diffVector.heading();

    if (heading < 0) {
      heading += TWO_PI;
    }
    return heading;
  }

  /**
   * Returns the two normals for the line segment (one normal for each direction)
   */
  getNormals() {
    return calculateNormals(this.pt1, this.pt2);
  }

  /**
   * Returns one of the normals for this line segment. To get both
   * normals, call getNormals()
   */
  getNormal() {
    return this.getNormals()[0];
  }

  /**
   * Calculates p5.Vector.sub(this.pt2, this.pt1) and returns the resulting
   * vector (which is this line segment moved to the origin).
   */
  getVectorAtOrigin() {
    return createVector(this.x2 - this.x1, this.y2 - this.y1);
  }

  /**
   * Gets the angle between this line segment and the given vector or line segment.
   * Returns the angle in radians between 0 and TWO_PI
   * 
   * @param {p5.Vector or LineSegment} vectorOrLineSegment 
   */
  getAngleBetween(vectorOrLineSegment) {
    let v1 = this.getVectorAtOrigin();
    let v2 = vectorOrLineSegment;

    if (vectorOrLineSegment instanceof LineSegment) {
      v2 = vectorOrLineSegment.getVectorAtOrigin();
    }

    let angleBetweenRadians = v1.angleBetween(v2);
    if (angleBetweenRadians < 0) {
      angleBetweenRadians += TWO_PI;
    }
    return angleBetweenRadians;
  }

  /**
   * Calculates the orthogonal projection of vector p to this line segment
   * http://mathonline.wikidot.com/orthogonal-projections
   * @param {p5.Vector} p a p5.Vector
   */
  getOrthogonalProjection(p) {

    const d1 = p5.Vector.sub(this.pt2, this.pt1);
    const d2 = p5.Vector.sub(p, this.pt1);
    const l1 = d1.mag();

    const dotp = constrain(d2.dot(d1.normalize()), 0, l1);

    return p5.Vector.add(this.pt1, d1.mult(dotp));
  }

  /**
   * Returns the minimum distance between this line segment and the given point p
   * @param {p5.Vector} p a p5.Vector
   */
  getDistance(p) {
    const op = this.getOrthogonalProjection(p);
    return p5.Vector.dist(p, op);
  }

  draw() {
    push();
    stroke(this.strokeColor);
    //line(this.pt1.x, this.pt1.y, this.pt2.x, this.pt2.y);
    let diffVector = p5.Vector.sub(this.pt2, this.pt1);
    this.drawArrow(this.pt1, diffVector, this.strokeColor);
    pop();
  }

  /**
   * 
   * @param {p5.Vector} base the base vector
   * @param {p5.Vector} vec the vector to draw
   * @param {p5.color} myColor color of vector
   */
  drawArrow(base, vec, myColor) {
    push();
    stroke(myColor);
    strokeWeight(this.strokeWeight);
    fill(myColor);
    translate(base);
    push();
    if (this.isDashedLine) {
      drawingContext.setLineDash([5, 15]);
    }
    line(0, 0, vec.x, vec.y);
    pop();
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);

    // calculate heading in radians and degrees
    // and also print out magnitude
    //print(degrees(this.velocity.heading()));

    if (this.drawTextLabels) {
      noStroke();
      //rotate(-vec.heading());
      textSize(this.fontSize);
      angleMode(RADIANS);
      let lbl = "";
      if (this.drawTextAngle) {
        let angleDegrees = degrees(vec.heading());
        if (angleDegrees < 0) {
          angleDegrees += degrees(TWO_PI);
        }
        lbl += nfc(angleDegrees, 1) + "°"
      }

      if (this.drawTextAngle && this.drawTextMagnitude) {
        lbl += " ";
      }

      if (this.drawTextMagnitude) {
        lbl += "|" + nfc(vec.mag(), 1) + "|";
      }

      let lblWidth = textWidth(lbl);
      text(lbl, -lblWidth - 3, 12);
    }

    pop();
  }

  static drawAngleArcs(lineSegment1, lineSegment2, arcColor, arcSizePositiveAngle = 50, arcSizeNegativeAngle = 30) {
    let lineSeg1AngleRadians = lineSegment1.getHeading();
    let angleBetweenRadians = lineSegment1.getAngleBetween(lineSegment2);

    push();
    noFill();
    stroke(arcColor);

    translate(lineSegment1.x1, lineSegment1.y1);

    // Draw the arc of size arcSize from the angle of the first line segment
    // to the beginning of the next line segment
    arc(0, 0, arcSizePositiveAngle, arcSizePositiveAngle, lineSeg1AngleRadians, lineSeg1AngleRadians + angleBetweenRadians);

    // Get the middle of this angle (which is where we will draw the angle text)
    let positiveArcMiddleV = p5.Vector.fromAngle(lineSeg1AngleRadians + (angleBetweenRadians / 2), arcSizePositiveAngle * 0.55);
    line(0, 0, positiveArcMiddleV.x, positiveArcMiddleV.y); //uncomment to see where text drawn

    noStroke();
    textSize(8);
    fill(arcColor);
    let posAngleBetweenDegrees = degrees(angleBetweenRadians);
    let posAngleDegreesLabel = nfc(posAngleBetweenDegrees, 1) + "°";

    textAlign(CENTER);
    // positiveArcMiddleV.mult(1.2);
    positiveArcMiddleV.setMag(positiveArcMiddleV.mag() + 15);
    text(posAngleDegreesLabel, positiveArcMiddleV.x, positiveArcMiddleV.y);


    // Now draw negative angle
    let negativeReadAngle = -(TWO_PI - angleBetweenRadians);
    let negativeArcMiddleV = p5.Vector.fromAngle(lineSeg1AngleRadians + negativeReadAngle / 2, arcSizeNegativeAngle * 0.55);

    drawingContext.setLineDash([2, 5]);
    // line(0, 0, negativeArcMiddleV.x, negativeArcMiddleV.y); //uncomment to see where text drawn
    noFill();
    stroke(arcColor);
    arc(0, 0, arcSizeNegativeAngle, arcSizeNegativeAngle, lineSeg1AngleRadians + angleBetweenRadians, lineSeg1AngleRadians);
    line(0, 0, negativeArcMiddleV.x, negativeArcMiddleV.y); //uncomment to see where text drawn

    noStroke();
    fill(arcColor);
    let negAngleBetweenDegrees = degrees(negativeReadAngle);
    let negAngleDegreesLabel = nfc(negAngleBetweenDegrees, 1) + "°";

    textAlign(CENTER);
    //negativeArcMiddleV.mult(1.2);
    negativeArcMiddleV.setMag(negativeArcMiddleV.mag() + 15);
    text(negAngleDegreesLabel, negativeArcMiddleV.x, negativeArcMiddleV.y);

    pop();
  }
}

/**
 * Returns the two normals for the line segment (one normal for each direction)
 *
 * @param {p5.Vector} pt1 the first point in the line segment
 * @param {p5.Vector} pt2 the second point in the line segment
 */
function calculateNormals(pt1, pt2) {
  // From: https://stackoverflow.com/a/1243676  
  // https://www.mathworks.com/matlabcentral/answers/85686-how-to-calculate-normal-to-a-line
  //  V = B - A;
  //  normal1 = [ V(2), -V(1)];
  //  normal2 = [-V(2),  V(1)];

  let v = p5.Vector.sub(pt2, pt1);
  return [createVector(v.y, -v.x), createVector(-v.y, v.x)];
}