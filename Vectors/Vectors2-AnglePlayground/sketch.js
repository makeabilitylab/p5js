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

let mouseLineSegment1;
let mouseLineSegment2;

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
  
  if(mouseLineSegment1){
    mouseLineSegment1.draw();
  }
  
  if(mouseLineSegment2){
    mouseLineSegment2.draw();
  }
  
  if(mouseLineSegment1 && mouseLineSegment2){
    let v1 = mouseLineSegment1.getVectorAtOrigin();
    let v2 = mouseLineSegment2.getVectorAtOrigin();
    
    push();
    noStroke();
    fill(0);
    let angleInRadians = v1.angleBetween(v2);
    let angleInDegrees = degrees(angleInRadians);
    textSize(14);
    text(nfc(angleInDegrees,2) + "°", 5, 15);
    
    //for debugging--draws the lines for the vectors
    //will only show up if vectors in bottom-right quadrant
    stroke(0);
    line(0, 0, v1.x, v1.y);
    line(0, 0, v2.x, v2.y);
    
    // more debugging stuff, draws light versions of vectors                                    
    let middleScreen = createVector(width/2, height/2);
    v1.add(middleScreen);
    let tmpLineSegment1 = new LineSegment(middleScreen, v1);
    tmpLineSegment1.strokeColor = color(mouseLineSegment1.strokeColor);
    tmpLineSegment1.strokeColor.setAlpha(25);
    tmpLineSegment1.draw();
    
    v2.add(middleScreen);
    let tmpLineSegment2 = new LineSegment(middleScreen, v2);
    tmpLineSegment2.strokeColor = color(mouseLineSegment2.strokeColor);
    tmpLineSegment2.strokeColor.setAlpha(25);
    tmpLineSegment2.draw();
    
    pop();
  }
  
}

function mouseClicked() {
  if(mouseLineSegment1 && mouseLineSegment2){
    mouseLineSegment1 = null;
    mouseLineSegment2 = null;
  }
  
  if (lastMouseClickPos != null) {
    lastMouseClickPos = null;
  } else {
    lastMouseClickPos = curMouseClickPos;
  }
  curMouseClickPos = createVector(mouseX, mouseY);

  if (lastMouseClickPos != null && curMouseClickPos != null) {
    if(!mouseLineSegment1){
      mouseLineSegment1 = new LineSegment(lastMouseClickPos, curMouseClickPos);
      mouseLineSegment1.strokeColor = 'red';
    }else if(!mouseLineSegment2){
      mouseLineSegment2 = new LineSegment(lastMouseClickPos, curMouseClickPos);
      mouseLineSegment2.strokeColor = 'blue';
    }
  }

  // prevent default
  return false;
}

class LineSegment{
  constructor(x1, y1, x2, y2){
    //x1 and y1 can either be vectors or the points for p1
    if(arguments.length == 2 && typeof x1 === 'object' &&
       typeof y1 === 'object'){
      this.pt1 = x1;
      this.pt2 = y1;
    }else{
      this.pt1 = createVector(x1, y1);
      this.pt2 = createVector(x2, y2);
    }
    this.strokeColor = color(0);
    this.isDashedLine = false;
    this.turnOnTextLabels = true;
    this.strokeWeight = 2;
  }
  
  get x1(){
    return this.pt1.x; 
  }
  
  get y1(){
    return this.pt1.y; 
  }
  
  get x2(){
    return this.pt2.x; 
  }
  
  get y2(){
    return this.pt2.y; 
  }
  
  get heading(){
    let diffVector = p5.Vector.sub(this.pt2, this.pt1);
    return diffVector.heading();
  }
  
  getVectorAtOrigin(){
    return createVector(this.x2 - this.x1, this.y2 - this.y1);
  }
  
  draw(){
    push();
    stroke(this.strokeColor);
    //line(this.pt1.x, this.pt1.y, this.pt2.x, this.pt2.y);
    let diffVector = p5.Vector.sub(this.pt2, this.pt1);
    this.drawArrow(this.pt1, diffVector, this.strokeColor);
    pop();
  }
  
  drawArrow(base, vec, myColor) {
    push();
    stroke(myColor);
    strokeWeight(this.strokeWeight);
    fill(myColor);
    translate(base);
    push();
    if(this.isDashedLine){
      drawingContext.setLineDash([5, 15]);
    }
    line(0, 0, vec.x, vec.y);
    pop();
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
    
    // calculate heading in radians and degrees
    // and also print out magnitude
    //print(degrees(this.velocity.heading()));
    noStroke();
    //rotate(-vec.heading());
    textSize(8);
    let lbl = nfc(degrees(vec.heading()), 1)+ "°" + 
              ", " + nfc(vec.mag(), 1);
    let lblWidth = textWidth(lbl);
    text(lbl, -lblWidth, 12);
    
    pop();
  }
  
}