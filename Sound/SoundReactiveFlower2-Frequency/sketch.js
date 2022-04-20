/**
 * A basic sound frequency bar graph for p5js
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/

let mic;

let flowerPetalAngle = 0;
let angleStep = 15;

const MIN_PETAL_LENGTH = 100;
const MAX_PETAL_LENGTH = 400;

let bgColorSolid = null;
let bgColorTranslucent = null;

function setup() {
  createCanvas(600, 400);
  
  // Gets a reference to computer's microphone
  // https://p5js.org/reference/#/p5.AudioIn
  mic = new p5.AudioIn();

  // Start processing audio input
  // https://p5js.org/reference/#/p5.AudioIn/start
  mic.start();
  
  // Helpful for debugging
  printAudioSourceInformation();

  const numFftBins = 64; // Defaults to 1024. Must be power of 2.
  const smoothingCoefficient = 0.9; // Defaults to 0.8
  fft = new p5.FFT(smoothingCoefficient, numFftBins);
  fft.setInput(mic);

  // frameRate(20);
  bgColorSolid = color(10);
  bgColorTranslucent = color(30, 2);
  background(bgColorSolid);
  angleMode(DEGREES); 
}

function draw() {
  //background(5, 5, 5, 1);
  background(bgColorTranslucent);

  if(!mic.enabled || getAudioContext().state !== 'running'){
    background(bgColorSolid);
    drawEnableMicText();
    return;
  }

  // get current microphone level (between 0 and 1)
  // See: https://p5js.org/reference/#/p5.AudioIn/getLevel
  const micLevel = mic.getLevel(); // between 0 and 1

  // Returns an array of amplitude values (between 0 and 255) across the frequency spectrum.
  // See: https://p5js.org/reference/#/p5.FFT/analyze 
  const spectrum = fft.analyze();
  const minFreqAmplitude = 0, maxFreqAmplitude = 255; 

  // Determine the total number of bars based on nyquist sampling frequency
  // See: https://en.wikipedia.org/wiki/Nyquist_rate
  const nyquistFreq = sampleRate() / 2.0;
  const freqResolution = nyquistFreq / spectrum.length;

  push(); // save drawing context state
  colorMode(HSB); // set color mode to HSB
  ellipseMode(CORNER); // set ellipse draw mode to 
  translate(width / 2, height / 2);
  let flowerPetalAngle = 0;
  let angleStep = 360.0 / spectrum.length;
  for (i = 1; i < spectrum.length; i++) {
    const freqAtSpectralBin = freqResolution * i;
    const freqAmplitude = spectrum[i]; // amplitude between 0 and 255

    const hue = flowerPetalAngle;
    stroke(hue, 100, 100, 0.6);
    fill(hue, 100, 100, 0.1);
    rotate(angleStep);
    const petalLength = map(freqAmplitude, 0, 255, MIN_PETAL_LENGTH, MAX_PETAL_LENGTH);
    ellipse(0, 0, petalLength, 50);

    flowerPetalAngle += angleStep;
  }
  print(angleStep);
  pop();

  drawFps();
}


function drawFps(){
  // Draw fps
  push();
  const fpsLblTextSize = 8;
  textSize(fpsLblTextSize);
  const fpsLbl = nf(frameRate(), 0, 1) + " fps";
  const fpsLblWidth = textWidth(fpsLbl);
  const xFpsLbl = 4;
  const yFpsLbl = 10;
  fill(30);
  noStroke();
  rect(xFpsLbl - 1, yFpsLbl - fpsLblTextSize, fpsLblWidth + 2, fpsLblTextSize + textDescent());

  fill(150);
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

function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
    background(bgColorSolid);
  }
}

function mouseClicked() {
  getAudioContext().resume().then(() => {
    console.log('Playback resumed successfully');
    background(bgColorSolid);
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