class LineSegment {
  constructor(x1, y1, x2, y2) {
    //x1 and y1 can either be vectors or the points for p1
    if (arguments.length == 2 && typeof x1 === 'object' &&
      typeof y1 === 'object') {
      this.pt1 = x1;
      this.pt2 = y1;
    } else {
      this.pt1 = createVector(x1, y1);
      this.pt2 = createVector(x2, y2);
    }

    this.fontSize = 12;
    this.strokeColor = color(0);
    this.isDashedLine = false;
    this.turnOnTextLabels = true;
    this.strokeWeight = 2;
  }

  get x1() {
    return this.pt1.x;
  }

  get y1() {
    return this.pt1.y;
  }

  get x2() {
    return this.pt2.x;
  }

  get y2() {
    return this.pt2.y;
  }

  get heading() {
    let diffVector = p5.Vector.sub(this.pt2, this.pt1);
    return diffVector.heading();
  }

  getVectorAtOrigin() {
    return createVector(this.x2 - this.x1, this.y2 - this.y1);
  }

  draw() {
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
    if (this.isDashedLine) {
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
    textSize(this.fontSize);
    angleMode(RADIANS);
    let lbl = nfc(degrees(vec.heading()), 1) + "°" + ", " + nfc(vec.mag(), 1);
    let lblWidth = textWidth(lbl);
    text(lbl, -lblWidth, 12);

    pop();
  }
}