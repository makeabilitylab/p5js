//
// A vector has magnitude and direction 
//
//
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

function setup() {
  createCanvas(400, 400);
  ball = new Ball();
  //noLoop();
}

function draw() {
  background(220);
  ball.update();
  ball.draw();
}

class Ball{
  
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
  
  resetVelocityAndAcceleration(){
    this.velocity.setMag(this.baseSpeed);
    
    // sets up an acceleration vector that always accelerates
    // in same exact direction as velocity vector
    this.acceleration = this.velocity.copy().normalize();
    this.acceleration.setMag(this.baseAcceleration);
  }
  
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
  
  update(){
    this.velocity.add(this.acceleration);
    if(this.velocity.mag() >= this.maxSpeed){
      print("Max speed reached: ", this.velocity.mag());
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