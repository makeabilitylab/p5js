/**
 * A simple flower
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/


function setup() {
  createCanvas(600, 400);
  
  angleMode(DEGREES); 
}

function draw() {
  background(10);

  push();
  colorMode(HSB);
  const angleStep = 10;

  ellipseMode(CORNER);
  translate(width / 2, height / 2);
  for(let angle = 0; angle < 360; angle += angleStep){
    const hue = angle;
    stroke(hue, 100, 100, 0.8);
    fill(hue, 100, 100, 0.2);
    rotate(angleStep);
    ellipse(0, 0, 150, 50);
  }
  noStroke();

  // ellipseMode(CENTER);
  // fill(44, 100, 100, 0.8);
  // circle(0, 0, 18)
  pop();
}