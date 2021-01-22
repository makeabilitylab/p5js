/**
 * Shows an interactive view of the RGB color space: https://en.wikipedia.org/wiki/RGB_color_space
 * I created this visualization for two reasons: first, to help students better understand the
 * RGB color space. Second, as an initial learning foray into p5js 3D rendering.
 * 
 * You can control the viewpoint using the mouse (drag to change view) and the keyboard
 * to change colors. See also the following example, which combines the Color Cube with
 * 2D controls and visuals:
 * https://makeabilitylab.github.io/p5js/Color/ColorExplorer3D
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 *
 * TODO:
 * - [done] Draw grid (for debugging)
 * - [done] Draw axes
 * - [done] Draw axes ticks and tick labels
 * - [done] Allow cube selection (via keyboard)
 * - [done] Show 2D slices (allow those to be interactive), which will change cursor in cube
 *      - Will need to run multiple p5 sketches though? With 2D slices rendered elsewhere? And immune to orbit control camera?
 * - [done] When a cube is selected, highlight axis point as well (in white?) Maybe with tick or arrow?
 * - [] Show selected color in text (somewhere... maybe overlay as div)
 * - [] Convert library to instance mode? https://discourse.processing.org/t/how-to-adapt-a-library-for-instance-mode-p5js/11775
 * - [] Try texture mapped version where we draw just one large cube where the faces are textured based
 *      on current selected color and slice?
 */


// Enum formulation from: https://stackoverflow.com/a/44447975/388117
const SelectedColorRenderBehavior = Object.freeze({
  // SHOW_RGB_PLANES: Symbol("Show selected R, G, B planes"),
  SHOW_SELECTED_COLUMNS: Symbol("Show selected R, G, B columns"),
  SHOW_SELECTED_COLUMNS_BEFORE: Symbol("Show selected R, G, B columns (before)"),
  // SHOW_CUBE_BEFORE: Symbol("Show the cube (before)"),
  SHOW_SELECTED_CUBE: Symbol("Just show selected cube"),
  // SHOW_ALL: Symbol("Show all cubes")
});

class ColorPanel3D extends ColorPanel {
  constructor(x, y, z, width, height, depth) {
    super(x, y, width, height);
    this.depth = depth;
    this.z = z;
  }
}

class ColorCube3D extends ColorPanel3D {
  constructor(x, y, z, numCols = 10, boxSize = 10, boxMargin = 2) {

    let cubeSize = ColorCube3D.calcCubeSize(numCols, boxSize, boxMargin);
    super(x, y, z, cubeSize, cubeSize, cubeSize);

    this.boxSize = boxSize;
    this.boxMargin = boxMargin;
    this.numCols = numCols;

    this.defaultBoxOpacity = 255;
    this.selectedBoxOpacity = 255;

    this.selectedColorBehavior = SelectedColorRenderBehavior.SHOW_SELECTED_COLUMNS;
    this.hoverColorBehavior = SelectedColorRenderBehavior.SHOW_SELECTED_COLUMNS;

    this.colorAxes3D = new ColorAxes3D(this);

    this.showBackground = false;
  }

  setNumCols(numCols) {
    numCols = constrain(numCols, 1, 255);
    if (numCols !== this.numCols) {
      this.numCols = numCols;
      let cubeSize = ColorCube3D.calcCubeSize(this.numCols, this.boxSize, this.boxMargin);
      this.width = cubeSize;
      this.height = cubeSize;
      this.depth = cubeSize;
      this.colorAxes3D.axisLength = this.width * 1.1;
    }
    return this.numCols;
  }

  /**
   * Calculates the closest color on the 3D cube (since the cube is discretized)
   * @param {p5.Color} c 
   */
  getClosestColor(c) {
    let cube = this.getCubeForColor(c);
    return this.getColorForCube(cube);
    //return color(cube[0] * colorStep, cube[1] * colorStep, cube[2] * colorStep, alpha(c));
  }

  /**
   * Returns the cube location (xCol, yCol, zCol) as an array
   * @param {Array} c 
   */
  getCubeForColor(c, numCols) {
    return ColorCube3D.getCubeForColor(c, this.numCols);
  }

  static getCubeForColor(c, numCols) {
    let xCol = floor(map(red(c), 0, 255, 0, numCols - 1));
    let yCol = floor(map(green(c), 0, 255, 0, numCols - 1));
    let zCol = floor(map(blue(c), 0, 255, 0, numCols - 1));
    return [xCol, yCol, zCol];
  }

  /**
   * Gets the color for the cube
   * @param {Array} cube 
   */
  getColorForCube(cube) {
    return ColorCube3D.getColorForCube(cube, this.numCols);
  }

