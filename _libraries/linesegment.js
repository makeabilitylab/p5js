// This library provides basic line segment functionality, including drawing
// and vector operations
//
// By Jon E. Froehlich
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

    this.fontSize = 12;
    this.strokeColor = color(0);
    this.isDashedLine = false;
    this.turnOnTextLabels = true;
    this.strokeWeight = 2;
  }

  get x1() {
    return this.pt1.x;
  }

  get y1() {
    return this.pt1.y;
  }

  /**
   * Returns x2
   */
  get x2() {
    return this.pt2.x;
  }

  /**
   * Returns y2
   */
  get y2() {
    return this.pt2.y;
  }

  /**
   * Returns the heading of the line segment in radians
   */
  getHeading() {
    let diffVector = p5.Vector.sub(this.pt2, this.pt1);
    return diffVector.heading();
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
   * Calculates the orthogonal projection of vector p to this line segment
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
  getDistance(p){
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
    noStroke();
    //rotate(-vec.heading());
    textSize(this.fontSize);
    angleMode(RADIANS);
    let lbl = nfc(degrees(vec.heading()), 1) + "°" + ", " + nfc(vec.mag(), 1);
    let lblWidth = textWidth(lbl);
    text(lbl, -lblWidth, 12);

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