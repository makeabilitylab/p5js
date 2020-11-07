function setup() {
  let canvas = createCanvas(400, 400);

  // Move the canvas so it’s inside our <div id="sketch-container">.
  canvas.parent('sketch-container');
}

function draw() {
  background(220);
  fill(220, 0, 50);
  circle(width/2, height/2, 50);
}
