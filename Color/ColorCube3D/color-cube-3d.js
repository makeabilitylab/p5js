
// Enum formulation from: https://stackoverflow.com/a/44447975/388117
const SelectedColorBehavior = Object.freeze({
  SHOW_RGB_PLANES: Symbol("Show selected R, G, B planes"),
  SHOW_RGB_COLUMNS: Symbol("Show selected R, G, B columns"),
  SHOW_RGB_COLUMNS_BEFORE: Symbol("Show selected R, G, B columns (before)"),
  SHOW_CUBE_BEFORE: Symbol("Show the cube (before)"),
  SHOW_JUST_CUBE: Symbol("Just show selected cube"),
  SHOW_ALL: Symbol("Show all cubes")
});

class ColorPanel3D extends ColorPanel{
  constructor(x, y, z, width, height, depth){
    super(x, y, width, height);
    this.depth = depth;
    this.z = z;
  }
}

class ColorCube3D extends ColorPanel3D{
  constructor(x, y, z, numCols = 10, boxSize = 10, boxMargin = 2) {
  
    let cubeSize = ColorCube3D.calcCubeSize(numCols, boxSize, boxMargin);
    super(x, y, z, cubeSize, cubeSize, cubeSize);

    this.boxSize = boxSize;
    this.boxMargin = boxMargin;
    this.numCols = numCols;
    this.maxColor = 255;
 
    this.defaultBoxOpacity = 255;
    this.selectedBoxOpacity = 255;

    this.selectedColorBehavior = SelectedColorBehavior.SHOW_RGB_COLUMNS_BEFORE;
    this.hoverColorBehavior = SelectedColorBehavior.SHOW_RGB_COLUMNS_BEFORE; 

    this.forceSelectedColorsToClosestMatch = true;
  }

  getColorStep(){
    return this.maxColor / this.numCols;
  }

  /**
   * Calculates the closest color on the 3D cube (since the cube is discretized)
   * @param {p5.Color} c 
   */
  getClosestColor(c) {
    let numGradations = this.numCols;
    let colorStep = this.getColorStep();
    let r = floor(map(red(c), 0, 255, 0, numGradations));
    let g = floor(map(green(c), 0, 255, 0, numGradations));
    let b = floor(map(blue(c), 0, 255, 0, numGradations));
    return color(r * colorStep, g * colorStep, b * colorStep, alpha(c));
  }
  
