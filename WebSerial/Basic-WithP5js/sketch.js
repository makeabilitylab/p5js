let slider;

function setup() {
  createCanvas(400, 400);
  
  slider = createSlider(0, 255, 100);
  slider.position(10, 10);
  slider.style('width', '80px');
  slider.input(onSliderValueChanged)

  // TODO:
  // add in circle that resizes with slider position
  // add in serial connectivity
}

function onSliderValueChanged(){
  console.log("Slider:", slider.value());
  
  
}

function draw() {
  background(220);
  text(slider.value(), 100, 24);
}
