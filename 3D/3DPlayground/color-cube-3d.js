class ColorCube3D {
  constructor(boxSize, boxMargin, maxColor, colorStep) {
    this.boxSize = boxSize;
    this.boxMargin = boxMargin;
    this.maxColor = maxColor;
    this.colorStep = colorStep;
    this.selectedColor = color(0);

    this.defaultBoxOpacity = 255;
    this.selectedBoxOpacity = 255;
  }

  calcSize() {
    return this.maxColor / this.colorStep * (this.boxSize + this.boxMargin);
  }

  matchesSelectedColor(r, g, b){
    return r === red(this.selectedColor) &&
           g === green(this.selectedColor) &&
           b === blue(this.selectedColor);
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
          fill(r, g, b, this.defaultBoxOpacity);

          if(this.matchesSelectedColor(r, g, b)){
            fill(r, g, b, this.selectedBoxOpacity);
            stroke(0);
          }

          box(boxSize);
          pop();
        }
      }
    }
  }
}