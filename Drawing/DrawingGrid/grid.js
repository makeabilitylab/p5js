// Where the x and y axes are anchored: at the canvas top-left (p5's default
// coordinate origin) or at its center.
const AxisAlignment = {
  TOPLEFT: 'topleft',
  CENTER: 'center',
}


// A teaching overlay that visualizes p5.js screen coordinates: it draws the x/y
// axes with labeled arrows, a faint cell grid, tick marks with coordinate
// labels, an optional center point, and a live readout of the mouse position.
// An optional red/black checkerboard (cached offscreen) illustrates per-pixel
// addressing. Configure the public flags (isCheckboardOn, isCenterPtOn,
// axisAlignment) before calling draw().
class Grid {
  constructor() {
    this.axisColor = color(128);
    this.axisTextColor = color(200);
    this.axisTextSize = 10;
    
    this.arrowColor = color(80);
    this.tickSize = 5;
    this.gridCellSize = 50;
    this.gridColor = color(128, 128, 128, 50);
    this.textScalar = 0.8;
    this.arrowLineSize = 15;
    this.arrowSize = 5;
    this.axisAlignment = AxisAlignment.TOPLEFT;
    
    this.bufferedCheckboard = null;
    this.isCheckboardOn = false;
    
    this.isCenterPtOn = true;
  }

  // Render the full overlay: grid lines, both axes, optional center point, and
  // the mouse readout. Call this from the sketch's draw().
  draw() {
    push();
    strokeWeight(1);
    textSize(this.axisTextSize);
    
    if(this.isCheckboardOn){
      this.drawCheckboard();
      this.arrowColor = color(200);
    }else{
      this.arrowColor = color(80);  
    }
    
    this.drawGrid();
    this.drawYAxis();
    this.drawXAxis();
    if(this.isCenterPtOn){
      this.drawCenterPt();
    }
    this.drawMousePosition();
    pop();
  }

  // Draw a dot at the canvas center, labeled with its (x, y) coordinates.
  drawCenterPt() {
    push();
    fill(this.axisTextColor);
    let x = width / 2;
    let y = height / 2;
    ellipse(x, y, 5);
    noStroke();
    textSize(8);
    fill(this.axisTextColor);
    text(x + ", " + y, x + 3, y - 2);
    pop();
  }

  // Draw faint vertical and horizontal lines every gridCellSize pixels.
  drawGrid() {
    noFill();
    stroke(this.gridColor);
    for (let x = 0; x < width; x += this.gridCellSize) {
      line(x, 0, x, height);
    }

    for (let y = 0; y < height; y += this.gridCellSize) {
      line(0, y, width, y);
    }
  }

  // Paint a 1px red/black checkerboard across the canvas. Building it pixel by
  // pixel is slow, so it is rendered once into a cached offscreen buffer and
  // then blitted each frame.
  drawCheckboard() {
    // only draw this to an offscreen graphics buffer
    // because it takes a long time! So, this way, we only 
    // draw the checkboard once (to an offscreen bitmap)
    // and then we just paint this image to the screen rather than
    // redoing the checkboard everytime
    if(!this.bufferedCheckboard){
      this.bufferedCheckboard = createGraphics(width, height);
      
      let offscreenGraphicsBuffer = this.bufferedCheckboard;
    
      offscreenGraphicsBuffer.push();
      offscreenGraphicsBuffer.noFill();
      let color1 = color(150, 0, 0);
      let color2 = color(0);
      for (let y = 0; y < height; y += 1) {
        for (let x = 0; x < width; x += 1) {
          if(y % 2 == 0 && x % 2 == 0){
            offscreenGraphicsBuffer.stroke(color1); 
          }else if(y % 2 == 0 && x % 2 == 1){
            offscreenGraphicsBuffer.stroke(color2); 
          }else if(y % 2 == 1 && x % 2 == 0){
            offscreenGraphicsBuffer.stroke(color2); 
          }else{
            offscreenGraphicsBuffer.stroke(color1); 
          }

          offscreenGraphicsBuffer.point(x, y);
        }
      }
      offscreenGraphicsBuffer.pop();
    }
    
    image(this.bufferedCheckboard, 0, 0);  
  }

