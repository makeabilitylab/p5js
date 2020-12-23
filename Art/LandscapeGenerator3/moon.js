class Moon extends Circle {
  constructor(baseColor) {
    let size = max(10, width * random(0.05, 0.1));
    let xLoc = min(size/2 + width * random(), width - size / 2);
    let yLoc = size/2 + size * random(0, 0.5);
    super(xLoc, yLoc, size, size);

    this.fillColor = color(hue(baseColor), saturation(baseColor) * 0.9,
      brightness(baseColor) * 1.4);

    // this.bottomColor = color(hue(baseColor), saturation(baseColor) * 0.5, brightness(baseColor) * 0.9);
    this.bottomColor = color(hue(baseColor), saturation(baseColor) * 2, brightness(baseColor) * 1.1);
    //this.bottomColor = color(255);

    let grd = drawingContext.createLinearGradient(this.getLeft(), this.getTop(), this.getLeft(), this.getBottom());
    grd.addColorStop(0, this.fillColor);
    grd.addColorStop(random(0.3, 0.7), this.bottomColor);
    this.colorGradient = grd;
  }

  draw() {

    let ctx = drawingContext;
    

    let oldFillStyle = ctx.fillStyle; // save old fillstyle to reset
    ctx.fillStyle = this.colorGradient;
    ctx.beginPath();
    ctx.arc(this.x, this.y, this.width / 2, 0, 2 * Math.PI);
    ctx.fill();
    ctx.fillStyle = oldFillStyle;
  }
}