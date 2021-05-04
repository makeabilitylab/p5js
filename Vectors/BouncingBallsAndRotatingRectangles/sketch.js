// Playing around with vectors in p5js. Click to add rectangles
// of random sizes and rotations. Ball correctly bounces off these
// rectangles using "vector reflection" 
//
// See also a version with lines rather than rectangles:
// https://editor.p5js.org/jonfroehlich/sketches/WQML710w
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
// - http://mathworld.wolfram.com/Reflection.html
// 
// - Coding Train series on vector math: https://youtu.be/mWJkvxQXIa8
//   Shiffman uses Processing rather than p5js but it is straightforward
//   to translate the examples
//
// - The official p5js non-orthogonal reflection example: 
//   https://p5js.org/examples/motion-non-orthogonal-reflection.html
//
// TODO/BUGS: 
// - there is a bug when ball hits end of line segment (edge, corner) straight on
//   -- see: https://gamedev.stackexchange.com/questions/92067/how-do-i-calculate-the-bounce-vector-of-a-ball-hitting-the-starting-point-of-a-s
//   -- Jon's note: I actually fixed this in a diff demo: https://github.com/makeabilitylab/p5js/tree/master/Vectors/BouncingBallsAndLineSegmentsImproved
// - also bug when ball is close to a line segment with similar velocity vector
//   the ball gets stuck on wall
//

let ball;
let boxes = [];

function setup() {
  createCanvas(400, 400);

  ball = new Ball();
}

function draw() {
  background(220);

  ball.update();
  ball.draw();

  for(let box of boxes){
    let col = box.checkForCollisionWithCircle(ball.x, ball.y, ball.diameter);
    if(col.collision){
      box.isHighlighted = true; 
      
      let baseVector = p5.Vector.sub(col.pt2, col.pt1);
      //let midV = p5.Vector.add(this.pt1, p5.Vector.mult(v, 0.5));
      let normal = createVector(baseVector.y, -baseVector.x).normalize();
 
      let v = ball.velocity;
      let vnDot = v.dot(normal);
      let reflectedVector = p5.Vector.sub(v, p5.Vector.mult(normal, 2 * vnDot));
 
      ball.velocity = reflectedVector;
      
    }else{
      box.isHighlighted = false; 
    }
    box.draw(); 
  }
}

function mouseClicked() {
  let boxWidth = random(10, width * 0.3);
  let boxHeight = random(5, width * 0.4);
  let x = mouseX;
  let y = mouseY;
  let rotation = random(0, PI);
  let box = new Box(x, y, boxWidth, boxHeight, rotation);
  boxes.push(box);
}

class Box {
  constructor(x1, y1, boxWidth, boxHeight, rotationRadians){
    // default angleMode is radians: https://p5js.org/reference/#/p5/angleMode
    // sin(theta) = opposite/hypotenuse
    // asin(opposite/hypotenuse) = theta
    // opposite = sin(theta) * hypotenuse
    // adjacent = cos(theta) * hypotenuse
    let opposite1 = sin(rotationRadians) * boxWidth;
    let adjacent1 = cos(rotationRadians) * boxWidth;
    let y2 = y1 + opposite1;
    let x2 = x1 + adjacent1;
    
    this.pt1 = createVector(x1, y1);
    this.pt2 = createVector(x2, y2);
    
    let theta2 = PI - PI/2 - rotationRadians;
    let opposite2 = sin(theta2) * boxHeight;
    let adjacent2 = cos(theta2) * boxHeight;
    let x3 = x2 - adjacent2;
    let y3 = y2 + opposite2;
    this.pt3 = createVector(x3, y3);
    
    let x4 = x1 - adjacent2;
    let y4 = y1 + opposite2;
    this.pt4 = createVector(x4, y4);
    
    this.strokeColor = color(0);
    this.fillColor = color(255);
    
    this.fillHighlightColor = color(0, 200, 0, 128);
    this.isHighlighted = false;
    
    // never set these variables outside of the constructor
    this._width = boxWidth;
    this._height = boxHeight;
    this._rotation = rotationRadians;
    this.isDebug = true;
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
  
  get x3() {
    return this.pt3.x;
  }

  get y3() {
    return this.pt3.y;
  }
  
  get x4() {
    return this.pt4.x;
  }

  get y4() {
    return this.pt4.y;
  }
  
  checkForCollisionWithCircle(cx, cy, diameter){
    // https://github.com/bmoren/p5.collide2D#collidelinecircle
    // collideLineCircle(x1, y1, x2, y2, cx, cy, diameter)
    if(collideLineCircle(this.x1, this.y1, this.x2, this.y2, cx, cy, diameter)){
      return {
        collision: true,
        pt1: this.pt1,
        pt2: this.pt2
      }
    }
    
    if(collideLineCircle(this.x2, this.y2, this.x3, this.y3, cx, cy, diameter)){
      return {
        collision: true,
        pt1: this.pt2,
        pt2: this.pt3
      }
    }
    
    if(collideLineCircle(this.x3, this.y3, this.x4, this.y4, cx, cy, diameter)){
      return {
        collision: true,
        pt1: this.pt3,
        pt2: this.pt4
      }
    }
    
    if(collideLineCircle(this.x4, this.y4, this.x1, this.y1, cx, cy, diameter)){
      return {
        collision: true,
        pt1: this.pt4,
        pt2: this.pt1
      }
    }
    
    
    return {
      collision: false
    }
  }
  
  draw(){
    
    // debug
    if(this.isDebug){
      push();  
      let fc = color(0, 0, 200, 50);
      let sc = color(50, 50, 50, 50);
      stroke(sc);
      fill(fc);
      ellipse(this.x1, this.y1, 5);
      translate(this.x1, this.y1);
      rotate(this._rotation);
      rect(0, 0, this._width, this._height);
      pop();
    }
    
    push();
    stroke(this.strokeColor);
    if(this.isHighlighted){
      fill(this.fillHighlightColor);
    }else{
      noFill();
    }
    beginShape();
    vertex(this.x1, this.y1);
    vertex(this.x2, this.y2);
    vertex(this.x3, this.y3);
    vertex(this.x4, this.y4);
    endShape(CLOSE); 
    pop();
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
      this.drawArrow(this.pt1, diffVector, this.highlightColor, true);
    } else {
      this.drawArrow(this.pt1, diffVector, this.strokeColor, true);
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
