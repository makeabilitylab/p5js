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
}

class RgbColorPickerPanel extends Panel {
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this.selectedColor = color(0);
    this.prevColor = color(0);
    this.hoverColor = color(0);

    this.colorPanels = [];

    //TODO: fix so no space on right side?
    //TODO: fix so no space below hover panel?
    //TODO: if mouse moved outside of RgbColorPickerPanel, then switch off hover? Otherwise, weird lingering hover.
    let xColorPanel = 0;
    let yColorPanel = 0;
    const numPanels = 4;
    const spaceBetweenPanels = 3;
    let wColorPanel = (width / numPanels) - spaceBetweenPanels;
    this.redGreenColorPanel = new ColorPanel2D(xColorPanel, yColorPanel, wColorPanel, height, ColorAxes2D.RED_GREEN);

    xColorPanel += wColorPanel + spaceBetweenPanels;
    this.redBlueColorPanel = new ColorPanel2D(xColorPanel, yColorPanel, wColorPanel, height, ColorAxes2D.RED_BLUE);

    xColorPanel += wColorPanel + spaceBetweenPanels;
    this.greenBlueColorPanel = new ColorPanel2D(xColorPanel, yColorPanel, wColorPanel, height, ColorAxes2D.GREEN_BLUE);

    this.colorPanels.push(this.redGreenColorPanel, this.redBlueColorPanel, this.greenBlueColorPanel);

    xColorPanel += wColorPanel + spaceBetweenPanels;
    let hSolidColorPanel = (height / 3) - spaceBetweenPanels;
    this.prevColorPanel = new SolidColorPanel(xColorPanel, yColorPanel, wColorPanel, hSolidColorPanel, "Previous");

    yColorPanel += hSolidColorPanel + spaceBetweenPanels;
    this.curColorPanel = new SolidColorPanel(xColorPanel, yColorPanel, wColorPanel, hSolidColorPanel, "Current");

    yColorPanel += hSolidColorPanel + spaceBetweenPanels;
    this.hoverColorPanel = new SolidColorPanel(xColorPanel, yColorPanel, wColorPanel, hSolidColorPanel, "Hover");
  }

  setHoverColor(c){
    this.hoverColor = c;
    for (let colorPanel of this.colorPanels) {
      colorPanel.hoverColor = c;
    }
    this.hoverColorPanel.fillColor = c;
  }

  setSelectedColor(c) {
    this.prevColor = color(this.selectedColor);
    this.prevColorPanel.fillColor = this.prevColor;

    this.selectedColor = c;
    this.curColorPanel.fillColor = c;

    this.redGreenColorPanel.selectedColor = c;
    this.redBlueColorPanel.selectedColor = c;
    this.greenBlueColorPanel.selectedColor = c;

    this.redGreenColorPanel.updateOffscreenBuffer();
    this.redBlueColorPanel.updateOffscreenBuffer();
    this.greenBlueColorPanel.updateOffscreenBuffer();
  }

  getColorPanelAtCoords(x, y) {
    for (let colorPanel of this.colorPanels) {
      if (colorPanel.contains(x, y)) {
        return colorPanel;
      }
    }
    return null;
  }

  draw() {
    this.redGreenColorPanel.draw();
    this.redBlueColorPanel.draw();
    this.greenBlueColorPanel.draw();

    this.prevColorPanel.draw();
    this.curColorPanel.draw();
    this.hoverColorPanel.draw();
  }
}

class SolidColorPanel extends Panel {
  constructor(x, y, width, height, title) {
    super(x, y, width, height);

    this.title = title;
    this.fillColor = color(0);
  }

  draw() {
    push();
    translate(this.x, this.y);
    noStroke();
    fill(this.fillColor);
    rect(0, 0, this.width, this.height);

    fill(255);
    textSize(8);
    text(this.title, 2, 10);
    pop();
  }
}