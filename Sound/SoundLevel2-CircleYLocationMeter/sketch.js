// Ball moves up from bottom of screen and animates down
//
// By Jon Froehlich
// http://makeabilitylab.io/

let mic;
let x;
let y; 
let yGravity = 5;
let diameter = 30;

function setup() {
  createCanvas(400, 400);
  
  mic = new p5.AudioIn(); // see https://p5js.org/reference/#/p5.AudioIn
  mic.start();
  
  x = width / 2;
  y = height - diameter / 2;
  
  fill(200, 0, 0, 200);
  noStroke();
}

function draw() {
  // background(220, 220, 220, 10);
  background(220);
  
  // get current microphone level
  let micLevel = mic.getLevel(); // between 0 and 1
  
  let newYLocation = map(micLevel, 0, 1, height, 0);
  
  if(newYLocation > y){
    y += yGravity; 
  }else{
    y = newYLocation; 
  }
  
  if(y + diameter / 2 > height){
    y = height - diameter/2; 
  }
  
  // the size of the circle proportional to mic level
  //let diameter = map(micLevel, 0, 1, 5, maxDiameter);
  ellipse(x, y, diameter);
}