// Playing around with vectors in p5js. Draw "barriers" with the mouse
// by clicking. The ball should correctly bounce off said barriers using
// "vector reflection" (http://mathworld.wolfram.com/Reflection.html)
//
// Uses the p5.collide2D library to detect collisions but the vector
// reflection code is custom. See: https://github.com/bmoren/p5.collide2D
//
// By Jon Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//
// Feel free to use this source code for inspiration or in your
// own projects. If you do, I'd love to hear about it. Email me
// at jonf@cs.uw.edu or Tweet @jonfroehlich.
//
// Some resources:
// - Coding Train series on vector math: https://youtu.be/mWJkvxQXIa8
//   Shiffman uses Processing rather than p5js but it is straightforward
//   to translate the examples
//
// - The official p5js non-orthogonal reflection example: 
//   https://p5js.org/examples/motion-non-orthogonal-reflection.html
//
// TODO/BUGS: 
// - there is a bug when ball hits end of line segment straight on
//   -- see: https://gamedev.stackexchange.com/questions/92067/how-do-i-calculate-the-bounce-vector-of-a-ball-hitting-the-starting-point-of-a-s
// - also bug when ball is close to a line segment with similar velocity vector
//   the ball gets stuck on wall
//
let lastMouseClickPos;
let curMouseClickPos;

let ball;
let lines = [];

function setup() {
  createCanvas(400, 400);

  ball = new Ball();
}

function draw() {
  background(220);

  ball.update();
  ball.draw();

  // go through and check if ball has hit linesegments
  // also, draw linesegments
  for (let lineSegment of lines) {
    // collideLineCircle(x1, y1, x2, y2, cx, cy, diameter)
    // See: https://github.com/bmoren/p5.collide2D#collidelinecircle
    let hit = collideLineCircle(lineSegment.x1, lineSegment.y1,
      lineSegment.x2, lineSegment.y2,
      ball.x, ball.y, ball.diameter);

    lineSegment.isHighlighted = hit;
    lineSegment.draw();

    // now reflect the ball using specular reflection:
    //  - https://en.wikipedia.org/wiki/Specular_reflection
    //
    // some resources:
    //  - https://www.gamedev.net/forums/topic/360411-reflection-off-a-line/
    //  - http://mathworld.wolfram.com/Reflection.html
    //  - https://processing.org/examples/reflection1.html
    // 
    // The vector reflection equation is
    //   v' = v-2(v.n)n
    // Where v is the input vector, v' is the reflected vector, n is the 
    // unit-length normal, and '.' is the dot product.
    let normal = lineSegment.getNormal();
    let n = normal.normalize();
    let v = ball.velocity;
    let vnDot = v.dot(n);
    let reflectedVector = p5.Vector.sub(v, p5.Vector.mult(n, 2 * vnDot));
    if (hit) {
      
      // TODO: calculate current distance between the ball diameter
      // and line segment. Figure out exact collision point on line segment
      // then ensure that ball has completely cleared line segment on its reflection
      
      ball.velocity = reflectedVector;
    }

    // for debugging, draw the reflected vector
    push();
    strokeWeight(2);
    let rv2 = reflectedVector.copy();
    rv2.setMag(10);
    let lineAtOrigin = p5.Vector.sub(lineSegment.pt2, lineSegment.pt1);
    let midV = p5.Vector.add(lineSegment.pt1, p5.Vector.mult(lineAtOrigin, 0.5));
    line(midV.x, midV.y, midV.x + rv2.x, midV.y + rv2.y);
    pop();
  }


  if (curMouseClickPos && !lastMouseClickPos) {
    push();
    fill(255);
    ellipse(curMouseClickPos.x, curMouseClickPos.y, 10);
    pop();
  }
}

function mouseClicked() {
  if (lastMouseClickPos != null) {
    lastMouseClickPos = null;
  } else {
    lastMouseClickPos = curMouseClickPos;
  }
  curMouseClickPos = createVector(mouseX, mouseY);

  if (lastMouseClickPos != null && curMouseClickPos != null) {
    let lineSegment = new LineSegment(lastMouseClickPos, curMouseClickPos);
    lineSegment.strokeColor = 'blue';
    lines.push(lineSegment);
  }
}

