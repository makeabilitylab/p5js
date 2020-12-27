// TODO:
// - Use perlin noise to make cloud-like textures. But perhaps this needs to be it's own
//   layer so can go in front of sun

class SkyBackground extends Shape{

    constructor(x, y, width, height) {
      super(x, y, width, height);
   
      let rc = SkyBackground.getRandomColor();
      this.topColor = SkyBackground.getRandomColor();
      this.bottomColor = color(hue(rc), saturation(rc) * 0.9, brightness(rc) * 1.5);
    }
  
    draw() {
      // p5js has very limited gradient fill support, so we actually
      // don't use p5js here, we use regular Canvas drawing
      // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
      let ctx = drawingContext;
      let grd = ctx.createLinearGradient(0, 0, 0, this.width);
      grd.addColorStop(0, this.topColor);
      grd.addColorStop(0.4, this.bottomColor);
  
      let oldFillStyle = ctx.fillStyle; // save old fillstyle to reset
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, this.width, this.height);
      ctx.fillStyle = oldFillStyle;
  
    }
  
    static getRandomColor() {
      colorMode(HSB, 255);
      let hue = random(0, 255);
      return color(hue, 115, 150);
    }
  }