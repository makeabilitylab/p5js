class ColorAxes3D {


  constructor(axisLength, boxSize, boxMargin, maxColor, colorStep){
    this.axisLength = axisLength;
    this.axisRadius = 2;
    this.coneRadius = 4; // used for axis arrows
    this.coneLength = 10;

    this.boxSize = boxSize;
    this.boxMargin = boxMargin;
    this.maxColor = maxColor;
    this.colorStep = colorStep;

    this.tickFontSize = 10;
    this.tickMarkLength = 10;
    this.tickMarkMargin = 2;
  }

  draw() {
    
    push();

    // put axes right on the edges of the boxes (rather than through center)
    translate(-this.boxSize / 2, this.boxSize / 2, -this.boxSize / 2);

    // draw green (y) and red (x) outline grid
    push();
    noFill();
    for (let r = 0; r <= this.maxColor; r += this.colorStep) {
      for (let g = 0; g <= this.maxColor; g += this.colorStep) {
        // fill(r, g, 0);
        stroke(r, g, 0);
        let x = (r / this.colorStep) * (this.boxSize + this.boxMargin);
        let y = -this.boxSize - (g / this.colorStep) * (this.boxSize + this.boxMargin);
        rect(x, y, this.boxSize);
      }
    }
    pop();

    // draw red (x) and blue (z) outline grid
    push();
    noFill();
    rotateX(HALF_PI);
    for (let r = 0; r <= this.maxColor; r += this.colorStep) {
      for (let b = 0; b <= this.maxColor; b += this.colorStep) {
        // fill(r, 0, b);
        stroke(r, 0, b);
        let x = (r / this.colorStep) * (this.boxSize + this.boxMargin);
        let y = (b / this.colorStep) * (this.boxSize + this.boxMargin);
        rect(x, y, this.boxSize);
      }
    }
    pop();

    // draw green (y) and blue (z) outline grid
    push();
    noFill();
    rotateY(HALF_PI);
    for (let g = 0; g <= this.maxColor; g += this.colorStep) {
      for (let b = 0; b <= this.maxColor; b += this.colorStep) {
        // fill(0, g, b);
        stroke(0, g, b);
        let x = -this.boxSize - (b / this.colorStep) * (this.boxSize + this.boxMargin);
        let y = -this.boxSize - (g / this.colorStep) * (this.boxSize + this.boxMargin);
        rect(x, y, this.boxSize);
      }
    }
    pop();


    // draw y-axis (green)
    push();
    noStroke();
    fill(0, 255, 0);
    rotateX(PI);
    translate(0, this.axisLength / 2, 0);
    cylinder(this.axisRadius, this.axisLength);
    translate(0, this.axisLength / 2, 0);
    cone(this.coneRadius, this.coneLength);
    pop();


    // draw y-axis (green) title
    push();
    fill(0, 255, 0);
    translate(0, -this.axisLength - this.coneLength - textSize(), 0);
    let lbl = "Green";
    let lblWidth = textWidth(lbl);
    text(lbl, -lblWidth / 2, 14);
    pop();

    // draw y-axis (green) ticks and tick labels
    push();
    textSize(this.tickFontSize);
    for (let g = 0; g <= this.maxColor; g += this.colorStep) {
      stroke(0, g, 0);
      let x = -this.boxSize / 2 - this.tickMarkLength;
      let y = -this.boxSize / 2 - (g / this.colorStep) * (this.boxSize + this.boxMargin);
      rect(x, y, this.tickMarkLength, 1);

      noStroke();
      let lblTick = nfc(g, 1);
      let lblTickWidth = textWidth(lblTick);
      fill(0, g, 0);
      text(lblTick, x - lblTickWidth - this.tickMarkMargin, y + textSize() / 3);
    }
    pop();


    // draw z-axis (blue) and z-axis title
    push();
    rotateX(HALF_PI);
    translate(0, this.axisLength / 2, 0);
    noStroke();
    fill(0, 0, 255);
    cylinder(this.axisRadius, this.axisLength);
    translate(0, this.axisLength / 2, 0);
    cone(this.coneRadius, this.coneLength);
    lbl = "Blue";
    lblWidth = textWidth(lbl);
    text(lbl, -lblWidth / 2, 14);
    pop();

    // draw z-axis (blue) ticks and tick labels
    push();
    textSize(this.tickFontSize);
    rotateX(HALF_PI);
    for (let b = 0; b <= this.maxColor; b += this.colorStep) {
      stroke(0, 0, b);
      let x = -this.boxSize / 2 - this.tickMarkLength;
      let y = this.boxSize / 2 + (b / this.colorStep) * (this.boxSize + this.boxMargin);
      rect(x, y, this.tickMarkLength, 1);

      noStroke();
      let lblTick = nfc(b, 1);
      let lblTickWidth = textWidth(lblTick);
      fill(0, 0, b);
      text(lblTick, x - lblTickWidth - this.tickMarkMargin, y + textSize() / 3);
    }
    pop();

    // draw x-axis (red)
    push();
    noStroke();
    rotateZ(-HALF_PI);
    translate(0, this.axisLength / 2, 0);
    fill(255, 0, 0);
    cylinder(this.axisRadius, this.axisLength);
    translate(0, this.axisLength / 2, 0);
    cone(this.coneRadius, this.coneLength);
    pop();

    // draw x-axis (red) title
    push();
    fill(255, 0, 0);
    lbl = "Red";
    lblWidth = textWidth(lbl);
    translate(this.axisLength + this.coneLength, 0, 0);
    text(lbl, -2, textSize() / 3);
    pop();

    // draw x-axis ticks and labels
    push();
    rotateZ(-HALF_PI);
    for (let r = 0; r <= this.maxColor; r += this.colorStep) {
      stroke(r, 0, 0);
      let x = -this.boxSize / 2 - this.tickMarkLength;
      let y = this.boxSize / 2 + (r / this.colorStep) * (this.boxSize + this.boxMargin);
      rect(x, y, this.tickMarkLength, 1);

      noStroke();
      let lblTick = nfc(r, 1);
      let lblTickWidth = textWidth(lblTick);
      fill(r, 0, 0);
      text(lblTick, x - lblTickWidth - this.tickMarkMargin, y + textSize() / 3);
    }

    pop();

    pop();
  }

}

