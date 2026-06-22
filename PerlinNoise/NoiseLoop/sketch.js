/**
 * A playground for 2D perlin noise loops based on this Coding Train tutorial:
 * https://youtu.be/ZI1dmHv3MeM
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

// Create the full-window canvas (unfinished starter — draw() is still empty).
function setup() {
  createCanvas(windowWidth, windowHeight);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A blank canvas; this is an unfinished starter for a 2D Perlin noise loop sketch.");

}

// Each frame: intended to render a seamless looping 1D Perlin noise animation (not yet implemented).
function draw() {
  // TODO:

}

// Keep the canvas matched to the window on resize.
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
