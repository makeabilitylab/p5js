// TODO: write description
// Based on:
// - Coding Train "Dot Product and Scalar Projection": 
//   https://youtu.be/_ENEsV_kNx8
//

let lineSegment;
let xAxisLineSegment;
let mouseLineSegment;

function setup() {
  createCanvas(400, 400);
  lineSegment = new LineSegment(width / 2, height / 2,
                         random(0, width), random(0, height));
  lineSegment.strokeColor = color(200, 0, 0);
  
  xAxisLineSegment = new LineSegment(width / 2, height / 2,
                                     width * 0.8, height / 2);
  
  xAxisLineSegment.strokeColor = color(120);
  xAxisLineSegment.isDashedLine = true;
}

function draw() {
  background(220);
  
  xAxisLineSegment.draw();
  
  lineSegment.draw();
  if(mouseLineSegment){
    mouseLineSegment.draw(); 
    
    // draw arc between x-axis and mouse line segment
    push();
    noFill();
    stroke(mouseLineSegment.strokeColor);
    drawingContext.setLineDash([1, 2]);
    translate(mouseLineSegment.x1, mouseLineSegment.y1);
    arc(0, 0, 30, 30, 0, mouseLineSegment.heading);  
    pop();
    
    // draw arc between mouse line and red segment
    push();
    noFill();
    stroke(0);
    drawingContext.setLineDash([1, 2]);
    translate(lineSegment.x1, lineSegment.y1);
    
    arc(0, 0, 70, 70, lineSegment.heading, mouseLineSegment.heading);  
    pop();
    
    // draw text angles
    push();
    textSize(10);
    //text("Angle Between X-Axis and Blue Vector: ");
    //text("Angle Between X-Axis and Red Vector: ");
    //text("Angle Between Red and Blue Vector: ");
    //noStroke();
    fill(0);
    
    // TODO: fix this
    stroke(0);
    let v1 = createVector(lineSegment.x2 - lineSegment.x1, lineSegment.y2 - lineSegment.y1);
    let v2 = createVector(mouseLineSegment.x2 - mouseLineSegment.x1, mouseLineSegment.y2 - mouseLineSegment.y1);
    
    //for debugging
    //line(0, 0, v1.x, v1.y);
    //line(0, 0, v2.x, v2.y);
    
    noStroke();
    let angleBetweenVectors = v1.angleBetween(v2);
    let angleInDegrees = degrees(angleBetweenVectors);
    fill(155);
    text("Legend: each vector measured in terms of degrees, magnitude", 5, 15);
    fill(0);
    let angle2InDegrees = 0;
    if(angleInDegrees < 0){
      angle2InDegrees = 360 + angleInDegrees;
    }else{
      angle2InDegrees = 360 - angleInDegrees;
    }
    text("Angle Between Red & Blue: " + nfc(angleInDegrees, 1) + "° or " + nfc(angle2InDegrees, 1) + "°", 5, 30);
    pop();
    //noLoop();
  }
  
  // draw arc between x-axis and red segment
  push();
  noFill();
  stroke(lineSegment.strokeColor);
  drawingContext.setLineDash([1, 2]);
  translate(lineSegment.x1, lineSegment.y1);
  arc(0, 0, 50, 50, 0, lineSegment.heading);  
  pop();
  
  
}

function mouseClicked() {
  mouseLineSegment = new LineSegment(lineSegment.x1, lineSegment.y1,
                                     mouseX, mouseY);
  mouseLineSegment.strokeColor = color(0, 0, 240);
}

class LineSegment{
  constructor(x1, y1, x2, y2){
    this.pt1 = createVector(x1, y1);
    this.pt2 = createVector(x2, y2);
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