  setSelectedColor(selectedColor){
    // the super call parses different forms of colors
    super.setSelectedColor(selectedColor);

    if(this.forceSelectedColorsToClosestMatch){
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

    // Note: box(x, y, z) expects the center x, center y, and center z
    // It's like drawing rect with rectMode(CENTER) in 2D
    let colorStep = this.getColorStep();

    // draw the giant rgb 3d color grid
    for (let r = 0; r <= this.maxColor; r += colorStep) {
      for (let g = 0; g <= this.maxColor; g += colorStep) {
        for (let b = 0; b <= this.maxColor; b += colorStep) {
          let x = (r / colorStep) * (this.boxSize + this.boxMargin);
          let y = -(g / colorStep) * (this.boxSize + this.boxMargin); // green axis goes up
          let z = (b / colorStep) * (this.boxSize + this.boxMargin);

          push();
          translate(x, y, z);
          noStroke();

          //uncomment below to draw unselected boxes as skeleton
          //stroke(r, g, b, this.defaultBoxOpacity);
          //noFill();
          //box(boxSize);

          switch (this.selectedColorBehavior) {
            case SelectedColorBehavior.SHOW_RGB_PLANES:
              if (this.matchesSelectedColor(r, g, b, 1)) {
                fill(r, g, b, this.defaultBoxOpacity);

                if (this.matchesSelectedColor(r, g, b)) {
                  fill(r, g, b, this.selectedBoxOpacity);
                  stroke(0);
                }

                box(this.boxSize);
              }
              break;

            case SelectedColorBehavior.SHOW_RGB_PLANES_BEFORE:
              // TODO: still need to fix this
              let rDist = abs(red(this.selectedColor) - r);
              let gDist = abs(green(this.selectedColor) - g);
              let bDist = abs(green(this.selectedColor) - b);
              if (this.matchesSelectedColor(r, g, b, 1) && r <= red(this.selectedColor) && g <= green(this.selectedColor) && b <= blue(this.selectedColor)) {
                //print(rDist, gDist, bDist);
                fill(r, g, b, this.defaultBoxOpacity);

                if (this.matchesSelectedColor(r, g, b)) {
                  fill(r, g, b, this.selectedBoxOpacity);
                  stroke(0);
                }

                box(this.boxSize);

              }
              break;
            case SelectedColorBehavior.SHOW_RGB_COLUMNS:
              if (this.matchesSelectedColor(r, g, b, 2)) {

                fill(r, g, b, this.defaultBoxOpacity);

                if (this.matchesSelectedColor(r, g, b)) {
                  fill(r, g, b, this.selectedBoxOpacity);
                  stroke(0);
                }

                box(this.boxSize);
              }
              break;
            case SelectedColorBehavior.SHOW_RGB_COLUMNS_BEFORE:
              if (this.matchesSelectedColor(r, g, b, 2) && (r <= red(this.selectedColor) &&
                g <= green(this.selectedColor) && b <= blue(this.selectedColor))) {

                fill(r, g, b, this.defaultBoxOpacity);

                if (this.matchesSelectedColor(r, g, b)) {
                  fill(r, g, b, this.selectedBoxOpacity);
                  stroke(0);
                }

                box(this.boxSize);
              }
              break;
            case SelectedColorBehavior.SHOW_CUBE_BEFORE:
              if (r <= red(this.selectedColor) && g <= green(this.selectedColor) && b <= blue(this.selectedColor)) {

                fill(r, g, b, this.defaultBoxOpacity);

                if (this.matchesSelectedColor(r, g, b)) {
                  fill(r, g, b, this.selectedBoxOpacity);
                  stroke(0);
                }

                box(this.boxSize);
              }
              break;
            case SelectedColorBehavior.SHOW_ALL:
              if (this.matchesSelectedColor(r, g, b)) {
                fill(r, g, b, this.selectedBoxOpacity);
                stroke(0);
              } else {
                fill(r, g, b, this.defaultBoxOpacity);
              }
              box(this.boxSize);
              break;
            case SelectedColorBehavior.SHOW_JUST_CUBE:
            default:
              if (this.matchesSelectedColor(r, g, b)) {
                fill(r, g, b, this.selectedBoxOpacity);
                stroke(0);
                box(this.boxSize);
              }
              break;
          }

          pop();
        }
      }
    }
  }

  keyPressed() {
    let colorStep = this.getColorStep();
    let r = red(this.selectedColor);
    let g = green(this.selectedColor);
    let b = blue(this.selectedColor);

    switch (keyCode) {
      case LEFT_ARROW:
        r = max(0, red(this.selectedColor) - colorStep);
        break;
      case RIGHT_ARROW:
        r = min(this.maxColor, red(this.selectedColor) + colorStep);
        break;
      case UP_ARROW:
        g = min(this.maxColor, green(this.selectedColor) + colorStep);
        break;
      case DOWN_ARROW:
        g = max(0, green(this.selectedColor) - colorStep);
        break;
    }

    if (key === ' ') {
      if (keyIsDown(SHIFT)) {
        b = max(0, blue(this.selectedColor) - colorStep);
      } else {
        b = min(this.maxColor, blue(this.selectedColor) + colorStep);
      }
    }

    let newSelectedColor = color(r, g, b);
    //print("newSelectedColor", newSelectedColor);
    this.setSelectedColor(newSelectedColor);
    this.fireNewSelectedColorEvent(newSelectedColor);
  }

  static calcCubeSize(numCols, boxSize, boxMargin){
    return numCols * (boxSize + boxMargin);
  }
}