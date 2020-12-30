
// Enum formulation from: https://stackoverflow.com/a/44447975/388117
const SelectedColorBehavior = Object.freeze({
  SHOW_RGB_PLANES: Symbol("Show selected R, G, B planes"),
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

  /**
   * Returns true if the selected color matches r, g, b. If allColors is false, checks if any of those colors match
   * @param {*} r 
   * @param {*} g 
   * @param {*} b 
   * @param {*} allColors 
   */
  matchesSelectedColor(r, g, b, allColors = true) {
    if (allColors) {
      return r === red(this.selectedColor) &&
        g === green(this.selectedColor) &&
        b === blue(this.selectedColor);
    } else {
      return r === red(this.selectedColor) ||
        g === green(this.selectedColor) ||
        b === blue(this.selectedColor);
    }
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

          switch (this.selectedColorBehavior) {
            case SelectedColorBehavior.SHOW_RGB_PLANES:
              if (this.matchesSelectedColor(r, g, b, false)) {
                fill(r, g, b, this.defaultBoxOpacity);

                if (this.matchesSelectedColor(r, g, b)) {
                  fill(r, g, b, this.selectedBoxOpacity);
                  stroke(0);
                }

                box(boxSize);
              }
              break;

            case SelectedColorBehavior.SHOW_JUST_CUBE:
              if (this.matchesSelectedColor(r, g, b)) {
                fill(r, g, b, this.selectedBoxOpacity);
                stroke(0);
                box(boxSize);
              }
              break;

            case SelectedColorBehavior.SHOW_JUST_CUBE:
            default:

              if (this.matchesSelectedColor(r, g, b)) {
                fill(r, g, b, this.selectedBoxOpacity);
                stroke(0);
              }else{
                fill(r, g, b, this.defaultBoxOpacity);
              }
              box(boxSize);
              break;


          }






          pop();
        }
      }
    }
  }
}