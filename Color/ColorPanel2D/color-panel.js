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

  mousePressed() {

  }

  mouseReleased(){

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

  setHoverColor(hoverColor){
    this.hoverColor = hoverColor;
  }

  setSelectedColor(selectedColor){
    this.selectedColor = selectedColor;
  }
}

