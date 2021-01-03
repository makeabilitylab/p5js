class ColorAxes3D {

  constructor(colorCube3D){
    this.colorCube3D = colorCube3D;
    this.axisLength = colorCube3D.width * 1.2;
    this.axisRadius = 2;
    this.coneRadius = 4; // used for axis arrows
    this.coneLength = 10;

    this.tickFontSize = 10;
    this.tickMarkLength = 10;
    this.tickMarkMargin = 2;
  }

  draw() {

    

    this.drawGrid();
    this.drawAxes();
    this.drawTickMarks();
  }

  drawTickMarks(){

    push();

    // put axes right on the edges of the boxes (rather than through center)
    translate(-colorCube3D.boxSize / 2, colorCube3D.boxSize / 2, -colorCube3D.boxSize / 2);

    // draw y-axis (green) ticks and tick labels
    push();
    textSize(this.tickFontSize);
    for(let yCol = 0; yCol < this.colorCube3D.numCols; yCol++){
      let cube = [0, yCol, 0];
      let c = ColorCube3D.getColorForCube(cube, this.colorCube3D.numCols);
      let cubeLoc = ColorCube3D.getCubeLocationForCube(cube, this.colorCube3D.boxSize, this.colorCube3D.boxMargin);
      
      // setup and draw tick location
      let x = cubeLoc[0] - this.colorCube3D.boxSize / 2 - this.tickMarkLength;
      let y = cubeLoc[1] - this.colorCube3D.boxSize / 2;
      stroke(c);
      rect(x, y, this.tickMarkLength, 1);

      // draw tick label
      let lblTick = nfc(green(c), 1);
      let lblTickWidth = textWidth(lblTick);
      fill(c);
      text(lblTick, x - lblTickWidth - this.tickMarkMargin, y + textSize() / 3);
    }
    pop();

    // draw z-axis (blue) ticks and tick labels
    push();
    textSize(this.tickFontSize);
    rotateX(HALF_PI);
    for(let zCol = 0; zCol < this.colorCube3D.numCols; zCol++){
      let cube = [0, 0, zCol];
      let c = ColorCube3D.getColorForCube(cube, this.colorCube3D.numCols);
      let cubeLoc = ColorCube3D.getCubeLocationForCube(cube, this.colorCube3D.boxSize, this.colorCube3D.boxMargin);
      
      // setup and draw tick location
      let x = cubeLoc[0] - this.colorCube3D.boxSize / 2 - this.tickMarkLength;
      let y = cubeLoc[2] + this.colorCube3D.boxSize / 2;
      stroke(c);
      rect(x, y, this.tickMarkLength, 1);

      // draw tick label
      let lblTick = nfc(blue(c), 1);
      let lblTickWidth = textWidth(lblTick);
      fill(c);
      text(lblTick, x - lblTickWidth - this.tickMarkMargin, y + textSize() / 3);
    }
    pop();

    // draw x-axis (red) ticks and labels
    push();
    rotateZ(-HALF_PI);
    for(let xCol = 0; xCol < this.colorCube3D.numCols; xCol++){
      let cube = [xCol, 0, 0];
      let c = ColorCube3D.getColorForCube(cube, this.colorCube3D.numCols);
      let cubeLoc = ColorCube3D.getCubeLocationForCube(cube, this.colorCube3D.boxSize, this.colorCube3D.boxMargin);
      
      // setup and draw tick location
      let x = cubeLoc[1] - this.colorCube3D.boxSize / 2 - this.tickMarkLength;
      let y = cubeLoc[0] + this.colorCube3D.boxSize / 2;
      stroke(c);
      rect(x, y, this.tickMarkLength, 1);

      // draw tick label
      let lblTick = nfc(red(c), 1);
      let lblTickWidth = textWidth(lblTick);
      fill(c);
      text(lblTick, x - lblTickWidth - this.tickMarkMargin, y + textSize() / 3);
    }

    for (let r = 0; r <= this.maxColor; r += colorStep) {
      stroke(r, 0, 0);
      let x = -this.boxSize / 2 - this.tickMarkLength;
      let y = this.boxSize / 2 + (r / colorStep) * (this.boxSize + this.boxMargin);
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

  drawAxes(){
    push();
    
    // put axes right on the edges of the boxes (rather than through center)
    translate(-colorCube3D.boxSize / 2, colorCube3D.boxSize / 2, -colorCube3D.boxSize / 2);

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

    pop();
  }

  drawGrid(){
    // draw green (y) and red (x) outline grid
    push();
    noFill();
    translate(0, 0, -this.colorCube3D.boxSize / 2);
    rectMode(CENTER); // p5js 3D mode draws boxes through center, so match this with 2D
    for(let xCol = 0; xCol < this.colorCube3D.numCols; xCol++){
      for(let yCol = 0; yCol < this.colorCube3D.numCols; yCol++){
        let cube = [xCol, yCol, 0];
        let c = ColorCube3D.getColorForCube(cube, this.colorCube3D.numCols);
        let cubeLoc = ColorCube3D.getCubeLocationForCube(cube, this.colorCube3D.boxSize, this.colorCube3D.boxMargin);
        stroke(c);
        rect(cubeLoc[0], cubeLoc[1], colorCube3D.boxSize);
      }
    }
    pop();

    // draw red (x) and blue (z) outline grid
    push();
    noFill();
    translate(0, this.colorCube3D.boxSize / 2, 0);
    rotateX(HALF_PI);
    rectMode(CENTER);
    for(let xCol = 0; xCol < this.colorCube3D.numCols; xCol++){
      for(let zCol = 0; zCol < this.colorCube3D.numCols; zCol++){
        let cube = [xCol, 0, zCol];
        let c = ColorCube3D.getColorForCube(cube, this.colorCube3D.numCols);
        let cubeLoc = ColorCube3D.getCubeLocationForCube(cube, this.colorCube3D.boxSize, this.colorCube3D.boxMargin);
        stroke(c);
        rect(cubeLoc[0], cubeLoc[2], colorCube3D.boxSize);
      }
    }
    pop();

    // draw green (y) and blue (z) outline grid
    push();
    noFill();
    translate(-this.colorCube3D.boxSize / 2, 0, 0);
    rotateX(HALF_PI);
    rotateY(HALF_PI);
    rectMode(CENTER);
    for(let yCol = 0; yCol < this.colorCube3D.numCols; yCol++){
      for(let zCol = 0; zCol < this.colorCube3D.numCols; zCol++){
        let cube = [0, yCol, zCol];
        let c = ColorCube3D.getColorForCube(cube, this.colorCube3D.numCols);
        let cubeLoc = ColorCube3D.getCubeLocationForCube(cube, this.colorCube3D.boxSize, this.colorCube3D.boxMargin);
        stroke(c);
        rect(cubeLoc[1], cubeLoc[2], colorCube3D.boxSize);
      }
    }
    pop();
  }

}

