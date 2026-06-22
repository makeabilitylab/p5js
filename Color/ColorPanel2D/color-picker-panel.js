/**
 * Incorporates 1D and 2D RGB color pickers
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

// The top-level picker that owns and lays out all the child panels: three
// channel sliders (R/G/B), three 2D color planes, and three solid swatches
// (previous/current/hover). It subscribes to each child's hover/selected
// events and, when one fires, pushes the new color to all the *other* children
// so every panel stays in sync. Input events are routed to whichever child
// panel is under the mouse.
class RgbColorPickerPanel extends ColorPanel {
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this.colorPanels = [];

    // Lay the children out in columns left-to-right: sliders, then the three 2D
    // planes, then the three swatches. Track running x/y as we place each panel.
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

    // Adopt every child and subscribe to its hover/selected color events.
    for (let colorPanel of this.colorPanels) {
      colorPanel.parentPanel = this;
      if (colorPanel instanceof ColorPanel) {
        colorPanel.on(ColorEvents.NEW_HOVER_COLOR, this.onNewHoverColorEvent);
        colorPanel.on(ColorEvents.NEW_SELECTED_COLOR, this.onNewSelectedColorEvent);
      }
    }
  }

  // Toggle hover-color display across all child panels.
  setShowHoverColor(visibility){
    for (let colorPanel of this.colorPanels) {
      colorPanel.showHoverColor = visibility;
    }
  }

  // Set the picker's selected color and propagate it to all children.
  setSelectedColor(newSelectedColor) {
    super.setSelectedColor(newSelectedColor);
    RgbColorPickerPanel.setSelectedColorOfChildren(this, this.selectedColor);
  }

  // A child's hover/selected color changed: push it to the sibling panels and
  // re-broadcast so outside listeners hear it too. (`sender` is excluded so it
  // isn't redundantly updated.)
  onNewHoverColorEvent(sender, newHoverColor) {
    //print("onNewHoverColorEvent", sender, newHoverColor);
    if (sender.parentPanel) {
      // the parent panel points to this RgbColorPickerPanel class
      let rgbPanel = sender.parentPanel;
      RgbColorPickerPanel.setHoverColorOfChildren(rgbPanel, newHoverColor, sender);
      rgbPanel.fireNewHoverColorEvent(newHoverColor);
    }
  }

  onNewSelectedColorEvent(sender, newSelectedColor) {
    // print("onNewSelectedColorEvent", sender, newSelectedColor);
    if (sender.parentPanel) {
      // the parent panel points to this RgbColorPickerPanel class
      let rgbPanel = sender.parentPanel;

      RgbColorPickerPanel.setSelectedColorOfChildren(rgbPanel, newSelectedColor, sender);

      rgbPanel.fireNewSelectedColorEvent(newSelectedColor);
    }
  }

  // Route input events to whichever child panel is under the mouse.
  keyPressed() {
    let colorPanelAtMouse = this.getColorPanelAtCoords(mouseX, mouseY);
    if (colorPanelAtMouse) {
      colorPanelAtMouse.keyPressed();
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

  // Return the first child panel containing (x, y), or null.
  getColorPanelAtCoords(x, y) {
    for (let colorPanel of this.colorPanels) {
      if (colorPanel.contains(x, y)) {
        return colorPanel;
      }
    }
    return null;
  }

  // Draw every child panel.
  draw() {
    for (let colorPanel of this.colorPanels) {
      colorPanel.draw();
    }
  }

  // Push a new hover/selected color to all child color panels (skipping
  // exceptPanel, the one that originated the change) and update the relevant
  // swatch(es): hover updates the Hover swatch; selected shifts Current -> Previous.
  static setHoverColorOfChildren(rgbPanel, newHoverColor, exceptPanel = null) {
    for (let colorPanel of rgbPanel.colorPanels) {
      if (colorPanel instanceof ColorPanel && colorPanel != exceptPanel) {
        colorPanel.setHoverColor(newHoverColor);
      }
    }

    rgbPanel.hoverColorPanel.fillColor = newHoverColor;
  }

  static setSelectedColorOfChildren(rgbPanel, newSelectedColor, exceptPanel = null) {
    if(!(newSelectedColor instanceof p5.Color)){
      newSelectedColor = ColorPanel.parseColor(newSelectedColor);
    }

    for (let colorPanel of rgbPanel.colorPanels) {
      if (colorPanel instanceof ColorPanel && colorPanel != exceptPanel) {
        colorPanel.setSelectedColor(newSelectedColor);
      }
    }

    rgbPanel.prevColorPanel.fillColor = rgbPanel.curColorPanel.fillColor
    rgbPanel.curColorPanel.fillColor = newSelectedColor;
  }
}

// A single solid color swatch with a title (e.g. "Previous", "Current",
// "Hover") that also prints the fill color's RGB and hex values. Display-only;
// it extends Panel rather than ColorPanel since it isn't interactive.
class SolidColorPanel extends Panel {
  constructor(x, y, width, height, title) {
    super(x, y, width, height);

    this.title = title;
    this.fillColor = color(0);
  }

  // Draw the swatch with its title and RGB + hex readouts.
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
    let rgbStr = ColorPanel.getRgbString(this.fillColor, 0);
    let rgbHexStr = ColorPanel.getRgbHexString(this.fillColor);
    yText += textSize() + yTextSpacing;
    text(rgbStr, xText, yText);

    yText += textSize() + yTextSpacing;
    text(rgbHexStr, xText, yText);
    pop();
  }
}