/**
 * Provides a 2D color picker panel. The two dimensions are settable via ColorAxes2D and
 * can be Red-green, Red-blue, or Green-blue.
 * 
 * To see a demo, see:
 * - http://makeabilitylab.github.io/p5js/Color/ColorPanel2D 
 * - https://makeabilitylab.github.io/p5js/Color/ColorExplorer3D
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 * 
 */

// Enum formulation from: https://stackoverflow.com/a/44447975/388117
const ColorAxes2D = Object.freeze({
  RED_GREEN: Symbol("Red-green"),
  RED_BLUE: Symbol("Red-blue"),
  GREEN_BLUE: Symbol("Green-blue")
});

class ColorPanel2D extends ColorPanel {

  constructor(x, y, width, height, colorAxes2D) {
    super(x, y, width, height)

    this.colorAxes = colorAxes2D;
    this.title = ColorPanel2D.getDefaultTitle(this.colorAxes);
    this.offscreenBuffer = createGraphics(width, height);
    this.updateOffscreenBuffer();
    this.xTitle = "x title";
    this.yTitle = "y title";
  }

  mousePressed() {
    super.setSelectedColor(this.getColorForPixel(mouseX, mouseY, true));
    this.fireNewSelectedColorEvent(this.selectedColor);
    super.mousePressed();
  }

  // mouseDragged() {
  //   this.thumbMain.x = constrain(mouseX, this.track.x, this.track.getRight());
  //   this.thumbMain.value = map(this.thumbMain.x, this.track.x, this.track.getRight(), this.minValue, this.maxValue);
  //   this.thumbMain.color = ColorSliderPanel.getSliderColor(this.sliderColorType, this.thumbMain.value);
  //   this.fireNewSelectedColorEvent(this.thumbMain.color);
  // }

  mouseMoved() {
    this.hoverColor = this.getColorForPixel(mouseX, mouseY, true);
    this.fireNewHoverColorEvent(this.hoverColor);
    super.mouseMoved();
  }

  setSelectedColor(selectedColor){
    super.setSelectedColor(selectedColor);
    this.updateOffscreenBuffer();
  }

  setHoverColor(hoverColor){
    super.setHoverColor(hoverColor);
  }

  /**
   * Returns the closest pixel (x, y) coordinate to the given color. Pixel coordinates are relative 
   * to the color panel so 0,0 is top-left of this panel.
   * 
   * @param {p5.Color} col  
   */
  getPixelForColor(col) {
    let x, y;

    switch (this.colorAxes) {
      case ColorAxes2D.RED_GREEN:
        x = map(red(col), 0, 255, 0, this.width);
        y = map(green(col), 0, 255, this.height, 0);
        break;
      case ColorAxes2D.RED_BLUE:
        x = map(red(col), 0, 255, 0, this.width);
        y = map(blue(col), 0, 255, this.height, 0);
        break;
      case ColorAxes2D.GREEN_BLUE:
        x = map(blue(col), 0, 255, 0, this.width);
        y = map(green(col), 0, 255, this.height, 0);
        break;
    }

    return {
      "x": x,
      "y": y
    };
  }

  /**
   * Calculates the color for pixel x, y. By default, pixel coordinates are relative to the color panel
   * so 0,0 is top-left of this panel. If you want to use global coordinates for the p5js app,
   * then set useGlobalCoordinates to true (it's false by default)
   * 
   * @param {Number} x the x coord relative to the color panel (assumes 0,0 is top-left)
   * @param {Number} y the y coord relative to the color panel (assumes 0,0 is top-left)
   * @param {boolean} useGlobalCoordinates whether to use global coordinates
   */
  getColorForPixel(x, y, useGlobalCoordinates = false) {
    let x_c, y_c;

    if (useGlobalCoordinates) {
      x_c = map(x, this.x, this.getRight(), 0, 255);
      y_c = map(y, this.getBottom(), this.y, 0, 255);

    } else {
      x_c = map(x, 0, this.width, 0, 255);
      y_c = map(y, this.height, 0, 0, 255);
    }

    let other_c;
    switch (this.colorAxes) {
      case ColorAxes2D.RED_GREEN:
        other_c = blue(this.selectedColor);
        return color(x_c, y_c, other_c);
      case ColorAxes2D.RED_BLUE:
        other_c = green(this.selectedColor);
        return color(x_c, other_c, y_c);
      case ColorAxes2D.GREEN_BLUE:
        other_c = red(this.selectedColor);
        return color(other_c, y_c, x_c);
    }
  }

