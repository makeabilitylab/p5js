let skyBackground = null;
let sun = null;

function setup() {
  createCanvas(windowWidth, windowHeight);
  skyBackground = new SkyBackground(0, 0, width, height);
  sun = new Sun(skyBackground.topColor);
}

function draw() {
  //background(220);
  skyBackground.draw();
  sun.draw();
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  skyBackground.width = width;
  skyBackground.height = height;
}

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
  
  overlaps(shape){
    // based on https://stackoverflow.com/a/4098512
    return !(this.getRight() < shape.x || 
             this.getBottom() < shape.y || 
             this.x > shape.getRight() || 
             this.y > shape.getBottom());
  }

  containsPoint(x, y) {
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

class Sun extends Circle{
  constructor(baseColor) {
    let size = 50 + width * random(0.1, 0.3);
    let xLoc = width * random();
    let yLoc = size * random(-0.2, 0.5);
    super(xLoc, yLoc, size, size);

    this.fillColor = color(hue(baseColor), saturation(baseColor) * 0.9,
      brightness(baseColor) * 1.6);
  }

  draw() {
    // TODO: maybe make the sun a slight gradient in future too?
    noStroke();
    fill(this.fillColor);
    ellipse(this.x, this.y, this.width, this.height);
  }
}

class SkyBackground extends Shape{

  constructor(x, y, width, height) {
    super(x, y, width, height);
 
    let rc = SkyBackground.getRandomColor();
    this.topColor = SkyBackground.getRandomColor();
    this.bottomColor = color(hue(rc), saturation(rc) * 0.9, brightness(rc) * 1.5);
  }

  draw() {
    // p5js has very limited gradient fill support, so we actually
    // don't use p5js here, we use regular Canvas drawing
    // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
    let ctx = drawingContext;
    let grd = ctx.createLinearGradient(0, 0, 0, this.width);
    grd.addColorStop(0, this.topColor);
    grd.addColorStop(0.4, this.bottomColor);

    let oldFillStyle = ctx.fillStyle; // save old fillstyle to reset
    ctx.fillStyle = grd;
    ctx.fillRect(0, 0, this.width, this.height);
    ctx.fillStyle = oldFillStyle;

  }

  static getRandomColor() {
    colorMode(HSB, 255);
    let hue = random(0, 255);
    return color(hue, 115, 150);
  }
}
