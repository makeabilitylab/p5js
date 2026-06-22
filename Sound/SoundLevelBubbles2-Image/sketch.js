/**
 * A simple artistic rendering of sound levels using bubbles
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/

let mic, fft;
let bubbles = [];
let img;
const MAX_BUBBLES = 1500;
const ABS_MIN_BUBBLE_SIZE = 1;
const ABS_MAX_BUBBLE_SIZE = 400;

// Load the background image before setup() so its pixels are ready to sample.
function preload() {
  // preload() runs once
  img = loadImage('assets/SewardPark_600x400_ByJonFroehlich.jpg');
}

// Set up the mic and scatter MAX_BUBBLES across the canvas, each colored from the
// image pixel beneath it; they'll scale with the live mic level in draw().
function setup() {
  createCanvas(600, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("An artistic rendering of microphone loudness as image-filled bubbles that appear and grow larger the louder the sound.");
  
  // Gets a reference to computer's microphone
  // https://p5js.org/reference/#/p5.AudioIn
  mic = new p5.AudioIn();

  // Helpful to determine if the microphone state changes
  getAudioContext().onstatechange = function() {
    print("getAudioContext().onstatechange", getAudioContext().state);
  }

  // Start processing audio input
  // https://p5js.org/reference/#/p5.AudioIn/start
  mic.start();
  
  // Helpful for debugging
  printAudioSourceInformation();

  for (let i = 0; i < MAX_BUBBLES; i++) {
  
    const randX = random(0, width);
    const randY = random(0, height);
    const randMinSize = random(ABS_MIN_BUBBLE_SIZE, ABS_MIN_BUBBLE_SIZE + 10);
    const randMaxSize = random(randMinSize, ABS_MAX_BUBBLE_SIZE);
    //const hueToXLoc = map(randX, 0, MAX_BUBBLES, 0, width);
    const imgPixelColor = img.get(randX, randY);
    const fillColor = color(red(imgPixelColor), green(imgPixelColor), blue(imgPixelColor), 150);
    const bubble = new Bubble(randX, randY, randMinSize, randMaxSize, fillColor);
    bubbles.push(bubble);
  }
}

// Each frame: redraw the photo, then update + draw every bubble so they swell
// and shrink with the (smoothed) mic level over the image.
function draw() {
  background(50);
  background(img);

  if(!mic.enabled || getAudioContext().state !== 'running'){
    drawEnableMicText();
    return;
  }

  // Gets the amplitude of AudioIn. Accepts a smoothing value 0 - 1.0
  // See: https://p5js.org/reference/#/p5.AudioIn/getLevel
  const micLevel = mic.getLevel(0.9);

  // accessibility: update the text caption + screen-reader announcement
  updateMicLevelText(micLevel);

  for(const bubble of bubbles){
    bubble.update(micLevel);
    bubble.draw();
  }
  
  // Draw menu
  drawMenu();
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

// Draw the on-screen overlay: current frame rate and the grayscale-toggle hint.
function drawMenu(){
  // Draw fps
  push();
  const fpsLblTextSize = 10;
  textSize(fpsLblTextSize);
  const fpsLbl = nf(frameRate(), 0, 1) + " fps";
  const fpsLblWidth = textWidth(fpsLbl);
  const xFpsLbl = 4;
  let yFpsLbl = 10;

  fill(10);
  text(fpsLbl, xFpsLbl, yFpsLbl);

  fill(10, 200);
  const gKeyLbl = "Hit 'g' key to switch to grayscale";
  yFpsLbl += fpsLblTextSize + 2;
  text(gKeyLbl, xFpsLbl, yFpsLbl);

  pop();
}

// Press 'g' to toggle all bubbles between color and grayscale.
function keyPressed(){
  if(key === 'g'){
    for(const bubble of bubbles){
      bubble.drawGrayscale = !bubble.drawGrayscale;
    }
  }
}

// In 2017, Chrome and other browsers started adding additional protection to browsers
// so that media would not auto-play and browsers could not auto-start microphones or
// cameras without the users' permission. So, to get the microphone to work, the user
// must explicitly interact with the page
function drawEnableMicText(){
  push();
  
  fill(255);
  noStroke();

  const fontSize = 20;
  const instructionText = "Touch or click the screen to begin";
  textSize(fontSize);

  const strWidth = textWidth(instructionText);
  const xText = width / 2 - strWidth / 2;
  const yText = height / 2 - fontSize / 2;
  text(instructionText, xText, yText);
 
  pop();
}

// Resume the (browser-suspended) audio context on first touch so the mic starts.
function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
}

// Resume the (browser-suspended) audio context on first click so the mic starts.
function mouseClicked() {
  getAudioContext().resume().then(() => {
    console.log('Playback resumed successfully');
  });
}

// One-time diagnostic: log the mic object, available audio input devices, and
// the sampling rate (handy for debugging which microphone the browser picked).
function printAudioSourceInformation(){
  let micSamplingRate = sampleRate();
  print(mic);

  // For debugging, it's useful to print out this information
  // https://p5js.org/reference/#/p5.AudioIn/getSources
  mic.getSources(function(devices) {
    
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo
    devices.forEach(function(device) {
      print(device.kind + ": " + device.label + " id = " + device.deviceId);
    });
  });
  print("Sampling rate:", sampleRate());
}