  static getColorForCube(cube, numCols) {
    let r = map(cube[0], 0, numCols - 1, 0, 255);
    let g = map(cube[1], 0, numCols - 1, 0, 255);
    let b = map(cube[2], 0, numCols - 1, 0, 255);
    return [r, g, b];
  }

  /**
   * Gets the x, y, z cube location for color
   * @param {p5.Color} c 
   */
  getCubeLocationForColor(c) {
    let cube = this.getCubeForColor(c);
    return this.getCubeLocationForCube(cube);
  }

  /**
   * Gets the cube x,y,z location for the cube coordinates (xCol, yCol, zCol)
   * @param {Array} cube 
   */
  getCubeLocationForCube(cube) {
    return ColorCube3D.getCubeLocationForCube(cube, this.boxSize, this.boxMargin);
  }

  static getCubeLocationForCube(cube, boxSize, boxMargin) {
    let x = cube[0] * (boxSize + boxMargin);
    let y = -cube[1] * (boxSize + boxMargin);
    let z = cube[2] * (boxSize + boxMargin);
    return [x, y, z];
  }

  /**
   * Returns true if the selected color matches r, g, b. If allColors is false, checks if any of those colors match
   * @param {*} r 
   * @param {*} g 
   * @param {*} b 
   * @param {*} allColors 
   */
  matchesSelectedColor(r, g, b, minimumMatchCount = 3) {
    // fuzzy match below
    // let rDist = abs(r - red(this.selectedColor));
    // let gDist = abs(g - green(this.selectedColor));
    // let bDist = abs(b - blue(this.selectedColor));

    // if (allColors) {
    //   return rDist <= colorStep &&
    //     gDist <= colorStep &&
    //     bDist <= colorStep;
    // } else {
    //   return rDist <= colorStep ||
    //     gDist <= colorStep ||
    //     bDist <= colorStep;
    // }

    // exact matches
    let matchRed = r === red(this.selectedColor);
    let matchGreen = g === green(this.selectedColor);
    let matchBlue = b === blue(this.selectedColor);
    let matchCnt = 0;
    if (matchRed) {
      matchCnt++;
    }

    if (matchGreen) {
      matchCnt++;
    }

    if (matchBlue) {
      matchCnt++;
    }

    return matchCnt >= minimumMatchCount && matchCnt != 0;

    // if (matchCount === 3) {
    //   return r === red(this.selectedColor) &&
    //     g === green(this.selectedColor) &&
    //     b === blue(this.selectedColor);

    // } else if (matchCount === 1) {
    //   return r === red(this.selectedColor) ||
    //     g === green(this.selectedColor) ||
    //     b === blue(this.selectedColor);
    // }
    // else if (matchCount === 1) {
    //   return r === red(this.selectedColor) ||
    //     g === green(this.selectedColor) ||
    //     b === blue(this.selectedColor);
    // }
  }

  draw() {
    //print(this.selectedColor, this.getCubeForColor(this.selectedColor));
    //print(this.selectedColor, this.getCubeLocationForColor(this.selectedColor));
    if(this.showBackground){
      //push();
      //fill(this.selectedColor);
      background(this.selectedColor);
      //pop();
    }

    this.colorAxes3D.draw();
    this.drawSelection(this.selectedColor, this.selectedColorBehavior, false);

    if (this.showHoverColor) {
      this.drawSelection(this.hoverColor, this.hoverColorBehavior, true);
    }
  }

  drawSelection(selColor, renderBehavior, isHover) {

    let selCubeLoc = this.getCubeLocationForColor(selColor);
    let selCube = this.getCubeForColor(selColor);

    switch (renderBehavior) {
      case SelectedColorRenderBehavior.SHOW_SELECTED_CUBE:
        this.drawCube(selCubeLoc, selColor, isHover, true);
        break;
      case SelectedColorRenderBehavior.SHOW_SELECTED_COLUMNS_BEFORE:
        this.drawColumn(0, selCube, isHover);
        this.drawColumn(1, selCube, isHover);
        this.drawColumn(2, selCube, isHover);
        this.drawCube(selCubeLoc, selColor, isHover, true);
        break;
      case SelectedColorRenderBehavior.SHOW_SELECTED_COLUMNS:
        this.drawColumn(0, selCube, isHover, 0, this.numCols);
        this.drawColumn(1, selCube, isHover, 0, this.numCols);
        this.drawColumn(2, selCube, isHover, 0, this.numCols);
        this.drawCube(selCubeLoc, selColor, isHover, true);
        break;
    }
  }

