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