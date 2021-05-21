// Visualizes sound loudness using a ball
//
// By Jon Froehlich
// http://makeabilitylab.io/

let mic;
let x;
let y; 
let maxDiameter = 400;

function setup() {
  let cnv = createCanvas(400, 400);
  
  // https://p5js.org/reference/#/p5/userStartAudio
  // For security reasons, Chrome, iOS Safari, and other browsers force the user
  // to interact with a webpage to start media devices like microphones
  // (this is a good thing, prevents websites from unknowingly listening to us!)
  // So, after user presses mouse, mic input will begin
  cnv.mousePressed(userStartAudio);

  // See https://p5js.org/reference/#/p5.AudioIn
  mic = new p5.AudioIn(); 
  mic.start(onMicStartedSuccess, onMicStartedError);
  
  x = width / 2;
  y = height / 2;
  
  fill(200, 0, 0, 200);
  noStroke();

  maxDiameter = min(width, height);
}

function draw() {
  // background(220, 220, 220, 10);
  background(220);

  if(getAudioContext().state !== "running" ){
    textAlign(CENTER, CENTER);
    text("Click screen to begin", width/2, height/2);
    return;
  }
  
  // get current microphone level
  let micLevel = mic.getLevel(); // between 0 and 1
  
  // Spruce up the color a bit by dynamically setting the line
  // color based on the current mic value
  let redColor = micLevel * 255;
  fill(redColor, 34, 255); //set the color

  // the size of the circle proportional to mic level
  let diameter = map(micLevel, 0, 1, 5, maxDiameter);
  ellipse(x, y, diameter);
  print(micLevel, redColor);
}

function onMicStartedSuccess(){
  print("onMicStartedSuccess");
}

function onMicStartedError(event){
  print("onMicStartedError", event);
}