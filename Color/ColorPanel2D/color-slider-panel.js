const SliderColorType = Object.freeze({
  RED: Symbol("Red"),
  GREEN: Symbol("Green"),
  BLUE: Symbol("Blue")
});

class Thumb extends Panel {
  constructor(x, y, radius, isHoverThumb = false) {
    super(x, y, radius * 2, radius * 2);

    this.value = 0;
    this.color = color(0);

    this.strokeColor = color(200);

    this.isHoverThumb = isHoverThumb;
  }

  getRadius() {
    return this.width / 2;
  }

  contains(x, y) {
    return dist(this.x, this.y, x, y) <= this.getRadius();
  }

  draw() {

    push();
    translate(this.x, this.y);
    if (this.isHoverThumb) {
      stroke(this.color);
      noFill();
    } else {
      fill(this.color);
      stroke(this.strokeColor);
    }
    ellipse(0, 0, this.width);
    pop();

  }
}

class Track extends Panel {
  constructor(x, y, width) {
    super(x, y, width, 1);
    this.color = color(100);
  }

  draw() {
    push();
    translate(this.x, this.y);
    noFill();
    strokeWeight(1);
    stroke(color(200));

    line(0, 0, this.width, 0);
    pop();
  }
}

class ColorSliderPanel extends ColorPanel {
  constructor(x, y, width, height, sliderColorType) {
    super(x, y, width, height);
    this.sliderColorType = sliderColorType;

    //this.selectedColor = color(5);
    this.backgroundColor = color(80);

    const thumbRadius = 5;

    let trackMargin = thumbRadius / 2 + 3;
    let trackWidth = this.width - 2 * trackMargin;
    let xTrack = trackMargin;
    let yTrack = this.height / 2 + 5;
    this.track = new Track(xTrack, yTrack, trackWidth);

    this.thumbMain = new Thumb(xTrack, yTrack, thumbRadius);
    this.thumbHover = new Thumb(xTrack, yTrack, thumbRadius - 2, true);

    this.fontSize = 8;

    this.title = ColorSliderPanel.getTitleFromSliderColor(this.sliderColorType);

    this.minValue = 0;
    this.maxValue = 255;
  }

  setHoverColor(hoverColor) {
    super.setHoverColor(hoverColor);
    let sliderColorAndValue = ColorSliderPanel.getSliderColorAndValue(this.sliderColorType, hoverColor);
    this.thumbHover.color = sliderColorAndValue.thumbColor;
    this.thumbHover.value = sliderColorAndValue.thumbValue;
    this.thumbHover.x = map(this.thumbHover.value, this.minValue, this.maxValue, this.track.x, this.track.getRight());
  }

  setSelectedColor(selectedColor) {
    super.setSelectedColor(selectedColor);
    let sliderColorAndValue = ColorSliderPanel.getSliderColorAndValue(this.sliderColorType, selectedColor);
    this.thumbMain.color = sliderColorAndValue.thumbColor;
    this.thumbMain.value = sliderColorAndValue.thumbValue;
    this.thumbMain.x = map(this.thumbMain.value, this.minValue, this.maxValue, this.track.x, this.track.getRight());
  }

  mousePressed() {
    this.thumbMain.x = constrain(mouseX, this.track.x, this.track.getRight());
    this.thumbMain.value = map(this.thumbMain.x, this.track.x, this.track.getRight(), this.minValue, this.maxValue);
    let sliderColors = ColorSliderPanel.getSliderColor(this.sliderColorType, this.thumbMain.value, this.selectedColor);
    this.thumbMain.color = sliderColors.thumbColor;
    this.fireNewSelectedColorEvent(sliderColors.fullColor);
  }

  mouseDragged() {
    this.thumbMain.x = constrain(mouseX, this.track.x, this.track.getRight());
    this.thumbMain.value = map(this.thumbMain.x, this.track.x, this.track.getRight(), this.minValue, this.maxValue);
    let sliderColors = ColorSliderPanel.getSliderColor(this.sliderColorType, this.thumbMain.value, this.selectedColor);
    this.thumbMain.color = sliderColors.thumbColor;
    this.fireNewSelectedColorEvent(sliderColors.fullColor);
  }

  mouseMoved() {
    this.thumbHover.x = constrain(mouseX, this.track.x, this.track.getRight());
    this.thumbHover.value = map(this.thumbHover.x, this.track.x, this.track.getRight(), this.minValue, this.maxValue);
    let sliderColors = ColorSliderPanel.getSliderColor(this.sliderColorType, this.thumbHover.value, this.hoverColor);
    this.thumbHover.color = sliderColors.thumbColor;
    this.fireNewHoverColorEvent(sliderColors.fullColor);
  }

  draw() {
    if (this.contains(mouseX, mouseY)) {
      this.thumbMain.isSelected = false;
    }

    push();
    translate(this.x, this.y);

    // draw background
    noStroke();
    fill(this.backgroundColor);
    rect(0, 0, this.width, this.height);

    // draw track and thumbs
    this.track.draw();
    this.thumbMain.draw();
    this.thumbHover.draw();

    // draw text
    textSize(this.fontSize);
    noStroke();
    fill(255);
    let yText = this.track.y - this.fontSize;
    text(this.title, this.track.x, yText);

    push();
    textAlign(RIGHT);
    text(nfc(this.thumbMain.value, 1), this.track.getRight(), yText);
    pop();

    pop();
  }

  static getSliderColorAndValue(sliderColorType, col) {
    let colorVal = 0;
    let thumbColor;
    let fullColor;

    switch (sliderColorType) {
      case SliderColorType.RED:
        colorVal = red(col);
        thumbColor = color(colorVal, 0, 0);
        fullColor = color(colorVal, green(col), blue(col));
        break;
      case SliderColorType.GREEN:
        colorVal = green(col);
        thumbColor = color(0, colorVal, 0);
        fullColor = color(red(col), colorVal, blue(col));
        break;
      case SliderColorType.BLUE:
        colorVal = blue(col);
        thumbColor = color(0, 0, colorVal);
        fullColor = color(red(col), green(col), colorVal);
        break;
    }

    return {
      "thumbValue": colorVal,
      "thumbColor": thumbColor,
      "fullColor": fullColor
    };
  }

  static getSliderColor(sliderColorType, val, col) {
    let thumbColor;
    let fullColor;
    switch (sliderColorType) {
      case SliderColorType.RED:
        if (val instanceof p5.Color) {
          val = red(val);
        }
        thumbColor = color(val, 0, 0);
        fullColor = color(val, green(col), blue(col));
        break;
      case SliderColorType.GREEN:
        if (val instanceof p5.Color) {
          val = green(val);
        }
        thumbColor = color(0, val, 0);
        fullColor = color(red(col), val, blue(col));
        break;
      case SliderColorType.BLUE:
        if (val instanceof p5.Color) {
          val = blue(val);
        }
        thumbColor = color(0, 0, val);
        fullColor = color(red(col), green(col), val);
        break;
    }

    return {
      "thumbValue": val,
      "thumbColor": thumbColor,
      "fullColor": fullColor
    };
  }

  static getTitleFromSliderColor(sliderColorType) {
    switch (sliderColorType) {
      case SliderColorType.RED:
        return "Red";
      case SliderColorType.GREEN:
        return "Green";
      case SliderColorType.BLUE:
        return "Blue";
    }
    return "";
  }

}