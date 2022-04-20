/**
 * A simple artistic rendering of sound frequency using bubbles and an image
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/

let mic, fft;
let mapFreqToBubble = new Map();
let img; 

function preload() {
  // preload() runs once
  img = loadImage('assets/YellowStone_600x400_ByJonFroehlich.jpg');
}

function setup() {
  createCanvas(600, 400);
  
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
  const smoothingCoefficient = 0.9; // Defaults to 0.8
  fft = new p5.FFT(smoothingCoefficient, numFftBins);
  fft.setInput(mic);

  
  // Determine the total number of bars based on nyquist sampling frequency
  // See: https://en.wikipedia.org/wiki/Nyquist_rate
  const nyquistFreq = sampleRate() / 2.0;
  const numBars = floor(Math.log2(nyquistFreq));
  const freqResolution = nyquistFreq / numFftBins;

  push();
  //colorMode(HSB);
  for (let i = 0; i < numFftBins; i++) {
    const freqAtBin = freqResolution * i;
    const randX = random(0, width);
    const randY = random(0, height);
    const imgPixelColor = img.get(randX, randY);
    const newColor = color(red(imgPixelColor), green(imgPixelColor), blue(imgPixelColor), 200);
    const bubble = new Bubble(randX, randY, freqAtBin, newColor);
    mapFreqToBubble.set(freqAtBin, bubble);
  }
  pop();
}

function draw() {
  background(50);

  if(!mic.enabled || getAudioContext().state !== 'running'){
    drawEnableMicText();
    return;
  }

  background(img);

  // Returns an array of amplitude values (between 0 and 255) across the frequency spectrum.
  // See: https://p5js.org/reference/#/p5.FFT/analyze 
  const spectrum = fft.analyze();
  const minFreqAmplitude = 0, maxFreqAmplitude = 255; 

  // Determine the total number of bars based on nyquist sampling frequency
  // See: https://en.wikipedia.org/wiki/Nyquist_rate
  const nyquistFreq = sampleRate() / 2.0;
  const freqResolution = nyquistFreq / spectrum.length;
 
  for (let i = 1; i < spectrum.length; i++) {

    // Calc the bar graph bin for that frequency
    const freqAtBin = freqResolution * i;
    const freqAmplitude = spectrum[i];
    if(mapFreqToBubble.has(freqAtBin)){
      const bubble = mapFreqToBubble.get(freqAtBin);
      bubble.update(freqAmplitude);
      bubble.draw();
    }
  }
  
  // Draw FPS
  drawFps();
}

function drawFps(){
  // Draw fps
  push();
  const fpsLblTextSize = 10;
  textSize(fpsLblTextSize);
  const fpsLbl = nf(frameRate(), 0, 1) + " fps";
  const fpsLblWidth = textWidth(fpsLbl);
  const xFpsLbl = 4;
  const yFpsLbl = 10;

  fill(255);
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
  }
}

function mouseClicked() {
  getAudioContext().resume().then(() => {
    console.log('Playback resumed successfully');
  });
}

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