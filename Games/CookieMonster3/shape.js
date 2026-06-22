// Geometry base class for this game's objects: an axis-aligned rectangle with
// edge accessors, scaling helpers, and overlap/contains hit tests. (A variant
// of the shared game Shape, extended here with scaling + a Circle subclass.)
class Shape {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  // Edge accessors (left/right/top/bottom in pixels).
  getLeft() {
    return this.x;
  }

  getRight() {
    return this.x + this.width;
  }

  getBottom() {
    return this.y + this.height;
  }

  getTop() {
    return this.y;
  }
  
  // Scale width and height by the given fraction.
  scale(fraction){
    this.width *= fraction;
    this.height *= fraction;
  }

  // Grow/shrink height by yIncrement pixels; if lockAspectRatio, scale width to match.
  incrementHeight(yIncrement, lockAspectRatio){
    let yIncrementFraction = yIncrement / this.height;
    this.height += yIncrement;
    if(lockAspectRatio){
      let xIncrement = yIncrementFraction * this.width;
      this.width += xIncrement;
    }
  }
  
  // Grow/shrink width by xIncrement pixels; if lockAspectRatio, scale height to match.
  incrementWidth(xIncrement, lockAspectRatio){
    let xIncrementFraction = xIncrement / this.width;
    this.width += xIncrement;
    if(lockAspectRatio){
      let yIncrement =  xIncrementFraction * this.height;
      this.height += yIncrement;
    }
  }

  // Returns true if this rectangle overlaps another Shape.
  overlaps(shape){
    // based on https://stackoverflow.com/a/4098512
    return !(this.getRight() < shape.x || 
             this.getBottom() < shape.y || 
             this.x > shape.getRight() || 
             this.y > shape.getBottom());
  }

  // Returns true if the point (x, y) lies inside this rectangle.
  contains(x, y) {
    return x >= this.x && // check within left edge
      x <= (this.x + this.width) && // check within right edge
      y >= this.y && // check within top edge
      y <= (this.y + this.height); // check within bottom edge
  }
}

// A circle (drawn as an ellipse), sized by diameter. Extends Shape, so it still
// has a square rectangular hit box of width = height = diameter.
class Circle extends Shape {
  constructor(x, y, diameter, fillColor) {
    super(x, y, diameter, diameter);
    this.fillColor = fillColor;
  }

  // Returns true if otherCircle is fully contained within this circle.
  containsCircle(otherCircle) {
    let distFromThisCircleToOtherCircle = dist(this.x, this.y, otherCircle.x, otherCircle.y);
    let otherCircleRadius = otherCircle.diameter / 2;
    let thisRadius = this.diameter / 2;
    if (distFromThisCircleToOtherCircle + otherCircleRadius <= thisRadius) {
      return true;
    }
    return false;
  }

  // Draw the circle as a filled ellipse.
  draw() {
    push();
    noStroke();
    fill(this.fillColor);
    ellipse(this.x, this.y, this.width);
    pop();
  }
}