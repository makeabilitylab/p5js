/**
 * A playground for perlin noise.
 * 
 * For more on Perlin Noise and p5js, see the Coding Train's "Introduction to Perlin Noise":
 * https://www.youtube.com/playlist?list=PLRqwX-V7Uu6bgPNQAdxQZpJuJCjeOr7VD
 * 
 */

let randomGraph;

let noiseGraph;
let sliderNoiseStep;
let sliderNoiseOctaves; 
let sliderNoiseFalloff; 

let xNoiseInputVal = 0;

const numGraphs = 2;
let graphHeight = -1;

const xSliderPos = 90;
const ySliderBuffer = 4;

function setup() {
  createCanvas(windowWidth, windowHeight);

  graphHeight = height / numGraphs;
  let yGraph = 0;
  randomGraph = new Graph(0, yGraph, width, graphHeight, "random");
  yGraph += graphHeight;
  noiseGraph = new Graph(0, yGraph, width, graphHeight, "perlin noise");

  // Setup sliders
  sliderNoiseStep = createSlider(0, 2, 0.01, 0.001);
  sliderNoiseStep.position(xSliderPos, noiseGraph.getTop() + 15);
  sliderNoiseStep.style('width', '90px');

  sliderNoiseOctaves = createSlider(0, 10, 4, 1); // noise detail octave default is 4
  sliderNoiseOctaves.position(xSliderPos, sliderNoiseStep.y + sliderNoiseStep.height + ySliderBuffer);
  sliderNoiseOctaves.style('width', '90px');
  sliderNoiseOctaves.input(function(){
    noiseDetail(sliderNoiseOctaves.value());
    print("New sliderNoiseOctaves", sliderNoiseOctaves.value());
  });

  sliderNoiseFalloff = createSlider(0, 1, 0.5, 0.01); // needs to be between 0 and 1, default is 0.5
  sliderNoiseFalloff.position(xSliderPos, sliderNoiseOctaves.y + sliderNoiseOctaves.height + ySliderBuffer);
  sliderNoiseFalloff.style('width', '90px');
  sliderNoiseFalloff.input(function(){
    noiseDetail(sliderNoiseOctaves.value(), sliderNoiseFalloff.value());
    print("New sliderNoiseFalloff", sliderNoiseFalloff.value());
  });

}

function draw() {
  background(220);

  // add random or noise values to the graphs
  randomGraph.addItem(random());
  randomGraph.draw();

  const perlinNoiseVal = noise(xNoiseInputVal);
  noiseGraph.addItem(perlinNoiseVal);
  noiseGraph.draw();

  xNoiseInputVal += sliderNoiseStep.value();

  // separator
  stroke(100);
  line(0, randomGraph.getBottom(), width, randomGraph.getBottom());

  // draw slider and noise values
  noStroke();
  fill(240);
  
  let yTextPos = sliderNoiseStep.y + sliderNoiseStep.height - 2;
  const xSliderValTextPos = sliderNoiseStep.x + sliderNoiseStep.width + 7; 
  const xSliderLabelTextPos = sliderNoiseStep.x - 4;
  textAlign(RIGHT);
  text("Noise step:", xSliderLabelTextPos, yTextPos);
  textAlign(LEFT);
  text(nfc(sliderNoiseStep.value(), 3), xSliderValTextPos, yTextPos);

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

  // Resize the underlying graphs
  let yGraph = 0;
  graphHeight = height / numGraphs;
  randomGraph.moveAndResize(0, yGraph, width, graphHeight);
  yGraph += graphHeight;
  noiseGraph.moveAndResize(0, yGraph, width, graphHeight);

  // move the slider
  sliderNoiseStep.position(xSliderPos, noiseGraph.getTop() + 15);
  sliderNoiseOctaves.position(xSliderPos, sliderNoiseStep.y + sliderNoiseStep.height + ySliderBuffer);
  sliderNoiseFalloff.position(xSliderPos, sliderNoiseOctaves.y + sliderNoiseOctaves.height + ySliderBuffer);
}

/**
 * Simple graph class to plot random/noise data
 */
class Graph {
  constructor(x, y, width, height, title = "title", backgroundColor = color(90), strokeColor = color(230)) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
    this.strokeColor = strokeColor;

    this.data = new Array();
    this.title = title;
    this.titleSize = 32;
  }

  /**
   * Returns the left side of the graph
   * @return {Number} the left side of the graph
   */
  getLeft() {
    return this.x;
  }

  /**
   * Returns the right side of the graph
   * @return {Number} the right side of the graph
   */
  getRight() {
    return this.x + this.width;
  }

  /**
   * Returns the top of the graph
   * @return {Number} the top of the graph
   */
  getTop() {
    return this.y;
  }

  /**
   * Returns the bottom of the graph
   * @return {Number} the bottom of the graph
   */
  getBottom() {
    return this.y + this.height;
  }

  /**
   * Moves and resizes the graph within the canvas
   * 
   * @param {Number} newX the new X position
   * @param {Number} newY the new Y position
   * @param {Number} newWidth the new width position
   * @param {Number} newHeight the new height position
   */
  moveAndResize(newX, newY, newWidth, newHeight){
    this.x = newX;
    this.y = newY;
    this.width = newWidth;
    this.height = newHeight;
  }

  /**
   * Add a value between 0 and 1
   * @param {Number} val 
   */
  addItem(val) {
    if (this.data.length >= this.width) {
      let removedItem = this.data.shift();
    }
    val = constrain(val, 0, 1); // make sure val is indeed between 0 and 1
    this.data.push(val);
  }

  draw() {
    push();
    
    // draw background
    fill(this.backgroundColor);
    noStroke();
    rect(this.x, this.y, this.width, this.height);

    // draw title
    fill(100);
    textSize(this.titleSize);
    text(this.title, 5, this.getBottom() - 10);

    // draw graph
    noFill();
    stroke(this.strokeColor);
    beginShape();
    for (let x = 0; x < this.data.length; x++) {
      vertex(x, this.getBottom() - this.data[x] * this.height);
    }
    endShape();

    pop();
  }
}
