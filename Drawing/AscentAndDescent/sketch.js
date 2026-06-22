// Original: https://editor.p5js.org/aferriss/sketches/SJERxF4Zm
// See also: https://p5js.org/reference/#/p5/textAscent
//
// TODO:
//  - have drop down to select fonts (to see how things change)
//  - print out ascent and descent information
//  - be able to set font size
// noSmooth() keeps the guide lines crisp (no anti-aliasing).
function setup() {
  createCanvas(400, 400);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("Sample text with horizontal lines marking its baseline, ascent, and descent, plus a red box showing the text's bounding area.");
  noSmooth();
}

// Draw sample text and overlay its typographic guides: baseline, ascent line,
// descent line, and a bounding box derived from textAscent()/textDescent().
function draw() {
  background(220);

  textSize(30);

  // Shrinks the reported ascent/descent slightly so the guide lines hug the
  // visible glyphs rather than the font's full metric box.
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