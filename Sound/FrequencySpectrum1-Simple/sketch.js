/**
 * A simple visualization of the frequency spectrum
 * 
 * Based on:
 * https://p5js.org/examples/sound-frequency-spectrum.html
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/

let mic, fft;

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
}

function draw() {
  background(50, 50, 50, 30);

  if(!mic.enabled || getAudioContext().state !== 'running'){
    drawEnableMicText();
    return;
  }

  let spectrum = fft.analyze();

  push();
  //noFill();
  noStroke();
  beginShape();
  vertex(0, height);
  for (i = 0; i < spectrum.length; i++) {
    vertex(i, map(spectrum[i], 0, 255, height, 0));
  }
  vertex(width, height);
  endShape();
  pop();
  
  // Draw menu
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
    background(50);
  }
}

function mouseClicked() {
  getAudioContext().resume().then(() => {
    console.log('Playback resumed successfully');
    background(50);
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