class LineSegment {
  constructor(x1, y1, x2, y2) {
    //x1 and y1 can either be vectors or the points for p1
    if (arguments.length == 2 && typeof x1 === 'object' &&
      typeof y1 === 'object') {
      this.pt1 = x1;
      this.pt2 = y1;
    } else {
      this.pt1 = createVector(x1, y1);
      this.pt2 = createVector(x2, y2);
    }
    this.strokeColor = color(0);
    this.isDashedLine = false;
    this.turnOnTextLabels = true;
    this.strokeWeight = 2;

    this.isHighlighted = false;
    this.highlightColor = color(10, 240, 10);

    this.shouldDrawNormal = true;
  }

  get x1() {
    return this.pt1.x;
  }

  get y1() {
    return this.pt1.y;
  }

  get x2() {
    return this.pt2.x;
  }

  get y2() {
    return this.pt2.y;
  }

  get heading() {
    let diffVector = p5.Vector.sub(this.pt2, this.pt1);
    return diffVector.heading();
  }

  getNormal() {
    return this.getNormals()[1];
  }

  getNormals() {
    // From: https://stackoverflow.com/a/1243676  
    // https://www.mathworks.com/matlabcentral/answers/85686-how-to-calculate-normal-to-a-line
    //  V = B - A;
    //  midV = A + 0.5 * V;
    //  normal1 = [ V(2), -V(1)];
    //  normal2 = [-V(2),  V(1)];
    //  plot([midV(1), midV(1) + normal1(1)], [midV(2), midV(2) + normal1(2)], 'g');
    //  plot([midV(1), midV(1) + normal2(1)], [midV(2), midV(2) + normal2(2)], 'b'); 
    let v = p5.Vector.sub(this.pt2, this.pt1);

    let midV = p5.Vector.add(this.pt1, p5.Vector.mult(v, 0.5));

    // how big to make the normal (the mag influences debug drawing)
    v.normalize();
    v.setMag(15);
    return [midV, createVector(v.y, -v.x), createVector(-v.y, v.x)];
  }

  getVectorAtOrigin() {
    return createVector(this.x2 - this.x1, this.y2 - this.y1);
  }

  draw() {
    push();
    stroke(this.strokeColor);
    //line(this.pt1.x, this.pt1.y, this.pt2.x, this.pt2.y);
    let diffVector = p5.Vector.sub(this.pt2, this.pt1);
    if (this.isHighlighted) {
      this.drawArrow(this.pt1, diffVector, this.highlightColor, this.turnOnTextLabels);
    } else {
      this.drawArrow(this.pt1, diffVector, this.strokeColor, this.turnOnTextLabels);
    }

    if (this.shouldDrawNormal) {
      let normal = this.getNormals();
      push();
      let midV = normal[0];
      let normal1 = normal[1];
      let normal2 = normal[2];
      //stroke(255, 0, 0);
      //line(midV.x, midV.y, midV.x + normal1.x, midV.y + normal1.y);
      this.drawArrow(midV, normal1, color(255, 0, 0, 30), false);
      //stroke(0, 0, 255);
      //line(midV.x, midV.y, midV.x + normal2.x, midV.y + normal2.y);
      this.drawArrow(midV, normal2, color(30, 0, 255, 30), false);
      pop();
    }
    pop();
  }

  drawArrow(base, vec, myColor, drawLabels) {
    push();
    stroke(myColor);
    strokeWeight(this.strokeWeight);
    fill(myColor);

    translate(base);
    push();
    if (this.isDashedLine) {
      drawingContext.setLineDash([5, 15]);
    }
    line(0, 0, vec.x, vec.y);
    pop();
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);

    if (drawLabels) {
      noStroke();
      //rotate(-vec.heading());
      textSize(8);
      let lbl = nfc(degrees(vec.heading()), 1) + "°" +
        ", " + nfc(vec.mag(), 1);
      let lblWidth = textWidth(lbl);
      text(lbl, -lblWidth, 12);
    }

    pop();
  }
}

class Ball {

  constructor() {
    this.position = createVector(50, 50);
    this.diameter = 20;

    this.baseAcceleration = 0;
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
  }

  resetVelocityAndAcceleration() {
    this.velocity.setMag(this.baseSpeed);

    // sets up an acceleration vector that always accelerates
    // in same exact direction as velocity vector
    this.acceleration = this.velocity.copy().normalize();
    this.acceleration.setMag(this.baseAcceleration);
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

  update() {
    this.velocity.add(this.acceleration);
    if (this.velocity.mag() >= this.maxSpeed) {
      print("Max speed reached: ", this.velocity.mag());
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
    }

    if (this.y - this.radius <= 0 || this.y + this.radius >= height) {
      this.velocity.y *= -1;

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