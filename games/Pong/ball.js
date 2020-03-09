class Ball extends Shape {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.xVelocity = random(2, 5);
    this.yVelocity = random(2, 5);
  }

  reset() {
    this.x = 50;
    this.y = 50;
    this.xVelocity = 0;
    this.yVelocity = 0;
  }

  launch() {
    this.reset();
    this.xVelocity = random(2, 5);
    this.yVelocity = random(2, 5);
  }

  update() {
    this.x += this.xVelocity;
    this.y += this.yVelocity;

    // check for going off top or bottom of screen
    if (floor(this.y) <= 0 || ceil(this.getBottom()) >= height) {
      this.yVelocity *= -1;
    }
  }

  draw() {
    fill(255, 0, 255);
    rect(this.x, this.y, this.width, this.height);
  }
}