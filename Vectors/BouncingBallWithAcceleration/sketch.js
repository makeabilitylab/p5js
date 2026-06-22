//
// Bouncing ball, part 2: steer the acceleration vector with the mouse.
// A vector has both magnitude and direction. Click two points to define an
// acceleration vector (drawn as an arrow): its length sets how hard the ball
// accelerates, its direction sets which way. Builds on BouncingBall.
//
// Source Documentation:
//  - https://p5js.org/reference/#/p5.Vector
//
// References:
//  - Coding Train: "Vectors - The Nature of Code" https://youtu.be/mWJkvxQXIa8
//  - Coding Train: "Vector Math - The Nature of Code" https://youtu.be/s6b1_3bNCxk
//
// Examples:
//  - https://p5js.org/examples/motion-non-orthogonal-reflection.html

let ball;
let lastMouseClickPos;
let curMouseClickPos;

// Create the bouncing ball.
function setup() {
  createCanvas(400, 400);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A white ball with a heading line bounces around a gray canvas; clicking two points draws an arrow between them whose length sets the ball's acceleration, demonstrating how an acceleration vector changes the ball's motion.");
  ball = new Ball();
  //noLoop();
}

// Each frame: advance and draw the ball, then draw the two clicked points and
// the acceleration arrow between them.
function draw() {
  background(220);
  ball.update();
  ball.draw();

  // draw mouse stuff
  if (curMouseClickPos != null) {
    push();
    let mouseCircleSize = 10;
    noStroke();

    fill(10, 0, 200, 200);
    ellipse(curMouseClickPos.x, curMouseClickPos.y, mouseCircleSize);

    if (lastMouseClickPos != null) {
      fill(200, 0, 10, 200);
      ellipse(lastMouseClickPos.x, lastMouseClickPos.y, mouseCircleSize);

      let mouseDiffVector = p5.Vector.sub(curMouseClickPos, lastMouseClickPos);
      drawArrow(lastMouseClickPos, mouseDiffVector, color(0));
    }
    pop();
  }
}

// Draws an arrow starting at `base` and pointing along vector `vec` — used here
// to visualize the acceleration vector the user defines by clicking two points.
function drawArrow(base, vec, myColor) {
  push();
  stroke(myColor);
  strokeWeight(3);
  fill(myColor);
  translate(base);
  line(0, 0, vec.x, vec.y);
  rotate(vec.heading());
  let arrowSize = 7;
  translate(vec.mag() - arrowSize, 0);
  triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  pop();
}

// Two clicks define the acceleration vector: the difference between the first
// and second click is handed to the ball as its new acceleration.
function mouseClicked() {
  if (lastMouseClickPos != null) {
    lastMouseClickPos = null;
  } else {
    lastMouseClickPos = curMouseClickPos;
  }
  curMouseClickPos = createVector(mouseX, mouseY);

  if (lastMouseClickPos != null && curMouseClickPos != null) {
    let mouseDiffVector = p5.Vector.sub(curMouseClickPos, lastMouseClickPos);
    ball.setMouseDiffVector(mouseDiffVector);
  }

  // prevent default
  return false;
}

class Ball {

  // Start at top-left with a random velocity; acceleration starts aligned with
  // it but can later be redirected by the user (see setMouseDiffVector).
  constructor() {
    this.position = createVector(50, 50);
    this.diameter = 20;

    this.baseAcceleration = 0.1;
    this.maxAcceleration = 2;
    this.baseSpeed = 2;
    this.maxSpeed = 10;

    // make a new 2D unit vector from a random angle
    // a unit vector has a magnitude of 1, so this
    // only sets up the angle... the next line of code
    // establishes the magnitude of that angle (aka the velocity)
    this.velocity = p5.Vector.random2D();
    this.velocity.mult(this.baseSpeed);

    this.acceleration = this.velocity.copy().normalize();
    this.acceleration.setMag(this.baseAcceleration);

    this.mouseDiffVector = createVector(0, 0);
  }

  // Point the acceleration along the user's click-to-click vector. Its length
  // is mapped from that vector's magnitude into [baseAcceleration, maxAcceleration]
  // so a longer drag accelerates harder.
  setMouseDiffVector(mouseDiffVector) {
    this.mouseDiffVector = mouseDiffVector;

    let maxMag = createVector(width, height).mag();
    let accelMag = map(this.mouseDiffVector.mag(), 0,
      maxMag, this.baseAcceleration, this.maxAcceleration);
    this.acceleration = mouseDiffVector.copy().normalize();
    this.acceleration.setMag(accelMag);
  }

  // Called after a wall bounce: reset speed to base and re-aim acceleration
  // along the (newly reflected) velocity.
  resetVelocityAndAcceleration() {
    this.velocity.setMag(this.baseSpeed);

    // sets up an acceleration vector that always accelerates
    // in same exact direction as velocity vector
    this.acceleration = this.velocity.copy().normalize();
    this.acceleration.setMag(this.baseAcceleration);
  }

  // Position/size accessors (getters let you read x/y/radius like properties).
  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get radius() {
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
    return this.diameter / 2;
  }

  // Advance one frame: add acceleration to velocity (capping at maxSpeed), move
  // the ball, and bounce off any wall it crosses (nudging it back in-bounds).
  update() {
    this.velocity.add(this.acceleration);
    if (this.velocity.mag() >= this.maxSpeed) {
      this.velocity.setMag(this.maxSpeed);
      this.acceleration.setMag(0);

      // Note: could also use the limit function here to 
      // constrain velocity to its maxspeed
      // e.g., this.velocity.limit(this.maxSpeed);
    }

    this.position.add(this.velocity);

    if (this.x - this.radius <= 0 || this.x + this.radius >= width) {
      this.velocity.x *= -1;

      // needed so ball doesn't get stuck at edge due to rounding
      if (this.x - this.radius <= 0) {
        this.position.x = this.radius;
      } else {
        this.position.x = width - this.radius;
      }

      this.resetVelocityAndAcceleration();
    }

    if (this.y - this.radius <= 0 || this.y + this.radius >= height) {
      this.velocity.y *= -1;

      // needed so ball doesn't get stuck on edge
      if (this.y - this.radius <= 0) {
        this.position.y = this.radius;
      } else {
        this.position.y = height - this.radius;
      }

      this.resetVelocityAndAcceleration();
    }
  }

  // Draw the ball plus a short line pointing in its direction of travel.
  draw() {
    push();
    fill(255);
    ellipse(this.position.x, this.position.y, this.diameter);

    //draw heading line
    //print(degrees(this.velocity.heading()));
    let headingLineSize = this.radius;
    push();
    translate(this.position);
    stroke(0);

    // We want to normalize the velocity vector to *just* look
    // at its direction, which we will then use to create our
    // heading line. See https://youtu.be/uHusbFmq-4I?t=394
    let velocityNormalized = this.velocity.copy().normalize();
    let headingLineEnd = p5.Vector.mult(velocityNormalized, headingLineSize);
    line(0, 0, headingLineEnd.x, headingLineEnd.y);
    pop();
  }
}