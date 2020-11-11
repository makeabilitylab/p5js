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
//  - https://therewasaguy.github.io/p5-music-viz/ (by Jason Sigal, dev of p5js sound)
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
//  - Allow user to drag and drop an mp3 into the Canvas?
//  - Add support for preloaded mp3s rather than just mic
//    - TODO: need to make sure we modify sampling rate stuff to accomodate songs with diff sampling rates...
//  - How to access both the left and right channel for audio?
//  - How to directly access the Web Audio AudioBuffer (https://developer.mozilla.org/en-US/docs/Web/API/AudioBuffer)?
//  - See soundvis.js for more TODOs/ideas

let goFullScreen = false;
let mic, fft;
let micSetupError;
let waveformBuffer = [];
let instantWaveFormVis;
let spectrumVis;
let spectrumBarGraph;
let scrollingWaveform;
let scrollingSpectrogram;
let backgroundColor;
let visualizations = [];

let song;


const numFftBins = 1024;
const showLengthInSeconds = 15;

let colorSchemeIndex = 0;

function preload(){
  song = loadSound('assets/ImogenHeap_HideAndSeek_Edited.mp3'); 
}

function setup() {

  let canvasWidth = 900; // windowWidth
  let canvasHeight = 600;
  
  // if(goFullScreen){
  //   canvasWidth = windowWidth;
  //   canvasHeight = windowHeight;
  // }
  
  canvas = createCanvas(canvasWidth, canvasHeight);

  // Move the canvas so it’s inside our <div id="sketch-container">.
  canvas.parent('sketch-container');
  
  mic = new p5.AudioIn();

  getAudioContext().onstatechange = function() {
    console.log("getAudioContext().onstatechange", getAudioContext().state);
  }

  mic.start();
  
  let micSamplingRate = sampleRate();
  print(mic);
  // https://p5js.org/reference/#/p5.AudioIn/getSources
  mic.getSources(function(devices) {
    
    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo
    devices.forEach(function(device) {
      console.log(device.kind + ": " + device.label +
                  " id = " + device.deviceId);
    });
  });
  print("Sampling rate:", sampleRate(), "Master volume:", getMasterVolume());
  
  let songSamplingRate = song.sampleRate();
  print("Song sampling rate:", songSamplingRate, "Channels:", song.channels());
  let samplingRate = songSamplingRate;
  
  fft = new p5.FFT(0, numFftBins);
  fft.setInput(mic);
  
  //comment this out if we want to play song
  //song.play();
  //fft.setInput(song);
  
  
  backgroundColor = color(90);
  
  canvasHasBeenResized();
  
  noFill();
  
  //frameRate(2); // slow down draw rate for debugging
}

function fullScreenModeChanged(src, e){
  print("fullScreenModeChanged", src, e);
  fullscreen(src.checked);
  resizeCanvas(window.innerWidth, window.innerHeight);
  canvasHasBeenResized();
}

function canvasHasBeenResized(){
  print("canvasHasBeenResized");
  noLoop();
  visualizations.length = 0; // https://stackoverflow.com/a/1234337

  // split the canvas into different parts for the visualization
  let yTop = 0;
  let yHeight = height / 3;
  scrollingWaveform = new ScrollingWaveform(0, yTop, width, yHeight, backgroundColor, showLengthInSeconds);
  yTop = scrollingWaveform.getBottom();
  scrollingSpectrogram = new Spectrogram(0, yTop, width, yHeight, backgroundColor, showLengthInSeconds);
  
  let xBottomWidth = width / 3;
  let xBottom = 0;
  
  // when we call fft.waveform(), this function returns an array of sound amplitude values 
  // (between -1.0 and +1.0). Length of this buffer is equal to bins (defaults to 1024). 
  let lengthOfOneWaveformBufferInSecs = numFftBins/sampleRate();
  yTop = scrollingSpectrogram.getBottom();
  instantWaveFormVis = new InstantWaveformVis(xBottom, yTop, xBottomWidth, yHeight, backgroundColor, lengthOfOneWaveformBufferInSecs);
  xBottom += xBottomWidth;
  spectrumVis = new SpectrumVisualizer(xBottom, yTop, xBottomWidth, yHeight, backgroundColor);
  xBottom += xBottomWidth;
  spectrumBarGraph = new SpectrumBarGraph(xBottom, yTop, xBottomWidth, yHeight, backgroundColor);
  
  // Put all visualizations into an array, which helps for setting up
  // color schemes, etc.
  visualizations.push(scrollingWaveform);
  visualizations.push(scrollingSpectrogram);
  visualizations.push(instantWaveFormVis);
  visualizations.push(spectrumVis);
  visualizations.push(spectrumBarGraph);

  loop();
}

window.onresize = function() {
  // TODO: this is almost working but doesn't seem to accomodate the sidebar.
  // we really want to measure the size of the 'sketch-container'
  print("onresize event");
  resizeCanvas(window.innerWidth, window.innerHeight);
  canvasHasBeenResized();
}

function audioInErrorCallback(){
  print("Error setting up the microphone input"); 
}

function mouseClicked() {
  //mic.start();
  
  //fft = new p5.FFT(0, numFftBins);
  //fft.setInput(mic);

  getAudioContext().resume().then(() => {
    console.log('Playback resumed successfully');
  });
}

function draw() {
  //background(220);
  
  let waveform = fft.waveform(); // analyze the waveform
  let spectrum = fft.analyze();
  
  instantWaveFormVis.update(waveform);
  instantWaveFormVis.draw();
  
  scrollingWaveform.update(waveform);
  scrollingWaveform.draw();
  
  scrollingSpectrogram.update(spectrum);
  scrollingSpectrogram.draw();
  
  spectrumBarGraph.update(spectrum);
  spectrumBarGraph.draw(); 
  
  spectrumVis.update(spectrum);
  spectrumVis.draw();  
  
  //print((waveform.length / sampleRate()) * 1000 + "ms");
  fill(255);
  text("fps: " + nfc(frameRate(), 1), 6, 15);
  
  //print(mic);
  //print(mic.getSources());
}

function keyPressed(){
  print(key); 
  if(key == 'c'){
    colorSchemeIndex++;
    
    let colorSchemes = Object.entries(COLORSCHEME)
    //print(tmp);
    
    //let colorSchemes = Object.keys(COLORSCHEME); 
    if(colorSchemeIndex >= colorSchemes.length){
      colorSchemeIndex = 0;
    }
    
    print(colorSchemes);
    print("COLORSCHEME", COLORSCHEME, 'colorSchemes[colorSchemeIndex]', colorSchemes[colorSchemeIndex]);
    print("colorSchemeIndex", colorSchemeIndex, "colorSchemes.length", colorSchemes.length);
    
    for(let vis of visualizations){
      if(vis.colorScheme){
        let colorSchemeArray = colorSchemes[colorSchemeIndex];
        //vis.colorScheme = colorSchemes[colorSchemeIndex];
        vis.colorScheme = colorSchemeArray[1];
        //vis.colorScheme = COLORSCHEME.GRAYSCALE;
        //print("Set vis", vis, " to ", colorSchemeIndex, "colorSchemes[colorSchemeIndex]", colorSchemes[colorSchemeIndex]);
      }
    }
  }
}