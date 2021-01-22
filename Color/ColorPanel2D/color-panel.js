class Panel {
  constructor(x, y, width, height) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Returns the left side of the panel
   * @return {Number} the left side of the panel
   */
  getLeft() {
    return this.x;
  }

  /**
   * Returns the right side of the panel
   * @return {Number} the right side of the panel
   */
  getRight() {
    return this.x + this.width;
  }

  /**
   * Returns the top of the panel
   * @return {Number} the top of the panel
   */
  getTop() {
    return this.y;
  }

  /**
   * Returns the bottom of the panel
   * @return {Number} the bottom of the panel
   */
  getBottom() {
    return this.y + this.height;
  }

  /**
   * Returns true if this panel contains the x,y. Assumes global coordinates
   * @param {Number} x 
   * @param {Number} y 
   */
  contains(x, y) {
    return x >= this.x && // check within left edge
      x <= (this.x + this.width) && // check within right edge
      y >= this.y && // check within top edge
      y <= (this.y + this.height); // check within bottom edge
  }

  keyPressed(){
    
  }

  mousePressed() {

  }

  mouseReleased() {

  }

  mouseDragged() {

  }

  mouseMoved() {

  }
}

const ColorEvents = Object.freeze({
  NEW_HOVER_COLOR: Symbol("New hover color"),
  NEW_SELECTED_COLOR: Symbol("New selected color")
});

class ColorPanel extends Panel {
  constructor(x, y, width, height) {
    super(x, y, width, height);

    // event handling https://stackoverflow.com/a/56612753
    this.events = new Map();

    this.knownEvents = new Set([ColorEvents.NEW_HOVER_COLOR, ColorEvents.NEW_SELECTED_COLOR]);

    this.parentPanel = null;

    this.hoverColor = color(0);
    this.selectedColor = color(0);

    this.showHoverColor = true;
  }

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

  fireNewHoverColorEvent(newHoverColor) {
    if (this.events.has(ColorEvents.NEW_HOVER_COLOR)) {
      for (let callBackForNewHoverColor of this.events.get(ColorEvents.NEW_HOVER_COLOR)) {
        // print("Fired callBackForNewHoverColor", newHoverColor);
        callBackForNewHoverColor(this, newHoverColor);
      }
    }
  }

  fireNewSelectedColorEvent(newSelectedColor) {
    if (this.events.has(ColorEvents.NEW_SELECTED_COLOR)) {
      for (let callBackForNewSelectedColor of this.events.get(ColorEvents.NEW_SELECTED_COLOR)) {
        // print("Fired callBackForNewSelectedColor", newSelectedColor);
        callBackForNewSelectedColor(this, newSelectedColor);
      }
    }
  }

  setHoverColor(hoverColor) {
    if (!(hoverColor instanceof p5.Color)) {
      //print("hoverColor not instanceof p5.Color", hoverColor);
      hoverColor = ColorPanel.parseColor(hoverColor);
    }
    this.hoverColor = hoverColor;
  }

  setSelectedColor(selectedColor) {
    if (!(selectedColor instanceof p5.Color)) {
      //print("selectedColor not instanceof p5.Color", selectedColor);
      selectedColor = ColorPanel.parseColor(selectedColor);
    }
    this.selectedColor = selectedColor;
  }

  static getRgbString(c, rightDigits = 1) {
    return nfc(red(c), rightDigits) + ", " + nfc(green(c), rightDigits) + ", " + nfc(blue(c), rightDigits);
  }

  static getRgbHexString(c, includeAlpha = true) {
    // code from https://stackoverflow.com/a/24390910
    hex = [0, 1, 2].map(
      function (idx) { return ColorPanel.byteToHex(c.levels[idx]); }
    ).join('');

    if(includeAlpha){
      hex += ColorPanel.byteToHex(alpha(c));
    }
    return "#" + hex;
    //return "#" + hex(red(c), 2) + hex(green(c), 2) + hex(blue(c), 2);
  }

  static byteToHex(num) {
    // Turns a number (0-255) into a 2-character hex number (00-ff)
    return ('0' + num.toString(16)).slice(-2);
  }

  static parseColor(possibleColor) {
    //print("possibleColor type", typeof possibleColor);
    if (possibleColor instanceof p5.Color) {
      return possibleColor;
    } else if ('levels' in possibleColor) {
      //print("levels is in possibleColor", typeof possibleColor.levels);
      //print("Array.isArray", Array.isArray(possibleColor.levels));
      //print(possibleColor.levels);
      let c = color(possibleColor.levels[0],
        possibleColor.levels[1],
        possibleColor.levels[2],
        possibleColor.levels[3]);
      return c;
    } else if (Array.isArray(possibleColor) && possibleColor.length >= 3) {
      let r = possibleColor[0];
      let g = possibleColor[1];
      let b = possibleColor[2];
      let a = 255;
      if (possibleColor.length >= 4) {
        a = possibleColor[3];
      }
      return color(r, g, b, a);
    } else {
      throw "The object " + possibleColor + "could not be parsed for a color";
    }
  }
}

