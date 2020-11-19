let slider;

function setup() {
  createCanvas(400, 400);
  
  slider = createSlider(0, 255, 100);
  slider.position(10, 10);
  slider.style('width', '80px');

  // TODO:
  // add in circle that resizes with slider position
  // add in serial connectivity
}

function draw() {
  background(220);
  
}
