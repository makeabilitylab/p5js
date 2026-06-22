// The pong ball: a small square that travels with constant x/y velocity and
// bounces off the top and bottom walls. Extends Shape for position/size and
// hit testing against the paddles.
class Ball extends Shape {
  constructor(x, y, width, height) {
    super(x, y, width, height);
    this.xVelocity = random(2, 5);
    this.yVelocity = random(2, 5);
  }

  // Park the ball at the top-left and stop it (used between points).
  reset() {
    this.x = 50;
    this.y = 50;
    this.xVelocity = 0;
    this.yVelocity = 0;
  }

  // Re-center the ball and give it a fresh random velocity to start a point.
  launch() {
    this.reset();
    this.xVelocity = random(2, 5);
    this.yVelocity = random(2, 5);
  }

  // Move one frame; reverse vertical direction when hitting the top or bottom.
  update() {
    this.x += this.xVelocity;
    this.y += this.yVelocity;

    // check for going off top or bottom of screen
    if (floor(this.y) <= 0 || ceil(this.getBottom()) >= height) {
      this.yVelocity *= -1;
    }
  }

  // Draw the ball as a magenta square.
  draw() {
    fill(255, 0, 255);
    rect(this.x, this.y, this.width, this.height);
  }
}