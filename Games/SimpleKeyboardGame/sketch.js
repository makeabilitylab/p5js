// A basic keyboard game in p5js. Move the blue ball into the blackhole
// and get a point
//
// By Jon Froehlich
// http://makeabilitylab.io
// 
// See:
//  - https://learning.oreilly.com/library/view/make-getting-started/9781457186769/ch05.html#response


let avatar;
let blackhole;
let score = 0;

function setup() {
  createCanvas(600, 400);
  
  // create the game character
  avatar = new Ball(width/2, height/2, 30, color(0, 0, 255, 140));
  
  // create the black hole
  let blackholeDiameter = random(avatar.diameter + 10, 100);
  let blackholeRadius = blackholeDiameter/2;
  let blackholeX = random(blackholeRadius, width - blackholeRadius);
  let blackholeY = random(blackholeRadius, height - blackholeRadius);
  blackhole = new Ball(blackholeX, blackholeY, blackholeDiameter, color(0, 0, 0, 128));
}

function draw() {
  background(204);
  
  
  blackhole.draw();
  
  if(blackhole.contains(avatar)){
    print("Yum!");
    score++;
    blackhole.relocate();
  }
  
  avatar.draw();
  textSize(20);
  text("Score:" + score, 10, 20);

}

function keyPressed() {
  //print(keyCode, key);
  
  // don't put any drawing code in here!
  let pixelIncrement = 15;
  if (keyCode == LEFT_ARROW) {
    avatar.x = avatar.x - pixelIncrement;
  } else if (keyCode == RIGHT_ARROW) {
    avatar.x = avatar.x + pixelIncrement;
  } else if(keyCode == DOWN_ARROW){
    avatar.y = avatar.y + pixelIncrement; 
  }else if(keyCode == UP_ARROW){
    avatar.y = avatar.y - pixelIncrement; 
  }
  
  if(key == ' '){ // jump
    avatar.y = avatar.y - 100; 
  }
}

class Ball{
  constructor(x, y, diameter, fillColor){
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.fillColor = fillColor;
  }
  
  draw(){
    push();
    noStroke();
    fill(this.fillColor);
    ellipse(this.x, this.y, this.diameter);
    pop();
  }
  
  relocate(){
    let radius = this.diameter / 2;
    this.x = random(radius, width - radius);
    this.y = random(radius, height - radius);  
  }
  
  contains(otherBall){
    let distFromThisBallToOtherBall = dist(this.x, this.y, otherBall.x, otherBall.y);
    let otherBallRadius = otherBall.diameter / 2;
    let thisRadius = this.diameter / 2;
    if(distFromThisBallToOtherBall + otherBallRadius <= thisRadius){
      return true;  
    }
    return false;
  }
}










