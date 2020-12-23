let skyBackground;
let sun;
let moon;
let mountainRange;
let mountainRanges = new Array();
const maxNumMountainRanges = 5;

function setup() {
  createCanvas(windowWidth, windowHeight);
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

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  skyBackground.width = width;
  skyBackground.height = height;
}
