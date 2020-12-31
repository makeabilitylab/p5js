class RgbColorPickerPanel extends Panel {
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this.selectedColor = color(0);
    this.prevColor = color(0);
    this.hoverColor = color(0);

    this.colorPanels = [];

    //TODO: if mouse moved outside of RgbColorPickerPanel, then switch off hover? Otherwise, weird lingering hover.
    let xColorPanel = 0;
    let yColorPanel = 0;
    const numPanels = 5;
    const spaceBetweenPanels = 2;
    let wColorPanel = (width / numPanels) - spaceBetweenPanels;// + spaceBetweenPanels / numPanels;

    const numSliderPanels = 3;
    let hSliderColorPanel = (height / 3) - spaceBetweenPanels + spaceBetweenPanels / numSliderPanels;
    this.redColorSliderPanel = new ColorSliderPanel(xColorPanel, yColorPanel, wColorPanel, hSliderColorPanel, SliderColorType.RED);
    yColorPanel += hSliderColorPanel + spaceBetweenPanels;
    this.greenColorSliderPanel = new ColorSliderPanel(xColorPanel, yColorPanel, wColorPanel, hSliderColorPanel, SliderColorType.GREEN);
    yColorPanel += hSliderColorPanel + spaceBetweenPanels;
    this.blueColorSliderPanel = new ColorSliderPanel(xColorPanel, yColorPanel, wColorPanel, hSliderColorPanel, SliderColorType.BLUE);
    this.colorPanels.push(this.redColorSliderPanel, this.greenColorSliderPanel, this.blueColorSliderPanel)

    yColorPanel = 0;
    xColorPanel += wColorPanel + spaceBetweenPanels;
    this.redGreenColorPanel = new ColorPanel2D(xColorPanel, yColorPanel, wColorPanel, height, ColorAxes2D.RED_GREEN);

    xColorPanel += wColorPanel + spaceBetweenPanels;
    this.redBlueColorPanel = new ColorPanel2D(xColorPanel, yColorPanel, wColorPanel, height, ColorAxes2D.RED_BLUE);

    xColorPanel += wColorPanel + spaceBetweenPanels;
    this.greenBlueColorPanel = new ColorPanel2D(xColorPanel, yColorPanel, wColorPanel, height, ColorAxes2D.GREEN_BLUE);

    this.colorPanels.push(this.redGreenColorPanel, this.redBlueColorPanel, this.greenBlueColorPanel);

    const numSolidColorPanels = 3;
    xColorPanel += wColorPanel + spaceBetweenPanels;
    wColorPanel = (width / numPanels)
    let hSolidColorPanel = (height / 3) - spaceBetweenPanels + spaceBetweenPanels / numSolidColorPanels;
    this.prevColorPanel = new SolidColorPanel(xColorPanel, yColorPanel, wColorPanel, hSolidColorPanel, "Previous");

    yColorPanel += hSolidColorPanel + spaceBetweenPanels;
    this.curColorPanel = new SolidColorPanel(xColorPanel, yColorPanel, wColorPanel, hSolidColorPanel, "Current");

    yColorPanel += hSolidColorPanel + spaceBetweenPanels;
    this.hoverColorPanel = new SolidColorPanel(xColorPanel, yColorPanel, wColorPanel, hSolidColorPanel, "Hover");
    this.colorPanels.push(this.prevColorPanel, this.curColorPanel, this.hoverColorPanel);

    for (let colorPanel of this.colorPanels) {
      colorPanel.parentPanel = this;
      if (colorPanel instanceof ColorPanel) {
        colorPanel.on(ColorEvents.NEW_HOVER_COLOR, this.onNewHoverColorEvent);
        colorPanel.on(ColorEvents.NEW_SELECTED_COLOR, this.onNewSelectedColorEvent);
      }
    }
  }

  onNewHoverColorEvent(sender, newHoverColor) {
    //print("onNewHoverColorEvent", sender, newHoverColor);
    if (sender.parentPanel) {
      for (let colorPanel of sender.parentPanel.colorPanels) {
        if (colorPanel instanceof ColorPanel && colorPanel != sender) {
          colorPanel.setHoverColor(newHoverColor);
        }
      }

      sender.parentPanel.hoverColorPanel.fillColor = newHoverColor;
    }
  }

  onNewSelectedColorEvent(sender, newSelectedColor) {
    // print("onNewSelectedColorEvent", sender, newSelectedColor);
    if (sender.parentPanel) {
      for (let colorPanel of sender.parentPanel.colorPanels) {
        if (colorPanel instanceof ColorPanel && colorPanel != sender) {
          colorPanel.setSelectedColor(newSelectedColor);
        }
      }

      sender.parentPanel.prevColor = color(sender.parentPanel.selectedColor);
      sender.parentPanel.prevColorPanel.fillColor = sender.parentPanel.prevColor;

      sender.parentPanel.selectedColor = newSelectedColor;
      sender.parentPanel.curColorPanel.fillColor = newSelectedColor;
    }
  }

  mousePressed() {
    let colorPanelAtMouse = this.getColorPanelAtCoords(mouseX, mouseY);
    if (colorPanelAtMouse) {
      colorPanelAtMouse.mousePressed();
    }
  }

  mouseDragged() {
    let colorPanelAtMouse = this.getColorPanelAtCoords(mouseX, mouseY);
    if (colorPanelAtMouse) {
      colorPanelAtMouse.mouseDragged();
    }
  }

  mouseReleased() {
    let colorPanelAtMouse = this.getColorPanelAtCoords(mouseX, mouseY);
    if (colorPanelAtMouse) {
      colorPanelAtMouse.mouseReleased();
    }
  }

  mouseMoved() {
    let colorPanelAtMouse = this.getColorPanelAtCoords(mouseX, mouseY);
    if (colorPanelAtMouse) {
      colorPanelAtMouse.mouseMoved();
    }
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
    for (let colorPanel of this.colorPanels) {
      colorPanel.draw();
    }
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
    textSize(10);

    let xText = 2;
    let yText = 10;
    let yTextSpacing = 1;
    textStyle(BOLD);
    text(this.title, xText, yText);

    textSize(7);
    textStyle(NORMAL);
    let rgbStr = ColorPanel.getRgbString(this.fillColor);
    let rgbHexStr = ColorPanel.getRgbHexString(this.fillColor);
    yText += textSize() + yTextSpacing;
    text(rgbStr, xText, yText);

    yText += textSize() + yTextSpacing;
    text(rgbHexStr, xText, yText);
    pop();
  }
}