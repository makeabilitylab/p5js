/**
 * A basic sound frequency bar graph for p5js
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/

let mic, fft;

// Set up the canvas, microphone, and an FFT used here only to grab the raw
// time-domain waveform buffer each frame.
function setup() {
  createCanvas(600, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A real-time waveform of the microphone's audio amplitude drawn across the canvas.");
  
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

  const numFftBins = 1024; // Defaults to 1024. Must be power of 2.
  const smoothingCoefficient = 0.8; // Defaults to 0.8
  fft = new p5.FFT(smoothingCoefficient, numFftBins);
  fft.setInput(mic);

  // Setup bar colors
  noStroke();
  fill(240);
}

// Each frame: grab the current waveform buffer (amplitude samples from -1 to +1)
// and draw it as a single connected line spanning the canvas width.
function draw() {
  background(100);

  if(!mic.enabled || getAudioContext().state !== 'running'){
    drawEnableMicText();
    return;
  }

  // accessibility: update the text caption + screen-reader announcement
  let micLevel = mic.getLevel(); // between 0 and 1
  updateMicLevelText(micLevel);

  // fft.waveform() returns an array of amplitude values (between -1.0 and +1.0) that represent a
  // snapshot of amplitude readings in a single buffer.
  // See: https://p5js.org/reference/#/p5.FFT/waveform
  let waveform = fft.waveform();
  if (waveform) {
    push();

    noFill();
    beginShape();
    stroke(255);
    strokeWeight(3);
    for (let i = 0; i < waveform.length; i++) {
      let x = map(i, 0, waveform.length, 0, width);
      let y = map(waveform[i], -1, 1, height, 0);
      vertex(x, y);
    }
    endShape();
    pop();
  }

  // Draw fps
  // drawFps();
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

// Draw the current frame rate in the top-left corner.
function drawFps(){
  // Draw fps
  push();
  const fpsLblTextSize = 8;
  textSize(fpsLblTextSize);
  const fpsLbl = nf(frameRate(), 0, 1) + " fps";
  const fpsLblWidth = textWidth(fpsLbl);
  const xFpsLbl = 4;
  const yFpsLbl = 10;

  fill(200);
  text(fpsLbl, xFpsLbl, yFpsLbl);
  pop();
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