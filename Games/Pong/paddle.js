// A player's paddle: a vertical bar pinned to the left or right edge that the
// player slides up/down with the keyboard. Extends Shape for position/size and
// for the contains() hit test it uses against the ball.
class Paddle extends Shape {

  constructor(x, y, width, height, paddleLoc) {
    super(x, y, width, height);
    this.paddleLoc = paddleLoc;
    this.movementStep = 5; // pixels the paddle moves per frame while a key is held
  }

  // Move the paddle from held arrow keys (clamped to the canvas), then bounce
  // the ball back if it has reached this paddle's edge.
  update(ball) {

    // check for key press and move paddle up or down
    if (keyIsPressed) {
      // we use the keyIsDown function to support multiple key presses
      // at once. That is, both players might have a key down to move their
      // paddles simulataneously. So rather than say: keyCode == LEFT_ARROW,
      // we say keyIsDown(LEFT_ARROW)
      if ((this.paddleLoc == PADDLE.LEFT && keyIsDown(UP_ARROW)) ||
        (this.paddleLoc == PADDLE.RIGHT && keyIsDown(LEFT_ARROW))) {
        this.y -= this.movementStep;
        if (this.y < 0) {
          this.y = 0;
        }
      } 
      if ((this.paddleLoc == PADDLE.LEFT && keyIsDown(DOWN_ARROW)) ||
        (this.paddleLoc == PADDLE.RIGHT && keyIsDown(RIGHT_ARROW))) {
        this.y += this.movementStep;
        if (this.y + this.height > height) {
          this.y = height - this.height;
        }
      }
    }

    // check if ball collided with paddle. if so, flip direction of ball
    if (this.paddleLoc == PADDLE.LEFT && this.contains(floor(ball.x), ball.y)) {
      ball.xVelocity *= -1;
      ball.x = this.getRight() + 0.5; // so it doesn't get stuck on paddle
    } else if (this.paddleLoc == PADDLE.RIGHT && this.contains(ceil(ball.x + ball.width), ball.y)) {
      ball.xVelocity *= -1;
      ball.x = this.x - ball.width - 0.5; // so it doesn't get stuck due to rounding
    }
  }

  // Draw the paddle as a white bar.
  draw() {
    fill(255);
    rect(this.x, this.y, this.width, this.height);
  }
}