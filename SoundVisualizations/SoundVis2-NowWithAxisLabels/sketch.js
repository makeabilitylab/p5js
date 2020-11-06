// This sketch shows a variety of sound visualizations including
// both waveform visualizations and freq. spectral visualizations
//
// See also:
//  - My first (simpler) prototype: https://editor.p5js.org/jonfroehlich/sketches/BWQztVwr
// 
// By Jon Froehlich
// http://makeabilitylab.io/
//
// Feel free to use this source code for inspiration or in your
// own projects. If you do, I'd love to hear about it. Email me
// at jonf@cs.uw.edu or Tweet @jonfroehlich.
//
// Uses p5.js sound library, which is a wrapper around Web Audio:
//  - https://webaudio.github.io/web-audio-api/
//
// p5.js Sound Visualization Examples
//  - https://therewasaguy.github.io/p5-music-viz/
//  - Coding Train 'Frequency Analysis with FFT' video: https://youtu.be/2O3nm0Nvbi4
//  - https://p5js.org/examples/sound-frequency-spectrum.html
//  - https://p5js.org/examples/sound-oscillator-frequency.html
//
// Multiple p5js sketches in one html doc
//  - Use instance mode: https://github.com/processing/p5.js/wiki/Global-and-instance-mode
//  - http://www.joemckaystudio.com/multisketches/
//  - https://www.youtube.com/watch?v=Su792jEauZg
//
// Web Audio Stuff
//  - https://webaudioapi.com/samples/
//  - https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API/Basic_concepts_behind_Web_Audio_API
//  - https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/createAnalyser
//
// Other things to check out:
//  - https://wavesurfer-js.org/
//  - https://smus.com/spectrogram-and-oscillator/
//  - https://github.com/ListeningToWaves/Spectrogram
//  - https://courses.ideate.cmu.edu/15-104/f2017/schedule/
//
// Ideas/Thoughts
//  - How to access both the left and right channel for audio?
//  - How to directly access the Web Audio AudioBuffer (https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer)?
//  - See soundvis.js for more TODOs/ideas

let goFullScreen = false;
let mic, fft;
let micSetupError;
let waveformBuffer = [];
let instantWaveFormVis;
let spectrumVis;
let waveformVis;
let spectrogram;
let backgroundColor;

const numFftBins = 1024;
const showLengthInSeconds = 10;

function setup() {
  let canvasWidth = 1000; // windowWidth
  let canvasHeight = 700;
  
  if(goFullScreen){
    canvasWidth = windowWidth;
    canvasHeight = windowHeight;
  }
  
  createCanvas(canvasWidth, canvasHeight);
  
  mic = new p5.AudioIn();
  mic.start();
  
  print(mic);
  
  fft = new p5.FFT(0, numFftBins);
  fft.setInput(mic);
  
  let micSamplingRate = sampleRate();
  
  backgroundColor = color(90);
  
  // split the canvas into different parts for the visualization
  let yTop = 0;
  let yHeight = height / 3;
  waveformVis = new WaveformVisualizer(0, yTop, width, yHeight, backgroundColor, showLengthInSeconds);
  yTop = waveformVis.getBottom();
  spectrogram = new Spectrogram(0, yTop, width, yHeight, backgroundColor, showLengthInSeconds);
  
  let xSplit = width / 2;
  // when we call fft.waveform(), this function returns an array of sound amplitude values 
  // (between -1.0 and +1.0). Length of this buffer is equal to bins (defaults to 1024). 
  let lengthOfOneWaveformBufferInSecs = numFftBins/micSamplingRate;
  yTop = spectrogram.getBottom();
  instantWaveFormVis = new InstantWaveformVis(0, yTop, xSplit, yHeight, backgroundColor, lengthOfOneWaveformBufferInSecs);
  spectrumVis = new SpectrumVisualizer(xSplit, yTop, width, yHeight, backgroundColor);
  
  // https://p5js.org/reference/#/p5.AudioIn/getSources
  mic.getSources(function(devices) {
    
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo
    devices.forEach(function(device) {
      console.log(device.kind + ": " + device.label +
                  " id = " + device.deviceId);
    });
  });
  
  print("Sampling rate:", sampleRate(), "Master volume:", getMasterVolume());
  noFill();
  
  //frameRate(2);
}

function audioInErrorCallback(){
  print("Error setting up the microphone input"); 
}

function mouseClicked() {
  mic.start();
  
  fft = new p5.FFT(0, numFftBins);
  fft.setInput(mic);
}

function draw() {
  background(220);
  
  let waveform = fft.waveform(); // analyze the waveform
  let spectrum = fft.analyze();
  
  instantWaveFormVis.update(waveform);
  instantWaveFormVis.draw();
  
  waveformVis.update(waveform);
  waveformVis.draw();
  
  spectrogram.update(spectrum);
  spectrogram.draw();
  
  spectrumVis.update(spectrum);
  spectrumVis.draw();  
  
  //print((waveform.length / sampleRate()) * 1000 + "ms");
  fill(255);
  text("fps: " + nfc(frameRate(), 1), 6, 15);
  
  //print(mic);
  //print(mic.getSources());
}