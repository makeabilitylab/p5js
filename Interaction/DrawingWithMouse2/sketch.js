// A basic painting example with the mouse. The paint brush 
// size is determined by mouse speed. You can change the paint 
// brush from fill to stroke by pressing the mouse.
//
// By Jon Froehlich
// http://makeabilitylab.io
// 
// See:
//  - https://medium.com/comsystoreply/introduction-to-p5-js-9a7da09f20aa
//  - https://learning.oreilly.com/library/view/make-getting-started/9781457186769/ch05.html#response


let diameter = 20;

function setup() {
  createCanvas(600, 400);
  background(204);
  noStroke();
}

function draw() {
  if(mouseIsPressed == true){
    noFill();
    stroke(200, 0, 200, 200);
  }else{
    fill(200, 0, 200, 150); 
  }
  
  // set the diameter of the circle based on the distance
  // between the previous mouse points and current mouse points
  diameter = dist(mouseX, mouseY, pmouseX, pmouseY);
    
  ellipse(mouseX, mouseY, diameter);
}

