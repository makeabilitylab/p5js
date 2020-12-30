function setup() {
  createCanvas(320, 220);
}

function draw() {
  background(220);
  if (parent.strokeColor){
    //print(parent.strokeColor.levels[0]);
    //print(parent.strokeColor.toString());
    //print(parent.strokeColor[0]);

    // I can't just straight up use the strokeColor from parent
    // I have to create a local version with this sketches renderer...

    let c = color(parent.strokeColor.levels[0],
      parent.strokeColor.levels[1],
      parent.strokeColor.levels[2],
      parent.strokeColor.levels[3]);
    stroke(c);
  }
  fill(128, 0, 128);
  ellipse(width / 2, height / 2, parent.ellipseSize);
}
