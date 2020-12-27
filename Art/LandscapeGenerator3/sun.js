class Sun extends Circle {
  constructor(baseColor) {
    let size = 30 + width * random(0.01, 0.3);
    let xLoc = width * random();
    let yLoc = height * random(0, 0.6); // stay above mountain range
    super(xLoc, yLoc, size, size);

    this.fillColor = color(hue(baseColor), saturation(baseColor) * 0.9, brightness(baseColor) * 1.6);

    this.bottomColor = color(hue(baseColor), saturation(baseColor) * 2, brightness(baseColor) * 1.1);
    this.useGradient = false;
    //this.bottomColor = color(255);
  }

  draw() {
    if (this.useGradient) {
      let ctx = drawingContext;
      let grd = ctx.createLinearGradient(0, 0, 0, this.width);
      grd.addColorStop(0, this.fillColor);
      grd.addColorStop(0.4, this.bottomColor);

      let oldFillStyle = ctx.fillStyle; // save old fillstyle to reset
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI);
      ctx.fill();
      ctx.fillStyle = oldFillStyle;
    } else {
      push();
      noStroke();
      fill(this.fillColor);
      ellipse(this.x, this.y, this.width, this.height);
      push();
    }
  }
}