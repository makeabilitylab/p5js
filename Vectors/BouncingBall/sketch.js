//
// Bouncing ball, part 1: motion from velocity + acceleration vectors.
// A vector has both magnitude and direction. Each frame the ball's velocity
// vector moves it, an acceleration vector speeds it up (in the heading
// direction), and it bounces off the walls. See BouncingBallWithAcceleration
// for a version where YOU set the acceleration vector with the mouse.
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
//
// TODO:
// - Make walls with arbitrary angles for bouncing:
//    - https://stackoverflow.com/a/573206
//    - Book section on similar topic: http://bit.ly/387rBpT
//    - http://www.migapro.com/circle-and-rotated-rectangle-collision-detection/

let ball;

// Create the bouncing ball.
function setup() {
  createCanvas(400, 400);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A white ball with a short heading line moves across a gray canvas, speeding up due to acceleration and bouncing off the four walls, illustrating velocity and acceleration vectors.");
  ball = new Ball();
  //noLoop();
}

// Each frame: advance the ball's physics, then draw it.
function draw() {
  background(220);
  ball.update();
  ball.draw();
}

class Ball{

  // Start at top-left with a random direction; acceleration points the same
  // way as the initial velocity, so the ball speeds up until it hits a wall.
  constructor(){
    this.position = createVector(50, 50);
    this.diameter = 20;
    
    this.baseAcceleration = 0.1;
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
  
  // Called after a wall bounce: reset speed to base and re-aim acceleration
  // along the (newly reflected) velocity so the ball keeps speeding up.
  resetVelocityAndAcceleration(){
    this.velocity.setMag(this.baseSpeed);

    // sets up an acceleration vector that always accelerates
    // in same exact direction as velocity vector
    this.acceleration = this.velocity.copy().normalize();
    this.acceleration.setMag(this.baseAcceleration);
  }

  // Position/size accessors (getters let you read x/y/radius like properties).
  get x(){
    return this.position.x;
  }

  get y(){
    return this.position.y;
  }

  get radius(){
    // see: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Functions/get
    return this.diameter / 2;  
  }
  
  // Advance one frame: add acceleration to velocity (capping at maxSpeed), move
  // the ball, and bounce off any wall it crosses (flipping that axis and nudging
  // it back in-bounds so it can't stick to the edge).
  update(){
    this.velocity.add(this.acceleration);
    if(this.velocity.mag() >= this.maxSpeed){
      this.velocity.setMag(this.maxSpeed);
      this.acceleration.setMag(0); 
      
      // Note: could also use the limit function here to 
      // constrain velocity to its maxspeed
      // e.g., this.velocity.limit(this.maxSpeed);
    }
    
    this.position.add(this.velocity);
    
    if(this.x - this.radius <= 0 || this.x + this.radius >= width){
      this.velocity.x *= -1; 
      
      // needed so ball doesn't get stuck at edge due to rounding
      if(this.x - this.radius <= 0){
        this.position.x = this.radius; 
      }else{
        this.position.x = width - this.radius; 
      }
      
      this.resetVelocityAndAcceleration();
    }
    
    if(this.y - this.radius <= 0 || this.y + this.radius >= height){
      this.velocity.y *= -1; 
      
      // needed so ball doesn't get stuck on edge
      if(this.y - this.radius <= 0){
        this.position.y = this.radius; 
      }else{
        this.position.y = height - this.radius; 
      }
      
      this.resetVelocityAndAcceleration();
    }
  }
  
  // Draw the ball plus a short line pointing in its direction of travel.
  draw(){
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