// Geometry base class for the landscape shapes (mountains, sky, etc.): an
// axis-aligned rectangle with a stroke/fill color, edge accessors, and a
// point-in-rectangle test. Subclassed by the shapes built in sketch.js.
class Shape {
  constructor(x, y, width, height, strokeColor, fillColor) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
    this.strokeWeight = 1;
  }

  // Edge accessors (left/right/top/bottom in pixels).
  getLeft() {
    return this.x;
  }

  getRight() {
    return this.x + this.width;
  }

  getTop() {
    return this.y;
  }

  getBottom() {
    return this.y + this.height;
  }

  // Returns true if the point (x, y) lies inside this rectangle.
  contains(x, y) {
    return x >= this.x && // check within left edge
      x <= (this.x + this.width) && // check within right edge
      y >= this.y && // check within top edge
      y <= (this.y + this.height); // check within bottom edge
  }
}