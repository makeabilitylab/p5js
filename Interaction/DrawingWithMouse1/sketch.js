// A basic painting example with the mouse
//
// By Jon Froehlich
// http://makeabilitylab.io
// 
// See:
//  - https://medium.com/comsystoreply/introduction-to-p5-js-9a7da09f20aa
//  - https://learning.oreilly.com/library/view/make-getting-started/9781457186769/ch05.html#response


function setup() {
  createCanvas(600, 400);
  fill(200, 0, 200, 150);
  background(204);
  noStroke();
}

function draw() {
  ellipse(mouseX, mouseY, 20);
  print(mouseX, mouseY);
}

