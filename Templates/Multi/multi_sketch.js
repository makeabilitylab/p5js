// Multi-sketch example

// Sketch1
let sketch1 = new p5( p => {

  p.setup = () => {
    // canvas size is specified in the CSS file (size of div #one)
    const div = document.getElementById('one');
    p.createCanvas(div.clientWidth, div.clientHeight);
    // Accessibility: text description of the canvas for screen readers
    // https://p5js.org/reference/p5/describe/
    p.describe("A white square that follows the mouse around a dark gray canvas; replace this description with one that describes your sketch.");
  };

  p.draw = () => {
    p.background(100);
    p.fill(255);
    p.noStroke();
    p.rectMode(p.CENTER);
    p.rect(p.mouseX, p.mouseY, 50, 50);

  };
}, 'one');


// Sketch2
let sketch2 = new p5( p => {

  p.setup = () => {
    // canvas size is specified in the CSS file (size of div #two)
    const div = document.getElementById('two');
    p.createCanvas(div.clientWidth, div.clientHeight);
    // Accessibility: text description of the canvas for screen readers
    // https://p5js.org/reference/p5/describe/
    p.describe("A white circle that follows the mouse around a gray canvas; replace this description with one that describes your sketch.");
  };

  p.draw = () => {
    p.background(170);
    p.noStroke();
    p.fill(255);
    p.ellipse(p.mouseX, p.mouseY, 50, 50);
  };
}, 'two');