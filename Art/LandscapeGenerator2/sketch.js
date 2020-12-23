// An initial framework for procedurally generated landscapes in p5js
//
// By Jon Froehlich
// http://makeabilitylab.io/
//
// Based on:
//  - https://twitter.com/muted_mountains (follow them!)
//  - https://jonoshields.com/2017/03/29/creating-procedurally-generated-scenes/
//
// TODO:
// - [done] generate background
// - [done] consider drawing moon or sun
// - draw crescent moon?
// - add stars
// - add trees
// - [partial] add clouds
// - differentiate from fog (which is like a mountain range) and clouds, which can be in sky
// - generate based on microphone FFT?
// - add snowcaps?
// - add rain or snow fall?
// - add motion? (parallax side scrolling)
// - [done] add in santa flying by with his sleigh?
// - add water on left or right side
// - add ET or santa animated across moon. Maybe tie fighters too?

let topColor;
let bottomColor;
let sun;
let mountainRanges = [];
let maxMountainRanges = 6;
let mountainClouds = [];
let santaImage;
let santaWidth;
let santaX;
let drawSanta = false;

function setup() {
  createCanvas(1024, 600);
  colorMode(HSB, 255);

  topColor = getRandomTopBGColor();
  bottomColor = color(hue(topColor), saturation(topColor) * 0.9, brightness(topColor) * 1.5);
  sun = new Sun(topColor);
  
  for (let i = 0; i < maxMountainRanges; i++) {
    let mountainRange = new MountainRange(i, maxMountainRanges, topColor);
    mountainRanges.push(mountainRange);
    
    // 50% chance of adding a cloud every other
    // TODO: maybe don't have clouds in closest mountains?
    // TURN OFF CLOUDS FOR NOW... NEED TO COME BACK TO THIS TO GET THEM TO WORK 
    // if (i % 2 == 0 && random() > 0.5 && i + 1 != maxMountainRanges){
    //   let cloud = new Cloud(mountainRange, topColor);
    //   mountainClouds[i] = cloud; 
    // }
  }
  
  santaImage = loadImage('assets/SantaSleigh1_Resized.png'); 
  santaWidth = random(sun.width * 0.7, sun.width);
  santaX = sun.x - random(0, santaWidth);
  smooth();
}

function draw() {
  drawBackground(topColor, bottomColor);
  sun.draw();

  // draw in reverse order (based on zindex)

  for (let i = mountainRanges.length - 1; i >= 0; i--) {
    
    // TODO update clouds to use a hashmap 
    // and check if we have clouds at index i
    if (i in mountainClouds){
      mountainClouds[i].draw();
    }
    
    let mountainRange = mountainRanges[i];
    //print("draw mountainRange", mountainRange.height);
    mountainRange.draw();
  }
 
  if(drawSanta){
    santaImage.resize(santaWidth, 0);
    image(santaImage, santaX, sun.y);
  }
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

class Cloud { //TODO: make this into a shape object
  
  constructor(mountainRange, baseColor){
    
    
    this.mountainRange =  mountainRange;
    
    this.fillColor = color(hue(bottomColor), 255 * 0.3, 255 * 0.9, 128);
    
    print("Making cloud for ", mountainRange.zIndex, " with height", this.mountainRange.height);
    
    this.smallWaveY = random(5, 10);
    this.angle1Multiplier = random(0.05, 0.08); // small wave
    
    this.largeWaveY = random(10, 30);
    this.angle2Multiplier = random(0.01, 0.035); // large wave
  }
  
  draw() {
    //stroke(255);
    
    // TODO: maybe try using diff sized circles along a sine wave
    // maybe that would look like cool clouds
    //
    // Daniel Shiffman talks about making clouds in this vid (but says it's in a diff video)
    //  - https://www.youtube.com/watch?v=76fiD5DvzeQ
    fill(this.fillColor);
    beginShape();
    vertex(0, height);
    for (let x = 0; x < width; x++) {
      // TODO: make this more readable so that we can choose 
      // number of cloud peaks based on pixels
      let angle = x * this.angle1Multiplier;
      let y = map(abs(sin(angle)), 0, 1, 0, this.smallWaveY);

      let angle2 = x * this.angle2Multiplier;
      let y2 = map(sin(angle2), -1, 1, 0, this.largeWaveY);
      y += y2;

      let nx = map(x, 0, width, 0, 5);
      y += 50 * noise(nx);
      
      //TODO: add in mountain height requirement where it's just barely above
      //mountain range
      vertex(x, height - y);
    }
    vertex(width, height);
    endShape();
  }
}

class MountainRange extends Shape {
  constructor(zIndex, numMountains, baseColor) {
    let maxMountainHeight = (zIndex + 1) / numMountains * (height - height * 0.4);
    maxMountainHeight += min(pow(zIndex, random(3.3, 4)), 100);

    super(0, height - maxMountainHeight, width, maxMountainHeight);
    // print("maxMountainHeight", maxMountainHeight);

    let sat = map(zIndex, 0, numMountains, 0, saturation(topColor));
    let bright = map(zIndex, 0, numMountains, 0, saturation(topColor));
    this.fillColor = color(hue(topColor), sat, bright);

    // 5 is smooth, 10 is kinda rugged, 30 is jagged
    this.jaggedness = random(5, 10);

    this.startNoise = zIndex * width + random(0, width / 2);
    this.endNoise = this.startNoise + this.jaggedness;
    this.zIndex = zIndex;
  }

  draw() {
    // perlin noise links:
    // - http://flafla2.github.io/2014/08/09/perlinnoise.html
    // - https://jonoshields.com/2017/03/29/creating-procedurally-generated-scenes/
    // - https://genekogan.com/code/p5js-perlin-noise/
    fill(this.fillColor);

    beginShape();
    vertex(-20, height);
    for (var x = 1; x < width + 20; x++) {
      let nx = map(x, 0, width, this.startNoise, this.endNoise);
      let y = this.height * noise(nx);
      vertex(x, height - y);
    }
    vertex(width + 21, height);
    endShape();
  }
}