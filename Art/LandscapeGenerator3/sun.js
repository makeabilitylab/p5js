// A randomly sized/placed sun, tinted brighter than the sky. Can draw as a
// flat fill or a vertical gradient depending on the useGradient flag.
class Sun extends Circle {
  // Random size and position high in the sky (above the mountains); sets up a
  // bright fill color plus a bottom color for the optional gradient.
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

  // Draws the sun: a gradient-filled circle via the raw Canvas context when
  // useGradient is set, otherwise a flat p5 ellipse.
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
      pop();
    }
  }
}