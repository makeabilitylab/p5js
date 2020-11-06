// Continuing my explorations with 'vector reflections.' This improves upon
// my previous work (https://editor.p5js.org/jonfroehlich/sketches/WQML710w)
// in that reflections now also work at the *end points* of a line segment
// 
// The ball should correctly bounce off any point of a line segment using
// "vector reflection" (http://mathworld.wolfram.com/Reflection.html)
//
// While my previous explorations used the p5.collide2D library
// (https://github.com/bmoren/p5.collide2D), this version incorporates
// some code from that library directly (slightly modified) as well as new
// collision code in collision.js
//
// By Jon Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//
// Feel free to use this source code for inspiration or in your
// own projects. If you do, I'd love to hear about it. Email me
// at jonf@cs.uw.edu or Tweet @jonfroehlich.

let ls;
let ball;

let autoDrive = false;

function setup() {
  createCanvas(400, 400);

  let x1 = random(width * 0.2, width * 0.8);
  let y1 = random(height * 0.2, height * 0.8);

  let x2 = random(width * 0.2, width * 0.8);
  let y2 = random(height * 0.2, height * 0.8);
  ls = new LineSegment(x1, y1, x2, y2);
  //ls.strokeColor = color(200);
  ball = new Ball(0, 0, 40);
  ball.setNewPosition(50, 50);
  //noCursor();
}


function draw() {
  background(200);
  
  if (keyIsDown(LEFT_ARROW)) {
    ball.rotate(-0.01);
  } else if (keyIsDown(RIGHT_ARROW)) {
    ball.rotate(0.01);
  }

  if (autoDrive) {
    let dir = ball.direction.copy().setMag(0.5);
    ball.position.add(dir);
    ball.update();
  } else {
    if (keyIsDown(UP_ARROW)) {
      // Move ball forwards
      let dir = ball.direction.copy().setMag(0.5);
      ball.position.add(dir);
      ball.update();
    } else if (keyIsDown(DOWN_ARROW)) {
      // Move ball backwards
      let dir = ball.direction.copy().setMag(0.5);
      dir.rotate(PI);
      ball.position.add(dir);
      ball.update();
    }
  }

  // draw instructions to screen
  push();
  noStroke();
  textSize(10);
  fill(100);
  if(autoDrive){
    textStyle(BOLD);
    text("BALL LAUNCHED!", 5, 12);
    textStyle(NORMAL);
    text("Control with ARROW KEYS. Observe collisions. Hit SPACEBAR to stop.",
         5, 24);

  }else{
    textStyle(BOLD);
    text("MANUAL DRIVE MODE", 5, 12);
    textStyle(NORMAL); 
    text("Control the ball with ARROW KEYS. Hit SPACEBAR to launch ball.",
        5, 24);
  }
  pop();

  //drawBallTractorBeams(ls);

  let expectedCollision = ls.calculateExpectedCollisionPoint(ball);
  if (expectedCollision) {
    ls.strokeColor = color(255, 0, 0);
  } else {
    ls.strokeColor = color(0);
  }

  let collision = ls.checkCollisionWithCircle(ball);
  if (collision) {
    ls.isHighlighted = collision.hit;

    // is the collision on an endpoint? If so, we need to do special calculations
    // for the reflection vector
    let endPtBuffer = 1;
    let distToCollisionFromPt1 = dist(collision.x, collision.y, ls.x1, ls.y1);
    let distToCollisionFromPt2 = dist(collision.x, collision.y, ls.x2, ls.y2);
    let reflectedVectorDrawLength = 20;
    let reflectedVectorColor = color(255, 80, 255);
    let reflectedVectorStrokeWeight = 3;

    if (distToCollisionFromPt1 < endPtBuffer || distToCollisionFromPt2 < endPtBuffer) {
      // If we're here, then the collision was on an end point!
      // And we need to special case this...

      // compute and draw collision line segment
      // this is the line between the center of the ball and collision point
      push();
      let distColor = color(128, 128, 128, 128);
      stroke(distColor);
      let collisionBallLineSegment = new LineSegment(ball.x, ball.y, collision.x, collision.y);
      collisionBallLineSegment.turnOnArrow = true;
      collisionBallLineSegment.strokeColor = distColor;
      collisionBallLineSegment.draw();
      pop();

      // Compute and draw normal for end point
      let normal = collisionBallLineSegment.getNormal();
      normal.setMag(20);
      let normalPt1 = p5.Vector.sub(collision.pt, normal);
      let normalPt2 = p5.Vector.add(collision.pt, normal);
      line(normalPt1.x, normalPt1.y, normalPt2.x, normalPt2.y);

      // Now compute and draw reflection vector for end point normal
      let n = normal.normalize();
      let v = ball.direction;
      let vnDot = v.dot(n);
      let reflectedVector = p5.Vector.sub(v, p5.Vector.mult(n, 2 * vnDot));
      reflectedVector.setMag(reflectedVectorDrawLength);
      reflectedVector.rotate(PI);
      let tmpPtX = p5.Vector.add(collision.pt, reflectedVector);
      push();
      strokeWeight(reflectedVectorStrokeWeight);
      stroke(reflectedVectorColor);
      line(collision.x, collision.y, tmpPtX.x, tmpPtX.y);
      //drawLineWithArrow(collision, tmpPtX, reflectedVectorColor, false, true);
      pop();

      // if autodrive is on, set new direction to reflected vector
      if (autoDrive) {
        //TODO: check magnitude of reflectedVector. Should have same mag
        //as original ball.direction (or ball speed)
        ball.direction = reflectedVector;
        //ball.update();
        //frameRate(0.5);
      }
    } else {
      // calculate and draw normal and reflection vector
      let normal = ls.getNormal();
      normal.setMag(20);
      let normalPt1 = p5.Vector.sub(collision.pt, normal);
      let normalPt2 = p5.Vector.add(collision.pt, normal);
      line(normalPt1.x, normalPt1.y, normalPt2.x, normalPt2.y);

      let n = normal.normalize();
      let v = ball.direction;
      let vnDot = v.dot(n);
      let reflectedVector = p5.Vector.sub(v, p5.Vector.mult(n, 2 * vnDot));

      // draw reflection vector
      push();
      let rv2 = reflectedVector.copy();
      rv2.setMag(reflectedVectorDrawLength);
      let lineAtOrigin = p5.Vector.sub(ls.pt2, ls.pt1);
      let fraction = distToCollisionFromPt1 / ls.length;
      let collisionVPt = p5.Vector.add(ls.pt1, p5.Vector.mult(lineAtOrigin, fraction));
      strokeWeight(reflectedVectorStrokeWeight);
      stroke(reflectedVectorColor);
      line(collisionVPt.x, collisionVPt.y,
        collisionVPt.x + rv2.x, collisionVPt.y + rv2.y);
      pop();

      if (autoDrive) {
        //TODO: check magnitude of reflectedVector. Should have same mag
        //as original ball.direction (or ball speed)
        ball.direction = reflectedVector;
      }
    }
  } else {
    ls.isHighlighted = false;
  }

  ls.draw();
  ball.draw();

  if (collision) {
    push();
    fill(255, 0, 255, 128);
    ellipse(collision.pt.x, collision.pt.y, 3);
    pop();
  }
}

