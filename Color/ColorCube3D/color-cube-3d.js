
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

    this.forceSelectedColorsToClosestMatch = true;

    this.colorAxes3D = new ColorAxes3D(this);

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

  static getCubeForColor(c, numCols){
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

  static getCubeLocationForCube(cube, boxSize, boxMargin){
    let x = cube[0] * (boxSize + boxMargin);
    let y = -cube[1] * (boxSize + boxMargin);
    let z = cube[2] * (boxSize + boxMargin);
    return [x, y, z];
  }

  /**
   * Sets the selected color
   * @param {p5.Color or Array} selectedColor 
   */
  setSelectedColor(selectedColor) {
    // the super call parses different forms of colors
    super.setSelectedColor(selectedColor);

    if (this.forceSelectedColorsToClosestMatch) {
      let closestColor = this.getClosestColor(this.selectedColor);
      super.setSelectedColor(closestColor);
    }
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
    this.colorAxes3D.draw();
    this.drawSelection(this.selectedColor, this.selectedColorBehavior, false);
    this.drawSelection(this.hoverColor, this.hoverColorBehavior, true);
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
        this.drawColumn(0, selCube, isHover, 0, this.numCols + 1);
        this.drawColumn(1, selCube, isHover, 0, this.numCols + 1);
        this.drawColumn(2, selCube, isHover, 0, this.numCols + 1);
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
    if(endIndex == -1){
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

  // draw() {

  //   // Note: box(x, y, z) expects the center x, center y, and center z
  //   // It's like drawing rect with rectMode(CENTER) in 2D
  //   let colorStep = this.getColorStep();

  //   // draw the giant rgb 3d color grid
  //   for (let r = 0; r <= this.maxColor; r += colorStep) {
  //     for (let g = 0; g <= this.maxColor; g += colorStep) {
  //       for (let b = 0; b <= this.maxColor; b += colorStep) {
  //         let x = (r / colorStep) * (this.boxSize + this.boxMargin);
  //         let y = -(g / colorStep) * (this.boxSize + this.boxMargin); // green axis goes up
  //         let z = (b / colorStep) * (this.boxSize + this.boxMargin);

  //         push();
  //         translate(x, y, z);
  //         noStroke();

  //         //uncomment below to draw unselected boxes as skeleton
  //         //stroke(r, g, b, this.defaultBoxOpacity);
  //         //noFill();
  //         //box(boxSize);

  //         switch (this.selectedColorBehavior) {
  //           case SelectedColorBehavior.SHOW_RGB_PLANES:
  //             if (this.matchesSelectedColor(r, g, b, 1)) {
  //               fill(r, g, b, this.defaultBoxOpacity);

  //               if (this.matchesSelectedColor(r, g, b)) {
  //                 fill(r, g, b, this.selectedBoxOpacity);
  //                 stroke(0);
  //               }

  //               box(this.boxSize);
  //             }
  //             break;

  //           case SelectedColorBehavior.SHOW_RGB_PLANES_BEFORE:
  //             // TODO: still need to fix this
  //             let rDist = abs(red(this.selectedColor) - r);
  //             let gDist = abs(green(this.selectedColor) - g);
  //             let bDist = abs(green(this.selectedColor) - b);
  //             if (this.matchesSelectedColor(r, g, b, 1) && r <= red(this.selectedColor) && g <= green(this.selectedColor) && b <= blue(this.selectedColor)) {
  //               //print(rDist, gDist, bDist);
  //               fill(r, g, b, this.defaultBoxOpacity);

  //               if (this.matchesSelectedColor(r, g, b)) {
  //                 fill(r, g, b, this.selectedBoxOpacity);
  //                 stroke(0);
  //               }

  //               box(this.boxSize);

  //             }
  //             break;
  //           case SelectedColorBehavior.SHOW_RGB_COLUMNS:
  //             if (this.matchesSelectedColor(r, g, b, 2)) {

  //               fill(r, g, b, this.defaultBoxOpacity);

  //               if (this.matchesSelectedColor(r, g, b)) {
  //                 fill(r, g, b, this.selectedBoxOpacity);
  //                 stroke(0);
  //               }

  //               box(this.boxSize);
  //             }
  //             break;
  //           case SelectedColorBehavior.SHOW_RGB_COLUMNS_BEFORE:
  //             if (this.matchesSelectedColor(r, g, b, 2) && (r <= red(this.selectedColor) &&
  //               g <= green(this.selectedColor) && b <= blue(this.selectedColor))) {

  //               fill(r, g, b, this.defaultBoxOpacity);

  //               if (this.matchesSelectedColor(r, g, b)) {
  //                 fill(r, g, b, this.selectedBoxOpacity);
  //                 stroke(0);
  //               }

  //               box(this.boxSize);
  //             }
  //             break;
  //           case SelectedColorBehavior.SHOW_CUBE_BEFORE:
  //             if (r <= red(this.selectedColor) && g <= green(this.selectedColor) && b <= blue(this.selectedColor)) {

  //               fill(r, g, b, this.defaultBoxOpacity);

  //               if (this.matchesSelectedColor(r, g, b)) {
  //                 fill(r, g, b, this.selectedBoxOpacity);
  //                 stroke(0);
  //               }

  //               box(this.boxSize);
  //             }
  //             break;
  //           case SelectedColorBehavior.SHOW_ALL:
  //             if (this.matchesSelectedColor(r, g, b)) {
  //               fill(r, g, b, this.selectedBoxOpacity);
  //               stroke(0);
  //             } else {
  //               fill(r, g, b, this.defaultBoxOpacity);
  //             }
  //             box(this.boxSize);
  //             break;
  //           case SelectedColorBehavior.SHOW_JUST_CUBE:
  //           default:
  //             if (this.matchesSelectedColor(r, g, b)) {
  //               fill(r, g, b, this.selectedBoxOpacity);
  //               stroke(0);
  //               box(this.boxSize);
  //             }
  //             break;
  //         }

  //         pop();
  //       }
  //     }
  //   }
  // }

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