  drawCube(cubeLoc, fillColor, isHover, isSelected) {
    push();
    translate(cubeLoc[0], cubeLoc[1], cubeLoc[2]);
    if (isSelected) {
      if (isHover) {
        stroke(255);
      } else {
        stroke(255);
      }
    } else {
      noStroke();
    }

    if (isHover) {
      // can draw hover cubes differently...

      // for example, as wireframes rather than fills
      // stroke(fillColor);
      // noFill();

      // experimented with using alpha
      // fillColor = color(red(fillColor), green(fillColor), blue(fillColor), 180);
      fill(fillColor);
    } else {
      fill(fillColor);
    }

    box(this.boxSize);
    pop();
  }

  /**
   * Draws the column up to (but not including) the given cube column coordinates (xCol, yCol, zCol)
   * @param {Integer} columnAxis either 0 (for x), 1 (for y), or 2 (for z)
   * @param {Array} selCube Array of xCol, yCol, zCol
   */
  drawColumn(columnAxis, selCube, isHover, startIndex = 0, endIndex = -1) {
    if (endIndex == -1) {
      endIndex = selCube[columnAxis]
    }
    for (let columnIndex = startIndex; columnIndex < endIndex; columnIndex++) {
      let cube = null;
      if (columnAxis === 0) {
        cube = [columnIndex, selCube[1], selCube[2]];
      } else if (columnAxis === 1) {
        cube = [selCube[0], columnIndex, selCube[2]];
      }
      else if (columnAxis === 2) {
        cube = [selCube[0], selCube[1], columnIndex];
      }

      let cubeLoc = this.getCubeLocationForCube(cube);
      let c = this.getColorForCube(cube);
      this.drawCube(cubeLoc, c, isHover, false);
    }
  }

  keyPressed() {
    let selectedCube = this.getCubeForColor(this.selectedColor);

    switch (keyCode) {
      case LEFT_ARROW:
        selectedCube[0] = max(0, selectedCube[0] - 1);
        break;
      case RIGHT_ARROW:
        selectedCube[0] = min(this.numCols, selectedCube[0] + 1);
        break;
      case UP_ARROW:
        selectedCube[1] = min(this.numCols, selectedCube[1] + 1);
        break;
      case DOWN_ARROW:
        selectedCube[1] = max(0, selectedCube[1] - 1);
        break;
    }

    if (key === ' ') {
      if (keyIsDown(SHIFT)) {
        selectedCube[2] = max(0, selectedCube[2] - 1);
      } else {
        selectedCube[2] = min(this.numCols, selectedCube[2] + 1);
      }
    }

    let newSelectedColor = this.getColorForCube(selectedCube);
    //print("newSelectedColor", newSelectedColor);
    this.setSelectedColor(newSelectedColor);
    this.fireNewSelectedColorEvent(newSelectedColor);
  }

  static calcCubeSize(numCols, boxSize, boxMargin) {
    return numCols * (boxSize + boxMargin);
  }

  static areCubeCoordsEqual(cube1, cube2) {
    return cube1[0] === cube2[0] &&
      cube1[1] === cube2[1] &&
      cube1[2] === cube2[2];
  }
}

class ColorAxes3D {

