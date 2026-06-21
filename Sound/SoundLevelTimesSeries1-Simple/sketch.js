/**
 * A basic visualization of sound level over time
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/

let mic;
let currentXPos = 0;

function setup() {
  createCanvas(600, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A scrolling time-series line charting the microphone's loudness over time, with the newest readings on the right.");
  
  // Gets a reference to computer's microphone
  // https://p5js.org/reference/#/p5.AudioIn
  mic = new p5.AudioIn();

  // Start processing audio input
  // https://p5js.org/reference/#/p5.AudioIn/start
  mic.start();
  
  // Helpful for debugging
  printAudioSourceInformation();
  background(100);
}

function draw() {

  if(!mic.enabled || getAudioContext().state !== 'running'){
    background(100);
    drawEnableMicText();
    return;
  }

  // get current microphone level (between 0 and 1)
  // See: https://p5js.org/reference/#/p5.AudioIn/getLevel
  let micLevel = mic.getLevel(); // between 0 and 1

  // accessibility: update the text caption + screen-reader announcement
  updateMicLevelText(micLevel);

  if(currentXPos > width || currentXPos == 0){
    currentXPos = 0;
    background(100);
  }

  stroke(255);
  const yStart = height;
  const yLineHeight = micLevel * height;
  const yEnd = yStart - yLineHeight;
  line(currentXPos, yStart, currentXPos, yEnd);
  currentXPos++;
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

function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
    background(100);
  }
}

function mouseClicked() {
  getAudioContext().resume().then(() => {
    console.log('Playback resumed successfully');
    background(100);
  });
}

function printAudioSourceInformation(){
  let micSamplingRate = sampleRate();
  print(mic);

  // For debugging, it's useful to print out this information
  // https://p5js.org/reference/#/p5.AudioIn/getSources
  mic.getSources(function(devices) {
    print("Your audio devices: ")
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo
    devices.forEach(function(device) {
      print("  " + device.kind + ": " + device.label + " id = " + device.deviceId);
    });
  });
  print("Sampling rate:", sampleRate());

  // Helpful to determine if the microphone state changes
  getAudioContext().onstatechange = function() {
    print("getAudioContext().onstatechange", getAudioContext().state);
  }
}