// Based on:
//  - https://twitter.com/muted_mountains
//  - https://jonoshields.com/2017/03/29/creating-procedurally-generated-scenes/
//  - 
//
// TODO:
// - [done] generate background
// - if light enough, draw sun
// - add moon (diff variations)
// - add stars
// - add trees
// - add clouds
// - generate based on FFT

let topColor;
let bottomColor;
let sun;
let mountainRange;
let mountainRange2;

function setup() {
  createCanvas(400, 400);
  colorMode(HSB, 255);

  topColor = getRandomTopBGColor();
  bottomColor = color(hue(topColor), saturation(topColor) * 0.9, brightness(topColor) * 1.5);
  sun = new Sun(topColor);
  mountainRange = new MountainRange(50, topColor);
  mountainRange2 = new MountainRange(200, topColor);
  mountainRange2.fillColor = color(hue(topColor), saturation(topColor) * 0.5, brightness(topColor) * 0.75);
}

function draw() {
  drawBackground(topColor, bottomColor);
  sun.draw();
  mountainRange2.draw();
  mountainRange.draw();
}

function getRandomTopBGColor() {
  colorMode(HSB, 255);
  let hue = random(0, 255);
  return color(hue, 115, 150);
}

function drawBackground(top, bottom) {
  // p5js has very limited gradient fill support, so we actually
  // don't use p5js here, we use regular Canvas drawing
  // https://developer.mozilla.org/en-US/docs/Web/API/CanvasRenderingContext2D/createLinearGradient
  let ctx = drawingContext;
  let grd = ctx.createLinearGradient(0, 0, 0, width);
  grd.addColorStop(0, top);
  grd.addColorStop(0.4, bottom);

  let oldFillStyle = ctx.fillStyle; // save old fillstyle to reset
  ctx.fillStyle = grd;
  ctx.fillRect(0, 0, width, height);
  ctx.fillStyle = oldFillStyle;
}


class Sun extends Shape {

  constructor(baseColor) {
    let size = 50 + width * random(0.1, 0.3);
    let xLoc = width * random();
    let yLoc = size * random(-0.2, 0.5);
    super(xLoc, yLoc, size, size);

    this.fillColor = color(hue(topColor), saturation(topColor) * 0.9,
      brightness(topColor) * 1.6);
  }

  draw() {
    // TODO: maybe make the sun a slight gradient in future too?
    noStroke();
    fill(this.fillColor);
    ellipse(this.x, this.y, this.width, this.height);
  }
}

class MountainRange extends Shape {
  constructor(maxMountainHeight, baseColor) {
    super(0, height - maxMountainHeight, width, maxMountainHeight);
    this.fillColor = color(hue(topColor), saturation(topColor) * 0.4, brightness(topColor) * 0.65);
    
    // 5 is smooth, 10 is kinda rugged, 30 is jagged
    this.jaggedness = 10;
  }
  
  draw(){
    // perlin noise links:
    // - http://flafla2.github.io/2014/08/09/perlinnoise.html
    // - https://jonoshields.com/2017/03/29/creating-procedurally-generated-scenes/
    // - https://genekogan.com/code/p5js-perlin-noise/
    fill(this.fillColor);
 
    
    beginShape();
    vertex(-20, height);
    for (var x = 1; x < width + 20; x++) {
      let nx = map(x, 0, width, 0, this.jaggedness);
      let y = this.height * noise(nx);
      vertex(x, height - y);
    }
    vertex(width+21, height);
    endShape();
  }
}