  // Draw the horizontal axis with a labeled "x values" arrow and numbered tick
  // marks at each grid line. Placement depends on axisAlignment (top edge vs.
  // vertical center).
  drawXAxis() {
    let asc = textAscent() * this.textScalar;
    let desc = textDescent() * this.textScalar;
    let strHeight = asc + desc;

    // draw x axis
    stroke(this.axisColor);
    let xAxisLoc = height / 2;
    if (this.axisAlignment == AxisAlignment.TOPLEFT) {
      xAxisLoc = 0;
    }

    line(0, xAxisLoc, width, xAxisLoc);

    // draw x values arrow
    let str = "x values";
    let strWidth = textWidth(str);
    let xArrowLine = strWidth + 6;
    let yArrowLine = height / 2 - 10;

    if (this.axisAlignment == AxisAlignment.CENTER) {
      noStroke();
      fill(this.arrowColor);
      text(str, 3, yArrowLine + asc / 2 - 1);
      stroke(this.arrowColor);
    } else if (this.axisAlignment == AxisAlignment.TOPLEFT) {

      let yText = this.gridCellSize - 1;
      let xText = this.gridCellSize + 5;
      yArrowLine = yText - asc / 2;
      xArrowLine = xText + strWidth + 6;
      noStroke();
      fill(this.arrowColor);
      text(str, xText, yText);
      stroke(this.arrowColor);
    }

    this.drawLineWithArrow(xArrowLine, yArrowLine, xArrowLine + this.arrowLineSize, yArrowLine, this.arrowSize);

    // draw ticks along x-axis
    let yTickStart = xAxisLoc - this.tickSize / 2;
    fill(200);
    for (let x = 0; x < width; x += this.gridCellSize) {
      stroke(this.axisColor);
      line(x, yTickStart, x, yTickStart + this.tickSize);

      noStroke();
      fill(this.axisTextColor);
      let strWidth = textWidth(x);

      if ((this.axisAlignment == AxisAlignment.CENTER && int(x) == int(width / 2)) ||
        (this.axisAlignment == AxisAlignment.TOPLEFT && x == 0)) {
        // don't draw text
      } else {
        text(x, x - strWidth / 2, yTickStart + this.tickSize + strHeight);
      }
    }
  }

  // Draw the vertical axis with a rotated "y values" arrow and numbered tick
  // marks at each grid line. Placement depends on axisAlignment (left edge vs.
  // horizontal center).
  drawYAxis() {
    let asc = textAscent() * this.textScalar;
    let desc = textDescent() * this.textScalar;
    let strHeight = asc + desc;

    // draw y axis
    stroke(this.axisColor); // set color to gray
    let yAxisLoc = width / 2;
    if (this.axisAlignment == AxisAlignment.TOPLEFT) {
      yAxisLoc = 0;
    }
    line(yAxisLoc, 0, yAxisLoc, height);

    // draw y values arrow
    let xText = width / 2 - strHeight - 2;
    let yText = 3;
    if (this.axisAlignment == AxisAlignment.TOPLEFT) {
      xText = this.gridCellSize;
      yText = this.gridCellSize + 5;
    }

    let str = "y values";
    let strWidth = textWidth(str);
    push();
    noStroke();
    fill(this.arrowColor);
    rotate(HALF_PI);
    translate(yText, -xText);
    text(str, 0, 0);
    pop();

    stroke(this.arrowColor);
    fill(this.arrowColor);
    let yLine = yText + strWidth + 6;
    let xLine = xText + asc / 2 - 1.5;
    this.drawLineWithArrow(xLine, yLine, xLine, yLine + this.arrowLineSize, this.arrowSize);

    // draw ticks along y-axis
    let xTickStart = yAxisLoc - this.tickSize / 2;
    for (let y = 0; y < height; y += this.gridCellSize) {
      stroke(this.axisColor);
      line(xTickStart, y, xTickStart + this.tickSize, y);

      noStroke();
      fill(this.axisTextColor);
      let strWidth = textWidth(y);
      if ((this.axisAlignment == AxisAlignment.CENTER && int(y) == int(height / 2)) ||
        (this.axisAlignment == AxisAlignment.TOPLEFT && y == 0)) {
        // don't draw text
      } else {
        text(y, xTickStart + this.tickSize + 4, y + asc / 2);
      }
    }
  }

  // Mark the cursor and label it with its live (x, y) coordinates, nudging the
  // label inward so it stays on-canvas near the right and top edges.
  drawMousePosition() {
    push();
    textSize(12);

    let strMouseCoordinates = "x=" + mouseX + ", y=" + mouseY;
    fill(255, 0, 255);
    point(mouseX, mouseY);
    //ellipse(mouseX, mouseY, 5);

    fill(230);
    stroke(230);
    let strWidth = textWidth(strMouseCoordinates);
    let strHeight = textAscent() + textDescent();
    let xPos = mouseX;
    if (mouseX + strWidth > width) {
      xPos = width - strWidth;
    }
    let yPos = mouseY;
    if (mouseY - strHeight < 0) {
      yPos = strHeight - textDescent();
    }
    noStroke();
    text(strMouseCoordinates, xPos, yPos);
    pop();
  }

  // Draw a line from (x1,y1) to (x2,y2) capped with a filled triangle arrowhead
  // at the (x2,y2) end, sized by arrowSize.
  drawLineWithArrow(x1, y1, x2, y2, arrowSize) {
    //from: https://stackoverflow.com/a/44892083
    line(x1, y1, x2, y2); //draw a line beetween the vertices

    push() //start new drawing state
    let angle = atan2(y1 - y2, x1 - x2); //gets the angle of the line
    translate(x2, y2); //translates to the destination vertex
    rotate(angle - HALF_PI); //rotates the arrow point
    triangle(-arrowSize * 0.5, arrowSize, arrowSize * 0.5, arrowSize, 0, -arrowSize / 2); //draws the arrow point as a triangle
    pop();
  }

}