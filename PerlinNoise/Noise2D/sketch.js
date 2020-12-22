/**
 * A playground for 2D perlin noise based on this Coding Train tutorial:
 * https://youtu.be/ikwNrFvnL3g
 * 
 * For more on Perlin Noise and p5js, see the Coding Train's "Introduction to Perlin Noise":
 * https://www.youtube.com/playlist?list=PLRqwX-V7Uu6bgPNQAdxQZpJuJCjeOr7VD
 * 
 */

let randomGraph;

let noiseGraph;
let sliderNoiseStepX;
let sliderNoiseStepY;
let sliderNoiseOctaves; 
let sliderNoiseFalloff; 

let xNoiseInputVal = 0;

const xSliderPos = 90;
const ySliderBuffer = 4;

function setup() {
  createCanvas(windowWidth, windowHeight);

  // Setup sliders
  sliderNoiseStepX = createSlider(0, 2, 0.01, 0.001);
  sliderNoiseStepX.position(xSliderPos, 15);
  sliderNoiseStepX.style('width', '90px');
  sliderNoiseStepX.input(function(){
    print("New sliderNoiseStepX", sliderNoiseStepX.value());
    redraw(); // since loop is off, force redraw
  });

  sliderNoiseStepY = createSlider(0, 2, 0.01, 0.001);
  sliderNoiseStepY.position(xSliderPos, sliderNoiseStepX.y + sliderNoiseStepX.height + ySliderBuffer);
  sliderNoiseStepY.style('width', '90px');
  sliderNoiseStepY.input(function(){
    print("New sliderNoiseStepY", sliderNoiseStepY.value());
    redraw(); // since loop is off, force redraw
  });

  sliderNoiseOctaves = createSlider(0, 10, 4, 1); // noise detail octave default is 4
  sliderNoiseOctaves.position(xSliderPos, sliderNoiseStepY.y + sliderNoiseStepY.height + ySliderBuffer);
  sliderNoiseOctaves.style('width', '90px');
  sliderNoiseOctaves.input(function(){
    noiseDetail(sliderNoiseOctaves.value());
    print("New sliderNoiseOctave", sliderNoiseOctaves.value());
    redraw(); // since loop is off, force redraw
  });

  sliderNoiseFalloff = createSlider(0, 1, 0.5, 0.01); // needs to be between 0 and 1, default is 0.5
  sliderNoiseFalloff.position(xSliderPos, sliderNoiseOctaves.y + sliderNoiseOctaves.height + ySliderBuffer);
  sliderNoiseFalloff.style('width', '90px');
  sliderNoiseFalloff.input(function(){
    noiseDetail(sliderNoiseOctaves.value(), sliderNoiseFalloff.value());
    print("New sliderNoiseFalloff", sliderNoiseFalloff.value());
    redraw(); // since loop is off, force redraw
  });

  pixelDensity(1);
  noLoop(); // no reason to loop
}

function draw() {
  
  loadPixels();
  const noiseStepX = sliderNoiseStepX.value();
  const noiseStepY = sliderNoiseStepY.value();
  let yNoiseInputCoord = 0;
  for(let y = 0; y < height; y++){
    let xNoiseInputCoord = 0;
    for(let x = 0; x < width; x++){
      let pixelIndex = (x + y * width) * 4;
      let noiseVal = noise(xNoiseInputCoord, yNoiseInputCoord);
      noiseVal = constrain(noiseVal, 0, 1);
      let pixelVal =  noiseVal* 255;
      pixels[pixelIndex + 0] = pixelVal;
      pixels[pixelIndex + 1] = pixelVal;
      pixels[pixelIndex + 2] = pixelVal;
      pixels[pixelIndex + 3] = 255; // opaqueness
      xNoiseInputCoord += noiseStepX; 
    }
    yNoiseInputCoord += noiseStepY;
  }
  updatePixels();

  // draw slider and noise values
  noStroke();
  fill(0);
  
  let yTextPos = sliderNoiseStepX.y + sliderNoiseStepX.height - 2;
  const xSliderValTextPos = sliderNoiseStepX.x + sliderNoiseStepX.width + 7; 
  const xSliderLabelTextPos = sliderNoiseStepX.x - 4;
  textAlign(RIGHT);
  text("Noise step x:", xSliderLabelTextPos, yTextPos);
  textAlign(LEFT);
  text(nfc(sliderNoiseStepX.value(), 3), xSliderValTextPos, yTextPos);

  yTextPos = sliderNoiseStepY.y + sliderNoiseStepY.height - 2;
  textAlign(RIGHT);
  text("Noise step y:", xSliderLabelTextPos, yTextPos);
  textAlign(LEFT);
  text(nfc(sliderNoiseStepY.value(), 3), xSliderValTextPos, yTextPos);

  yTextPos = sliderNoiseOctaves.y + sliderNoiseOctaves.height - 2;
  textAlign(RIGHT);
  text("Noise octaves:", xSliderLabelTextPos, yTextPos);
  textAlign(LEFT);
  text(sliderNoiseOctaves.value(), xSliderValTextPos, yTextPos);

  yTextPos = sliderNoiseFalloff.y + sliderNoiseFalloff.height - 2;
  textAlign(RIGHT);
  text("Noise falloff:", xSliderLabelTextPos, yTextPos);
  textAlign(LEFT);
  text(sliderNoiseFalloff.value(), xSliderValTextPos, yTextPos);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // // Resize the underlying graphs
  // let yGraph = 0;
  // graphHeight = height / numGraphs;
  // randomGraph.moveAndResize(0, yGraph, width, graphHeight);
  // yGraph += graphHeight;
  // noiseGraph.moveAndResize(0, yGraph, width, graphHeight);

  // // move the slider
  // sliderNoiseStep.position(xSliderPos, noiseGraph.getTop() + 15);
  // sliderNoiseOctaves.position(xSliderPos, sliderNoiseStep.y + sliderNoiseStep.height + ySliderBuffer);
  // sliderNoiseFalloff.position(xSliderPos, sliderNoiseOctaves.y + sliderNoiseOctaves.height + ySliderBuffer);
}
