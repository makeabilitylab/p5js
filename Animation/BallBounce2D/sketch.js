// A simple two dimensional animation of a circle bouncing back and forth
//
// By Jon Froehlich
// http://makeabilitylab.io
// 
// See:
//  - https://learning.oreilly.com/library/view/make-getting-started/9781457186769/ch08.html#motion
//  - https://medium.com/comsystoreply/introduction-to-p5-js-9a7da09f20aa

let x;
let y;
let xSpeed;
let ySpeed;
let diameter = 40;

function setup() {
  createCanvas(600, 400);
  x = width / 2;
  y = height / 2;
  
  xSpeed = random(2, 4); // random x speed between 2 and 4
  ySpeed = random(2, 5); // random y speed between 2 and 5
  
  fill(200, 0, 0);
  noStroke();
}

function draw() {
  background(220);
  x += xSpeed;
  y += ySpeed;
  ellipse(x, y, diameter);
  
  // check to make sure it doesn't go offscreen
  let radius = diameter / 2;
  if(x - radius < 0 || x + radius > width){
    xSpeed = xSpeed * -1; // reverse x direction
  }
  
  if(y - radius < 0 || y + radius > height){
    ySpeed = ySpeed * -1; // reverse y direction
  }
}
