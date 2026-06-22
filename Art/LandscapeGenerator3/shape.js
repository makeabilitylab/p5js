// Geometry base class for the landscape shapes: an axis-aligned rectangle with
// edge accessors, scaling, overlap/contains hit tests, and an enabled flag.
// (A richer variant of the LandscapeGenerator1/2 Shape, plus a Circle subclass.)
class Shape {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
      this.enabled = true;
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

    // Returns true if this rectangle overlaps another Shape.
    overlaps(shape){
      // based on https://stackoverflow.com/a/4098512
      return !(this.getRight() < shape.x || 
               this.getBottom() < shape.y || 
               this.x > shape.getRight() || 
               this.y > shape.getBottom());
    }
  
    // Returns true if the point (x, y) lies inside this rectangle.
    containsPoint(x, y) {
      return x >= this.x && // check within left edge
        x <= (this.x + this.width) && // check within right edge
        y >= this.y && // check within top edge
        y <= (this.y + this.height); // check within bottom edge
    }
  }

  // A circle (drawn as an ellipse), sized by diameter. Extends Shape, so it also
  // carries a square rectangular bounding box (width = height = diameter).
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