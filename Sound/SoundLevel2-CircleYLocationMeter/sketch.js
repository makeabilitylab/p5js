// Ball moves up from bottom of screen and animates down
// Based on: https://p5js.org/examples/sound-mic-input.html
// 
// By Jon Froehlich
// @jonfroehlich
// http://makeabilitylab.io/

let mic;
let x;
let y; 
let yGravity = 5;
let diameter = 30;

function setup() {
  let cnv = createCanvas(400, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A sound-level meter: a circle that rises higher up the canvas as the microphone gets louder and falls back down as it quiets.");
  
  // https://p5js.org/reference/#/p5/userStartAudio
  // For security reasons, Chrome, iOS Safari, and other browsers force the user
  // to interact with a webpage to start media devices like microphones
  // (this is a good thing, prevents websites from unknowingly listening to us!)
  // So, after user presses mouse, mic input will begin
  cnv.mousePressed(userStartAudio);

  // See https://p5js.org/reference/#/p5.AudioIn
  mic = new p5.AudioIn(); 
  mic.start();
  
  x = width / 2;
  y = height - diameter / 2;
  
  fill(200, 0, 0, 200);
  noStroke();
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

  // accessibility: update the text caption + screen-reader announcement
  updateMicLevelText(micLevel);

  let newYLocation = map(micLevel, 0, 1, height, 0);
  
  if(newYLocation > y){
    y += yGravity; 
  }else{
    y = newYLocation; 
  }
  
  if(y + diameter / 2 > height){
    y = height - diameter/2;
  }

  // the size of the circle proportional to mic level
  // let diameter = map(micLevel, 0, 1, 5, maxDiameter);
  ellipse(x, y, diameter);
}

// Accessibility: maps the mic level (0–1) to a coarse, human-readable label.
function levelBucket(micLevel){
  if(micLevel < 0.02) return 'silent';
  if(micLevel < 0.08) return 'quiet';
  if(micLevel < 0.2) return 'moderate';
  return 'loud';
}

let lastAnnouncedLevelBucket = '';

// Accessibility: updates the visible caption every frame and politely announces
// only when the qualitative level changes (so screen readers aren't spammed).
function updateMicLevelText(micLevel){
  const percent = round(micLevel * 100);
  const bucket = levelBucket(micLevel);
  const textEl = document.getElementById('mic-level-text');
  if(textEl){ textEl.textContent = 'Microphone level: ' + percent + '% (' + bucket + ')'; }
  if(bucket !== lastAnnouncedLevelBucket){
    const statusEl = document.getElementById('mic-level-status');
    if(statusEl){ statusEl.textContent = 'Microphone level: ' + bucket; }
    lastAnnouncedLevelBucket = bucket;
  }
}