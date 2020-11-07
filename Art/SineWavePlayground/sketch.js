let bottomColor;
function setup() {
  createCanvas(800, 400);
  colorMode(HSB);
  bottomColor = color(10, 128, 128);
}

function draw() {
  background(220);

  beginShape();
  vertex(0, height);
  fill(hue(bottomColor), 255 * 0.2, 255 * 0.7, 200);
  for (let x = 0; x < width; x++) {
    //var angle = map(x, 0, width, 0, TWO_PI);
    let angle = x * 0.1;
    // map x between 0 and width to 0 and Two Pi
    let y = map(abs(sin(angle)), 0, 1, 0, 10);

    let angle2 = x * 0.01;
    let y2 = map(sin(angle2), -1, 1, 0, 30);
    y += y2;

    let nx = map(x, 0, width, 0, 3);
    //y += 50 + 60 * noise(nx);
    vertex(x, height - y);
  }
  vertex(width, height);
  endShape();
}