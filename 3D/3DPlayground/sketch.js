/**
 * 
 * TODO:
 * - [] Draw grid (for debugging)
 * - [] Allow cube selection (via brushing)
 * - [] Show 2D slices (allow those to be interactive), which will change cursor in cube
 */

let angle = 0;
let boxSize = 10;
let boxMargin = 2;

const maxColor = 255;
const numCols = 5;
let colorStep = maxColor / numCols;

let pFrameRate;
let myFont;

let selectedColor;

function preload(){
  //font = textFont("Inconsolata");
  myFont = loadFont('assets/AvenirNextLTPro-Demi.ttf');
}

function setup() {
  createCanvas(500, 400, WEBGL);
  //debugMode();
  pFrameRate = createP('Framerate');
  textFont(myFont);
}

function draw() {
  background(130);

  // rectMode(CENTER);
  // noStroke();
  fill(0, 255, 255);
  noStroke();
  push();
  rotateX(angle);
  rotateY(angle * 0.3);
  rotateZ(angle * 0.2);
  // rect(0, 0, 150, 150);
  angle += 0.02;
  box(boxSize, boxSize, boxSize);
  pop();

  drawAxes();
  //draw3DColorGrid();


  orbitControl();
  pFrameRate.html(nfc(frameRate(), 1) + " fps");
}

function drawAxes(){
  // draw the axes
  let axisLength = calcFull3DCubeSize() * 1.2;
  let axisRadius = 2;
  let coneRadius = 4;
  let coneLength = 10;
  //translate(-halfCube, -halfCube, -halfCube);
  push();
  
  // put axes right on the edges of the boxes (rather than through center)
  translate(-boxSize / 2, boxSize / 2, -boxSize / 2);

  noFill();
  // draw green (y) and red (x) outline grid
  for (let r = 0; r < maxColor; r += colorStep) {
    for (let g = 0; g < maxColor; g += colorStep) {
      // fill(r, g, 0);
      stroke(r, g, 0);
      let x = (r / colorStep) * (boxSize + boxMargin);
      let y = -boxSize - (g / colorStep) * (boxSize + boxMargin);
      rect(x, y, boxSize);
    }
  }

  push();
  rotateX(HALF_PI);
  for (let r = 0; r < maxColor; r += colorStep) {
    for (let b = 0; b < maxColor; b += colorStep) {
      // fill(r, 0, b);
      stroke(r, 0, b);
      let x = (r / colorStep) * (boxSize + boxMargin);
      let y = (b / colorStep) * (boxSize + boxMargin);
      rect(x, y, boxSize);
    }
  }
  pop();

  push();
  rotateY(HALF_PI);
  for (let g = 0; g < maxColor; g += colorStep) {
    for (let b = 0; b < maxColor; b += colorStep) {
      
      stroke(0, g, b);
      let x = -boxSize - (g / colorStep) * (boxSize + boxMargin);
      let y = -boxSize - (b / colorStep) * (boxSize + boxMargin);
      rect(x, y, boxSize);
    }
  }
  pop();
 
 
  noStroke();
  push();
  fill(0, 255, 0);
  rotateX(PI);
  translate(0, axisLength / 2, 0);
  cylinder(axisRadius, axisLength);
  translate(0, axisLength / 2, 0);
  cone(coneRadius, coneLength);
  //let lbl = "RGB(0, 255, 0)";
  
  //text(lbl, 0, textSize() + 4);
  
  pop();

  push();
  fill(0, 255, 0);
  translate(0, -axisLength - coneLength - textSize(), 0);
  let lbl = "Green";
  let lblWidth = textWidth(lbl);
  text(lbl, -lblWidth / 2, 14);
  pop();

  // draw z-axis (blue)
  push();
  rotateX(HALF_PI);
  translate(0, axisLength / 2, 0);
  fill(0, 0, 255);
  cylinder(axisRadius, axisLength);
  translate(0, axisLength / 2, 0);
  cone(coneRadius, coneLength);
  lbl = "Blue";
  lblWidth = textWidth(lbl);
  text(lbl, -lblWidth / 2, 14);
  pop();

  // draw x-axis (red)
  push();
  rotateZ(-HALF_PI);
  translate(0, axisLength / 2, 0);
  fill(255, 0, 0);
  cylinder(axisRadius, axisLength);
  translate(0, axisLength / 2, 0);
  cone(coneRadius, coneLength);
  pop();

  push();
  fill(255, 0, 0);
  lbl = "Red";
  lblWidth = textWidth(lbl);
  translate(axisLength + coneLength, 0, 0);
  text(lbl, -2, textSize() / 3);
  pop();

  pop();
}

function draw3DColorGrid() {
  // center everything
  let halfCube = calcFull3DCubeSize() / 2;
  //translate(-halfCube, -halfCube, -halfCube);

  // Note: box(x, y, z) expects the center x, center y, and center z
  // It's like drawing rect with rectMode(CENTER) in 2D

  // draw the giant rgb 3d color grid
  for (let r = 0; r < maxColor; r += colorStep) {
    for (let g = 0; g < maxColor; g += colorStep) {
      for (let b = 0; b < maxColor; b += colorStep) {
        let x = (r / colorStep) * (boxSize + boxMargin);
        let y = -(g / colorStep) * (boxSize + boxMargin);
        let z = (b / colorStep) * (boxSize + boxMargin);
        push();
        translate(x, y, z);
        noFill();
        // fill(r, g, b);
        stroke(r, g, b);
        box(boxSize);
        pop();
      }
    }
  }
}

function calcSelectedCubeFromColor(col){
  let x = (red(col) / colorStep) * (boxSize + boxMargin);
  let y = (green(col) / colorStep) * (boxSize + boxMargin);
  let z = (blue(col) / colorStep) * (boxSize + boxMargin);

  return {
    "x" : x,
    "y" : y,
    "z" : z 
  }
}

function calcFull3DCubeSize() {
  return maxColor / colorStep * (boxSize + boxMargin);
}
