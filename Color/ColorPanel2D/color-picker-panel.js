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
    }
  }

  setHoverColor(c) {
    this.hoverColor = c;
    for (let colorPanel of this.colorPanels) {
      if ('hoverColor' in colorPanel) {
        colorPanel.hoverColor = c;
      }
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
    textSize(8);
    text(this.title, 2, 10);
    pop();
  }
}