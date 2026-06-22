// An overview of the screen coordinates in p5js.
//
// This example uses a class called grid.js, which I wrote explicitly to 
// help students understand how p5js orients its canvas
//
// By Jon Froehlich
// http://makeabilitylab.io

let grid;

// Build the coordinate-grid overlay and configure which optional layers
// (checkerboard, center point) it draws.
function setup() {
  createCanvas(600, 400);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A coordinate grid overlaid on the canvas illustrating how p5.js orients its x and y screen coordinates.");
  grid = new Grid();
  //frameRate(1);
  grid.isCheckboardOn = false; // switch to true to get a red/black checkboard
  grid.isCenterPtOn = false; // switch to true to draw center pt
  fill(0, 0, 255);
  //noLoop();
  
  print("setup(): I only run once!");
}

// Each frame: clear to dark and redraw the grid overlay (uncomment the shapes
// below to see where they land relative to the coordinate axes).
function draw() {
  //print("Hi, I'm draw(), you keep calling me all the time!");
  background(10);
  
  // uncomment the code below to draw some shapes
  // ellipseMode(CENTER);
  // fill(255, 0, 0);
  // stroke(255);
  // strokeWeight(5);
  
  // ellipse(100, 100, 200);
  
  // fill(0, 0, 200, 128);
  // ellipse(150, 150, 180);
  
  // fill(200, 0, 0);
  // noStroke();
  // rect(300, 300, 100, 50);

  grid.draw();
}








