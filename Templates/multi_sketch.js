// Multi-sketch example

// Sketch1
let sketch1 = new p5( p => {

  p.setup = () => {
    // canvas size is specified in the CSS file (size of div #one)
    p.createCanvas($("#one").width(), $("#one").height());
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
    p.createCanvas($("#two").width(), $("#two").height());
  };

  p.draw = () => {
    p.background(170);
    p.noStroke();
    p.fill(255);
    p.ellipse(p.mouseX, p.mouseY, 50, 50);
  };
}, 'two');