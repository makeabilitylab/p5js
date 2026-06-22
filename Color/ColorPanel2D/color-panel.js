// Geometry base class for every panel in this picker: holds a rectangle
// (x, y, width, height), edge accessors + a hit test, and empty input
// handlers that subclasses override. ColorPanel (below), the sliders, the 2D
// planes, and the swatches all ultimately extend this.
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

  // Input handler hooks; subclasses override the ones they care about.
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

// The two events a color panel can emit: the color under the cursor changed
// (hover), or the user committed a new color (selected).
const ColorEvents = Object.freeze({
  NEW_HOVER_COLOR: Symbol("New hover color"),
  NEW_SELECTED_COLOR: Symbol("New selected color")
});

// Base class for any panel that participates in color picking. Adds a tiny
// publish/subscribe event system (so panels can notify the parent picker when
// hover/selected colors change), the current hover + selected colors, and
// static color-formatting/parsing helpers shared by all the panels.
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

  // Subscribe a callback to one of the known ColorEvents.
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

  // Notify all subscribers of a new hover/selected color (passing sender + color).
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

  // Set the hover/selected color, coercing non-p5.Color inputs via parseColor().
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

  // Format a color as an "r, g, b" string (rightDigits decimal places each).
  static getRgbString(c, rightDigits = 1) {
    return nfc(red(c), rightDigits) + ", " + nfc(green(c), rightDigits) + ", " + nfc(blue(c), rightDigits);
  }

  // Format a color as a "#rrggbb" (or "#rrggbbaa") hex string.
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

  // Coerce a value into a p5.Color, accepting a p5.Color, an object with a
  // `levels` array, or an [r, g, b(, a)] array. Throws if it can't.
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

