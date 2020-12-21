/**
 * A playground for perlin noise.
 * 
 * For more on Perlin Noise and p5js, see the Coding Train's "Introduction to Perlin Noise":
 * https://www.youtube.com/playlist?list=PLRqwX-V7Uu6bgPNQAdxQZpJuJCjeOr7VD
 */

let randomGraph;

let noiseGraph;
let noiseSlider;
let xNoiseInputVal = 0;
let xNoiseStep = 0.01;

const numGraphs = 2;
let graphHeight = -1;

function setup() {
  createCanvas(windowWidth, windowHeight);

  graphHeight = height / numGraphs;
  let yGraph = 0;
  randomGraph = new Graph(0, yGraph, width, graphHeight);
  yGraph += graphHeight;
  noiseGraph = new Graph(0, yGraph, width, graphHeight);
  noiseSlider = createSlider(0, 2, xNoiseStep, 0.001);
  noiseSlider.position(5, noiseGraph.getTop() + 15);
  noiseSlider.style('width', '90px');
  noiseSlider.input(onNewNoiseSliderValue);
}

function onNewNoiseSliderValue(){
  xNoiseStep = noiseSlider.value();
  print("onNewNoiseSliderValue", xNoiseStep);
}

function draw() {
  background(220);
  randomGraph.addItem(random());
  randomGraph.draw();

  const perlinNoiseVal = noise(xNoiseInputVal);
  noiseGraph.addItem(perlinNoiseVal);
  noiseGraph.draw();

  xNoiseInputVal += xNoiseStep;

  // separator
  stroke(100);
  line(0, randomGraph.getBottom(), width, randomGraph.getBottom());

  // draw noise step value
  noStroke();
  fill(240);
  text(nfc(xNoiseStep, 3), noiseSlider.x + noiseSlider.width + 7, noiseSlider.y + 14)
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);

  // Resize the underlying graphs
  let yGraph = 0;
  graphHeight = height / numGraphs;
  randomGraph.moveAndResize(0, yGraph, width, graphHeight);
  yGraph += graphHeight;
  noiseGraph.moveAndResize(0, yGraph, width, graphHeight);
}

/**
 * Simple graph class to plot random/noise data
 */
class Graph {
  constructor(x, y, width, height, backgroundColor = color(90), strokeColor = color(230)) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
    this.strokeColor = strokeColor;

    this.data = new Array();
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
    val = constrain(val, 0, 1);
    this.data.push(val);
  }

  draw() {
    push();
    
    // draw background
    fill(this.backgroundColor);
    noStroke();
    rect(this.x, this.y, this.width, this.height);

    // draw graph
    stroke(this.strokeColor);
    beginShape();
    for (let x = 0; x < this.data.length; x++) {
      vertex(x, this.getBottom() - this.data[x] * this.height);
    }
    endShape();

    pop();
  }
}
