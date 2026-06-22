// Use the mouse to explore a vector's MAGNITUDE (its length).
// Click once to anchor a red vector, then move the mouse left/right to grow
// or shrink its magnitude. See AnglePlayground for the companion sketch that
// explores the angle between two vectors.
//
// By Jon Froehlich
// @jonfroehlich
// http://makeabilitylab.io/

let mouseLineSegment;

let lastMouseClickPos;
let curMouseClickPos;

function setup() {
  createCanvas(400, 400);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("An interactive playground where clicking draws a red vector arrow and then moving the mouse left or right changes its magnitude (length), illustrating how a vector's magnitude can be adjusted.");
}

// Each frame: show a dot at the first click, then draw the red vector once a
// second point exists.
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

// Two clicks define the vector (anchor point, then tip); clicking again resets.
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

// Dragging the mouse left/right rescales the vector's magnitude (length) while
// keeping its anchor and direction fixed.
function mouseMoved(){
  if(mouseLineSegment){
    let maxLength = width - mouseLineSegment.pt1.x;
    let len = 1 + mouseX / width * maxLength;
    mouseLineSegment.setMagnitude(len);
  }
}