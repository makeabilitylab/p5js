class Shape {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

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
  
  scale(fraction){
    this.width *= fraction;
    this.height *= fraction;
  }
  
  incrementHeight(yIncrement, lockAspectRatio){
    let yIncrementFraction = yIncrement / this.height;
    this.height += yIncrement;
    if(lockAspectRatio){
      let xIncrement = yIncrementFraction * this.width;
      this.width += xIncrement;
    }
  }
  
  incrementWidth(xIncrement, lockAspectRatio){
    let xIncrementFraction = xIncrement / this.width;
    this.width += xIncrement;
    if(lockAspectRatio){
      let yIncrement =  xIncrementFraction * this.height;
      this.height += yIncrement;
    }
  }
  
  overlaps(shape){
    // based on https://stackoverflow.com/a/4098512
    return !(this.getRight() < shape.x || 
             this.getBottom() < shape.y || 
             this.x > shape.getRight() || 
             this.y > shape.getBottom());
  }

  contains(x, y) {
    return x >= this.x && // check within left edge
      x <= (this.x + this.width) && // check within right edge
      y >= this.y && // check within top edge
      y <= (this.y + this.height); // check within bottom edge
  }
}

class Circle extends Shape {
  constructor(x, y, diameter, fillColor) {
    super(x, y, diameter, diameter);
    this.fillColor = fillColor;
  }

  containsCircle(otherCircle) {
    let distFromThisCircleToOtherCircle = dist(this.x, this.y, otherCircle.x, otherCircle.y);
    let otherCircleRadius = otherCircle.diameter / 2;
    let thisRadius = this.diameter / 2;
    if (distFromThisCircleToOtherCircle + otherCircleRadius <= thisRadius) {
      return true;
    }
    return false;
  }

  draw() {
    push();
    noStroke();
    fill(this.fillColor);
    ellipse(this.x, this.y, this.width);
    pop();
  }
}