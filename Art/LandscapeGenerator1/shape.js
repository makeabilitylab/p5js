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

  getLeft() {
    return this.x;
  }

  getRight() {
    return this.x + this.width;
  }

  getBottom() {
    return this.y;
  }

  getTop() {
    return this.y + this.height;
  }

  contains(x, y) {
    return x >= this.x && // check within left edge
      x <= (this.x + this.width) && // check within right edge
      y >= this.y && // check within top edge
      y <= (this.y + this.height); // check within bottom edge
  }
}