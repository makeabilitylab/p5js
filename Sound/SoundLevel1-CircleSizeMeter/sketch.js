// Visualizes sound loudness using a ball
//
// By Jon Froehlich
// http://makeabilitylab.io/

let mic;
let x;
let y; 
let maxDiameter = 400;

function setup() {
  createCanvas(400, 400);
  
  mic = new p5.AudioIn(); // see https://p5js.org/reference/#/p5.AudioIn
  mic.start();
  
  x = width / 2;
  y = height / 2;
  
  fill(200, 0, 0, 200);
  noStroke();
}

function draw() {
  // background(220, 220, 220, 10);
  background(220);
  
  // get current microphone level
  let micLevel = mic.getLevel(); // between 0 and 1
  
  // the size of the circle proportional to mic level
  let diameter = map(micLevel, 0, 1, 5, maxDiameter);
  ellipse(x, y, diameter);
}