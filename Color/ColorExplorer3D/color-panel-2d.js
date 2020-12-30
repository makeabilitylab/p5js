// Enum formulation from: https://stackoverflow.com/a/44447975/388117
const ColorAxes2D = Object.freeze({
  RED_GREEN: Symbol("Red-green"),
  RED_BLUE: Symbol("Red-blue"),
  GREEN_BLUE: Symbol("Green-blue")
});

const ColorPanel2DEvents = Object.freeze({
  NEW_MOUSE_HOVER_COLOR: Symbol("New mouse hover color event")
});

class ColorPanel2D extends Panel {

  constructor(x, y, width, height, colorAxes2D) {
    super(x, y, width, height)


    this.colorAxes = colorAxes2D;
    this.selectedColor = color(0);
    this.hoverColor = color(0);

    this.offscreenBuffer = createGraphics(width, height);
    this.updateOffscreenBuffer();

    // event handling https://stackoverflow.com/a/56612753
    this.events = new Map();

    this.knownEvents = new Set([ColorPanel2DEvents.NEW_MOUSE_HOVER_COLOR]);
  }

  /**
   * Subscribe to events
   * 
   * @param {String} label 
   * @param {function} callback 
   */
  on(label, callback) {
    if (this.knownEvents.has(label)) {
      if (!this.events.has(label)) {
        this.events.set(label, []);
      }
      this.events.get(label).push(callback);
    } else {
      console.log(`Could not create event subscription for ${label}. Event unknown.`);
    }
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
      print("pDensity", pDensity);
      this.offscreenBuffer.loadPixels();
      if (pDensity === 1) {
        print("here");
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
      // TODO: to speed this up, consider accessing pixels directly via getPixels()?
      for (let x = 0; x < this.width; x++) {
        for (let y = 0; y < this.height; y++) {
          let c = this.getColorForPixel(x, y);
          this.offscreenBuffer.stroke(c);
          this.offscreenBuffer.point(x, y);
        }
      }
      this.offscreenBuffer.pop();
    }

    print("updateOffscreenBuffer took", millis() - startT, "ms");
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

    if (this.hoverColor) {
      noFill();
      stroke(255);
      let selColorCoords = this.getPixelForColor(this.hoverColor);
      ellipse(selColorCoords.x, selColorCoords.y, 4);
    }

    pop();

    if (this.contains(mouseX, mouseY)) {
      // trigger mouse over color event
      let c = this.getColorForPixel(mouseX, mouseY, true);
      text(c, mouseX, mouseY);
    }
  }
}