function drawBallTractorBeams(ls) {
  push();


  drawingContext.setLineDash([5, 15]);

  let ballDirectionVector = ball.direction.copy();
  ballDirectionVector.normalize();
  ballDirectionVector.setMag(ball.radius);
  let normal1 = createVector(ballDirectionVector.y, -ballDirectionVector.x);
  let normal2 = createVector(-ballDirectionVector.y, ballDirectionVector.x);
  let normalColor = color(255, 0, 0, 40);
  drawLineWithArrow(ball.position, normal1, normalColor, false, true);
  drawLineWithArrow(ball.position, normal2, normalColor, false, true);

  let intersectionPt1 = p5.Vector.add(ball.position, normal1);
  let intersectionPt2 = p5.Vector.add(ball.position, normal2);
  fill(255, 0, 0);
  ellipse(intersectionPt1.x, intersectionPt1.y, 5);
  ellipse(intersectionPt2.x, intersectionPt2.y, 5);

  let tractorBeamVector = ball.direction.copy();
  let tractorBeamColor = color(50, 50, 50, 150);
  let dist1 = dist(ball.x, ball.y, ls.x1, ls.y1);
  let dist2 = dist(ball.x, ball.y, ls.x2, ls.y2);
  let maxDist = max(dist1, dist2);
  //let tractorBeamLength
  tractorBeamVector.setMag(maxDist + 10);
  let tractorBeam1 = new LineSegment(intersectionPt1, p5.Vector.add(intersectionPt1, tractorBeamVector));
  tractorBeam1.turnOnArrow = true;
  tractorBeam1.strokeColor = tractorBeamColor;
  tractorBeam1.draw();

  let tractorBeam2 = new LineSegment(intersectionPt2, p5.Vector.add(intersectionPt2, tractorBeamVector));
  tractorBeam2.turnOnArrow = true;
  tractorBeam2.strokeColor = tractorBeamColor;
  tractorBeam2.draw();
  pop();
}

function keyPressed() {
  //if (keyCode === ENTER) {
  if (key == ' ') {
    autoDrive = !autoDrive;

    if (autoDrive) {
      cursor(ARROW);
    } else {
      noCursor();
    }
  }
}

class Ball {

  constructor(x, y, size) {
    this.position = createVector(x, y);
    this.diameter = size;

    this.direction = createVector(0, 0);
    this.direction.setMag(this.radius * 0.9);
    this.arrowStrokeColor = color(180);
    this.strokeColor = color(0);
    this.fillColor = color(255, 255, 255, 128);
  }

  get x() {
    return this.position.x;
  }

  get y() {
    return this.position.y;
  }

  get radius() {
    return this.diameter / 2;
  }

  rotate(angle) {
    this.direction.rotate(angle);
  }

  setNewPosition(x, y) {
    let xDiff = x - this.x;
    let yDiff = y - this.y;

    if (abs(xDiff) > 0 || abs(yDiff) > 0) {
      this.direction.x = xDiff;
      this.direction.y = yDiff;
      this.direction.setMag(this.radius * 0.9);
    }
    this.position.x = x;
    this.position.y = y;
  }

  update() {
    if (this.x - this.radius <= 0 || this.x + this.radius >= width) {
      this.direction.x *= -1;

      // needed so ball doesn't get stuck at edge due to rounding
      if (this.x - this.radius <= 0) {
        this.position.x = this.radius;
      } else {
        this.position.x = width - this.radius;
      }
    }

    if (this.y - this.radius <= 0 || this.y + this.radius >= height) {
      this.direction.y *= -1;

      // needed so ball doesn't get stuck on edge
      if (this.y - this.radius <= 0) {
        this.position.y = this.radius;
      } else {
        this.position.y = height - this.radius;
      }
    }
  }

  draw() {
    push();
    fill(this.fillColor);
    stroke(this.strokeColor);
    ellipse(this.position.x, this.position.y, this.diameter);

    drawLineWithArrow(this.position, this.direction, this.arrowStrokeColor, false, true);

    pop();
  }
}