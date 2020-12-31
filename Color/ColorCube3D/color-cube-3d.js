
// Enum formulation from: https://stackoverflow.com/a/44447975/388117
const SelectedColorBehavior = Object.freeze({
  SHOW_RGB_PLANES: Symbol("Show selected R, G, B planes"),
  SHOW_RGB_COLUMNS: Symbol("Show selected R, G, B columns"),
  SHOW_RGB_COLUMNS_BEFORE: Symbol("Show selected R, G, B columns (before)"),
  SHOW_CUBE_BEFORE: Symbol("Show the cube (before)"),
  SHOW_JUST_CUBE: Symbol("Just show selected cube"),
  SHOW_ALL: Symbol("Show all cubes")
});

class ColorCube3D {
  constructor(boxSize, boxMargin, maxColor, colorStep) {
    this.boxSize = boxSize;
    this.boxMargin = boxMargin;
    this.maxColor = maxColor;
    this.colorStep = colorStep;
    this.selectedColor = color(0);

    this.defaultBoxOpacity = 255;
    this.selectedBoxOpacity = 255;

    this.selectedColorBehavior = SelectedColorBehavior.SHOW_RGB_PLANES;
  }

  calcSize() {
    return this.maxColor / this.colorStep * (this.boxSize + this.boxMargin);
  }

  getClosestColor(c) {
    let numGradations = this.maxColor / this.colorStep;
    let r = floor(map(red(c), 0, 255, 0, numGradations));
    let g = floor(map(green(c), 0, 255, 0, numGradations));
    let b = floor(map(blue(c), 0, 255, 0, numGradations));
    return color(r * this.colorStep, g * this.colorStep, b * this.colorStep, alpha(c));
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
    //   return rDist <= this.colorStep &&
    //     gDist <= this.colorStep &&
    //     bDist <= this.colorStep;
    // } else {
    //   return rDist <= this.colorStep ||
    //     gDist <= this.colorStep ||
    //     bDist <= this.colorStep;
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

    // draw the giant rgb 3d color grid

    for (let r = 0; r <= maxColor; r += colorStep) {
      for (let g = 0; g <= maxColor; g += colorStep) {
        for (let b = 0; b <= maxColor; b += colorStep) {
          let x = (r / colorStep) * (boxSize + boxMargin);
          let y = -(g / colorStep) * (boxSize + boxMargin); // green axis goes up
          let z = (b / colorStep) * (boxSize + boxMargin);

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

                box(boxSize);
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
                
                box(boxSize);

              }
              break;
            case SelectedColorBehavior.SHOW_RGB_COLUMNS:
              if (this.matchesSelectedColor(r, g, b, 2)) {

                fill(r, g, b, this.defaultBoxOpacity);

                if (this.matchesSelectedColor(r, g, b)) {
                  fill(r, g, b, this.selectedBoxOpacity);
                  stroke(0);
                }

                box(boxSize);
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

                box(boxSize);
              }
              break;
            case SelectedColorBehavior.SHOW_CUBE_BEFORE:
              if (r <= red(this.selectedColor) && g <= green(this.selectedColor) && b <= blue(this.selectedColor)) {

                fill(r, g, b, this.defaultBoxOpacity);

                if (this.matchesSelectedColor(r, g, b)) {
                  fill(r, g, b, this.selectedBoxOpacity);
                  stroke(0);
                }

                box(boxSize);
              }
              break;
            case SelectedColorBehavior.SHOW_ALL:
              if (this.matchesSelectedColor(r, g, b)) {
                fill(r, g, b, this.selectedBoxOpacity);
                stroke(0);
              } else {
                fill(r, g, b, this.defaultBoxOpacity);
              }
              box(boxSize);
              break;
            case SelectedColorBehavior.SHOW_JUST_CUBE:
            default:
              if (this.matchesSelectedColor(r, g, b)) {
                fill(r, g, b, this.selectedBoxOpacity);
                stroke(0);
                box(boxSize);
              }
              break;


          }


          pop();
        }
      }
    }
  }
}