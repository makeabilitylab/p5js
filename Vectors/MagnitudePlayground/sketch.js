// Use the mouse to draw two vectors (by clicking)
// The program then outputs the angle between the two
// vectors
//
// TODO:
//  - In debug area, draw arc with degrees both inside angle and outside angle
//
// By Jon Froehlich
// @jonfroehlich
// http://makeabilitylab.io/

let mouseLineSegment;

let lastMouseClickPos;
let curMouseClickPos;

function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(220);
  
  if(curMouseClickPos && !lastMouseClickPos){
    push();
    fill(255);
    ellipse(curMouseClickPos.x, curMouseClickPos.y, 10);
    pop();
  }
  
  if(mouseLineSegment){
    mouseLineSegment.draw();
  }
  
}

function mouseClicked() {
  if(mouseLineSegment){
    mouseLineSegment = null;
  }
  
  if (lastMouseClickPos != null) {
    lastMouseClickPos = null;
  } else {
    lastMouseClickPos = curMouseClickPos;
  }
  curMouseClickPos = createVector(mouseX, mouseY);

  if (lastMouseClickPos != null && curMouseClickPos != null) {
    if(!mouseLineSegment){
      mouseLineSegment = new LineSegment(lastMouseClickPos, curMouseClickPos);
      mouseLineSegment.strokeColor = 'red';
    }
  }

  // prevent default
  return false;
}

function mouseMoved(){
  if(mouseLineSegment){
    let maxLength = width - mouseLineSegment.pt1.x;
    let len = 1 + mouseX / width * maxLength;
    mouseLineSegment.setMagnitude(len);
  }
}