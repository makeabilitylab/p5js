// Original: https://editor.p5js.org/aferriss/sketches/SJERxF4Zm
// See also: https://p5js.org/reference/#/p5/textAscent
//
// TODO:
//  - have drop down to select fonts (to see how things change)
//  - print out ascent and descent information
//  - be able to set font size
function setup() {
  createCanvas(400, 400);
  noSmooth();
}

function draw() {
  background(220);
  
  textSize(30);
  
  let textScalar = 0.8;
  let xText = 50;
  let yText = 100;
  let asc =  textAscent() * textScalar;
  let desc = textDescent() * textScalar;
  
  let str = "Ascent A, Descent g";
  fill(0);
  noStroke();
  text(str, xText, yText);
  
  stroke(0);
  line(0, yText - asc, width, yText - asc);
  line(0, yText + desc, width, yText + desc);
  line(0, yText, width, yText); // baseline
  
  noFill();
  stroke(255, 0, 0);
  let strWidth = textWidth(str);
  rect(50, yText - asc, strWidth, asc + desc);
}