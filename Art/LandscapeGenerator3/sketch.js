// Procedurally generated landscape in p5js, refactored so each feature lives in
// its own file: SkyBackground, Sun, Moon, and MountainRange. Fills the browser
// window and resizes with it.
//
// By Jon Froehlich
// http://makeabilitylab.io/
//
// Based on:
//  - https://twitter.com/muted_mountains (follow them!)
//  - https://jonoshields.com/2017/03/29/creating-procedurally-generated-scenes/

let skyBackground;
let sun;
let moon;
let mountainRange;
let mountainRanges = new Array();
const maxNumMountainRanges = 5;

// Build the sky, sun, moon (disabled by default), and the layered ranges.
function setup() {
  createCanvas(windowWidth, windowHeight);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A full-window procedurally generated landscape with a gradient sky, a sun, and several layered ranges of Perlin-noise mountain silhouettes.");
  skyBackground = new SkyBackground(0, 0, width, height);
  sun = new Sun(skyBackground.topColor);
  moon = new Moon(skyBackground.topColor);

  // mountainRange = new MountainRange(skyBackground.topColor);
  moon.enabled = false;

  for (let i = 0; i < maxNumMountainRanges; i++) {
    let mountainRange = new MountainRange(skyBackground.topColor, i, maxNumMountainRanges);
    mountainRanges.push(mountainRange);
    
    // 50% chance of adding a cloud every other
    // TODO: maybe don't have clouds in closest mountains?
    // TURN OFF CLOUDS FOR NOW... NEED TO COME BACK TO THIS TO GET THEM TO WORK 
    // if (i % 2 == 0 && random() > 0.5 && i + 1 != maxMountainRanges){
    //   let cloud = new Cloud(mountainRange, topColor);
    //   mountainClouds[i] = cloud; 
    // }
  }
}

// Each frame: redraw sky, sun, optional moon, then the ranges far-to-near
// (ranges self-animate by advancing their noise offset each draw).
function draw() {
  //background(220);
  skyBackground.draw();
  sun.draw();

  if (moon.enabled) {
    moon.draw();
  }

  for (let i = mountainRanges.length - 1; i >= 0; i--) {
    let mountainRange = mountainRanges[i];
    mountainRange.draw();
  }
}

// Keep the canvas and sky filling the window when the browser is resized.
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  skyBackground.width = width;
  skyBackground.height = height;
}