  updateOffscreenBuffer() {
    if (this.width != this.offscreenBuffer.width || this.height != this.offscreenBuffer.height) {
      this.offscreenBuffer = createGraphics(width, height);
    }

    const useDirectPixelAccess = true; // for speed!
    let startT = millis();
    if (useDirectPixelAccess) {
      // To learn more about directly manipulating pixels, see:
      // - Coding Train: https://youtu.be/nMUMZ5YRxHI
      // - https://compform.net/pixels/
      let pDensity = pixelDensity();
     
      this.offscreenBuffer.loadPixels();
      if (pDensity === 1) {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            let c = this.getColorForPixel(x, y);

            let pixelIndex = ((y * this.width) + x) * 4;
            this.offscreenBuffer.pixels[pixelIndex] = red(c);
            this.offscreenBuffer.pixels[pixelIndex + 1] = green(c);
            this.offscreenBuffer.pixels[pixelIndex + 2] = blue(c);
            this.offscreenBuffer.pixels[pixelIndex + 3] = 255;
          }
        }
      } else {
        for (let y = 0; y < this.height; y++) {
          for (let x = 0; x < this.width; x++) {
            for (let pDensityX = 0; pDensityX < pDensity; pDensityX++) {
              for (let pDensityY = 0; pDensityY < pDensity; pDensityY++) {
                let c = this.getColorForPixel(x, y);

                // pixel ref with density equation from: https://p5js.org/reference/#/p5/pixels
                let pixelIndex = 4 * ((y * pDensity + pDensityY) * this.width * pDensity + (x * pDensity + pDensityX));
                this.offscreenBuffer.pixels[pixelIndex] = red(c);
                this.offscreenBuffer.pixels[pixelIndex + 1] = green(c);
                this.offscreenBuffer.pixels[pixelIndex + 2] = blue(c);
                this.offscreenBuffer.pixels[pixelIndex + 3] = 255;
              }
            }

          }
        }
      }
      this.offscreenBuffer.updatePixels();
    } else {
      this.offscreenBuffer.push();
      this.offscreenBuffer.strokeWeight(1);
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          let c = this.getColorForPixel(x, y);
          this.offscreenBuffer.stroke(c);
          this.offscreenBuffer.point(x, y);
        }
      }
      this.offscreenBuffer.pop();
    }

    // draw axes
    this.offscreenBuffer.push();

    this.offscreenBuffer.noStroke();
    this.offscreenBuffer.fill(255);
    this.offscreenBuffer.textSize(8);
    this.offscreenBuffer.text(this.title, 2, this.offscreenBuffer.textSize() + 1);

    const numTicks = 4;
    const tickLength = 2;
    const tickTextSize = 7;

    this.offscreenBuffer.textSize(tickTextSize);
    const offSet = 0;

    for(let tick = 1; tick < numTicks; tick++){
      let xTick = map(tick, 0, numTicks, offSet, this.width + offSet);
      let val = map(xTick, 0, this.width, 0, 255);
      this.offscreenBuffer.noFill();
      this.offscreenBuffer.strokeWeight(1);
      this.offscreenBuffer.stroke(255);
      this.offscreenBuffer.line(xTick, this.height - tickLength, xTick, this.height);

      this.offscreenBuffer.noStroke();
      this.offscreenBuffer.fill(255);
      let lbl = nfc(val, 0);
      let lblWidth = this.offscreenBuffer.textWidth(lbl);
      this.offscreenBuffer.text(lbl, xTick - lblWidth/2, this.height - this.offscreenBuffer.textSize());
    }

    for(let tick = 1; tick < numTicks; tick++){
      let yTick = map(tick, 0, numTicks, offSet, this.height + offSet);
      let val = map(yTick, 0, this.height, 255, 0);
      this.offscreenBuffer.noFill();
      this.offscreenBuffer.strokeWeight(1);
      this.offscreenBuffer.stroke(255);
      this.offscreenBuffer.line(0, yTick, tickLength, yTick);

      this.offscreenBuffer.noStroke();
      this.offscreenBuffer.fill(255);
      let lbl = nfc(val, 0);
      let lblHeight = this.offscreenBuffer.textSize();
      this.offscreenBuffer.text(lbl, tickLength + 1, yTick + lblHeight * 0.4);
    }

    this.offscreenBuffer.pop();
    //print("updateOffscreenBuffer took", millis() - startT, "ms");
  }

  draw() {
   
    push();
    translate(this.x, this.y);
    image(this.offscreenBuffer, 0, 0);

    if (this.selectedColor) {
      noFill();
      stroke(255);
      let selColorCoords = this.getPixelForColor(this.selectedColor);
      ellipse(selColorCoords.x, selColorCoords.y, 4);
    }

    if (this.hoverColor && this.showHoverColor) {
      noFill();
      stroke(255);
      let selColorCoords = this.getPixelForColor(this.hoverColor);

      // draw cross hair for hover color
      const chLength = 2;
      strokeWeight(1);
      line(selColorCoords.x - chLength - 1, selColorCoords.y, selColorCoords.x - 1, selColorCoords.y);
      line(selColorCoords.x + 1, selColorCoords.y, selColorCoords.x + chLength + 1, selColorCoords.y);
      line(selColorCoords.x, selColorCoords.y - chLength - 1, selColorCoords.x, selColorCoords.y - 1);
      line(selColorCoords.x, selColorCoords.y + chLength + 1, selColorCoords.x, selColorCoords.y + 1);

      // draw text for hover color
      noStroke();
      fill(255);
      textSize(7);
      text(ColorPanel.getRgbString(this.hoverColor, 0), selColorCoords.x + chLength + 1, selColorCoords.y - chLength);
    }

    pop();
 
  }

  static getDefaultTitle(colorAxes){
    switch (colorAxes) {
      case ColorAxes2D.RED_GREEN:
        return "Red vs. Green";
      case ColorAxes2D.RED_BLUE:
        return "Red vs. Blue";
      case ColorAxes2D.GREEN_BLUE:
        return "Green vs. Blue";
    }
  }
}