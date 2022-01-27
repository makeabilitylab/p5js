class Shape {
  constructor(x, y, width, height, strokeColor, fillColor) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
    this.strokeWeight = 1;
    this.drawHitBox = false;
  }

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

  collision(shape) {
    // only does collision detection based on rectangular hit boxes
    // and not the potentially more complex underlying geometry


    // From: http://www.jeffreythompson.org/collision-detection/rect-rect.php
    // Is the RIGHT edge of r1 to the RIGHT of the LEFT edge of r2?
    // Is the LEFT edge of r1 to the LEFT of the RIGHT edge of r2?
    // Is the BOTTOM edge of r1 BELOW the TOP edge of r2?
    // Is the TOP edge of r1 ABOVE the BOTTOM edge of r2?
    return this.getRight() >= shape.getLeft() &&
      this.getLeft() <= shape.getRight() &&
      this.getBottom() >= shape.getTop() &&
      this.getTop() <= shape.getBottom();
  }

  contains(x, y) {
    return x >= this.x && // check within left edge
      x <= (this.x + this.width) && // check within right edge
      y >= this.y && // check within top edge
      y <= (this.y + this.height); // check within bottom edge
  }

  draw() {
    if (this.drawHitBox) {
      //for debugging
      push();
      // draw hit box (for debugging)
      noFill();
      rect(this.x, this.y, this.width, this.height);
      pop();
    }
  }
}