  constructor(colorCube3D) {
    this.colorCube3D = colorCube3D;
    this.axisLength = colorCube3D.width * 1.1;
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

  drawTickMarks() {

    let cubeForSelColor = this.colorCube3D.getCubeForColor(colorCube3D.selectedColor);
    let cubeForHoverColor = this.colorCube3D.getCubeForColor(colorCube3D.hoverColor);
    const hoverMarkSize = 5;
    const selColMarkSize = 5;

    push();

    // put axes right on the edges of the boxes (rather than through center)
    translate(-colorCube3D.boxSize / 2, colorCube3D.boxSize / 2, -colorCube3D.boxSize / 2);

    // draw y-axis (green) ticks and tick labels
    push();
    textSize(this.tickFontSize);
    for (let yCol = 0; yCol < this.colorCube3D.numCols; yCol++) {
      const cube = [0, yCol, 0];
      const c = ColorCube3D.getColorForCube(cube, this.colorCube3D.numCols);
      const cubeLoc = ColorCube3D.getCubeLocationForCube(cube, this.colorCube3D.boxSize, this.colorCube3D.boxMargin);

      // setup and draw tick location
      const x = cubeLoc[0] - this.colorCube3D.boxSize / 2 - this.tickMarkLength;
      const y = cubeLoc[1] - this.colorCube3D.boxSize / 2;
      stroke(c);
      rect(x, y, this.tickMarkLength, 1);

      // draw tick label
      const lblTick = nfc(green(c), 1);
      const lblTickWidth = textWidth(lblTick);
      const lblXLoc = x - lblTickWidth - this.tickMarkMargin;
      fill(c);
      text(lblTick, lblXLoc, y + textSize() / 3);

      // mark locations
      if (yCol === cubeForHoverColor[1]) {
        noFill();
        stroke(c);
        let markX = lblXLoc - hoverMarkSize - 3;
        line(markX, y, markX + hoverMarkSize, y);
      }

      if (yCol === cubeForSelColor[1]) {
        noFill();
        stroke(c);
        let markX = lblXLoc - selColMarkSize / 2 - 3;
        circle(markX, y, selColMarkSize);
      }
    }
    pop();

    // draw z-axis (blue) ticks and tick labels
    push();
    textSize(this.tickFontSize);
    rotateX(HALF_PI);
    for (let zCol = 0; zCol < this.colorCube3D.numCols; zCol++) {
      const cube = [0, 0, zCol];
      const c = ColorCube3D.getColorForCube(cube, this.colorCube3D.numCols);
      const cubeLoc = ColorCube3D.getCubeLocationForCube(cube, this.colorCube3D.boxSize, this.colorCube3D.boxMargin);

      // setup and draw tick location
      const x = cubeLoc[0] - this.colorCube3D.boxSize / 2 - this.tickMarkLength;
      const y = cubeLoc[2] + this.colorCube3D.boxSize / 2;
      stroke(c);
      rect(x, y, this.tickMarkLength, 1);

      // draw tick label
      const lblTick = nfc(blue(c), 1);
      const lblTickWidth = textWidth(lblTick);
      const lblXLoc = x - lblTickWidth - this.tickMarkMargin;
      fill(c);
      text(lblTick, lblXLoc, y + textSize() / 3);

      // mark locations
      if (zCol === cubeForHoverColor[2]) {
        noFill();
        stroke(c);
        let markX = lblXLoc - hoverMarkSize - 3;
        line(markX, y, markX + hoverMarkSize, y);
      }

      if (zCol === cubeForSelColor[2]) {
        noFill();
        stroke(c);
        let markX = lblXLoc - selColMarkSize / 2 - 3;
        circle(markX, y, selColMarkSize);
      }
    }
    pop();

    // draw x-axis (red) ticks and labels
    push();
    rotateZ(-HALF_PI);
    for (let xCol = 0; xCol < this.colorCube3D.numCols; xCol++) {
      const cube = [xCol, 0, 0];
      const c = ColorCube3D.getColorForCube(cube, this.colorCube3D.numCols);
      const cubeLoc = ColorCube3D.getCubeLocationForCube(cube, this.colorCube3D.boxSize, this.colorCube3D.boxMargin);

      // setup and draw tick location
      const x = cubeLoc[1] - this.colorCube3D.boxSize / 2 - this.tickMarkLength;
      const y = cubeLoc[0] + this.colorCube3D.boxSize / 2;
      stroke(c);
      rect(x, y, this.tickMarkLength, 1);

      // draw tick label
      const lblTick = nfc(red(c), 1);
      const lblTickWidth = textWidth(lblTick);
      const lblXLoc = x - lblTickWidth - this.tickMarkMargin;
      fill(c);
      text(lblTick, lblXLoc, y + textSize() / 3);

      // mark locations
      if (xCol === cubeForHoverColor[0]) {
        noFill();
        stroke(c);
        let markX = lblXLoc - hoverMarkSize - 3;
        line(markX, y, markX + hoverMarkSize, y);
      }

      if (xCol === cubeForSelColor[0]) {
        noFill();
        stroke(c);
        let markX = lblXLoc - selColMarkSize / 2 - 3;
        circle(markX, y, selColMarkSize);
      }
    }
    pop();

    pop();
  }

  drawAxes() {
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

  drawGrid() {
    // draw green (y) and red (x) outline grid
    push();
    noFill();
    translate(0, 0, -this.colorCube3D.boxSize / 2);
    rectMode(CENTER); // p5js 3D mode draws boxes through center, so match this with 2D
    for (let xCol = 0; xCol < this.colorCube3D.numCols; xCol++) {
      for (let yCol = 0; yCol < this.colorCube3D.numCols; yCol++) {
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
    for (let xCol = 0; xCol < this.colorCube3D.numCols; xCol++) {
      for (let zCol = 0; zCol < this.colorCube3D.numCols; zCol++) {
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
    for (let yCol = 0; yCol < this.colorCube3D.numCols; yCol++) {
      for (let zCol = 0; zCol < this.colorCube3D.numCols; zCol++) {
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