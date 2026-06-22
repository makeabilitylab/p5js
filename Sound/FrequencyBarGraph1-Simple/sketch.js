/**
 * A basic sound frequency bar graph for p5js
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/

let mic, fft;

// Accessibility: groups a frequency (Hz) into a coarse, human-readable band.
function freqBand(hz){
  if(hz < 250) return 'low';
  if(hz < 2000) return 'mid';
  if(hz < 6000) return 'high';
  return 'very high';
}

// Accessibility: finds the dominant frequency (in Hz) from an FFT spectrum
// array (amplitudes 0–255 spanning 0 Hz to the Nyquist frequency).
function getPeakFrequencyHz(spectrum){
  let maxIndex = 0, maxVal = -1;
  for(let i = 0; i < spectrum.length; i++){
    if(spectrum[i] > maxVal){ maxVal = spectrum[i]; maxIndex = i; }
  }
  return round(maxIndex * (sampleRate() / 2) / spectrum.length);
}

let lastAnnouncedFreqBand = '';

// Accessibility: updates the visible caption every frame and politely announces
// only when the dominant-frequency band changes (so screen readers aren't spammed).
function updateFreqText(spectrum){
  const hz = getPeakFrequencyHz(spectrum);
  const band = freqBand(hz);
  const textEl = document.getElementById('freq-text');
  if(textEl){ textEl.textContent = 'Dominant frequency: ' + hz + ' Hz (' + band + ')'; }
  if(band !== lastAnnouncedFreqBand){
    const statusEl = document.getElementById('freq-status');
    if(statusEl){ statusEl.textContent = 'Dominant frequency: ' + band; }
    lastAnnouncedFreqBand = band;
  }
}

// Open the mic and create the FFT analyzer that produces the frequency spectrum.
function setup() {
  createCanvas(600, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A real-time bar graph of the microphone's audio frequencies; each vertical bar is a frequency bin and taller bars mean more energy at that frequency.");
  
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

// Each frame: run an FFT on the mic, group the linear FFT bins into log-spaced
// bars (more bars at low frequencies), and draw each as a bar whose height is
// the average energy in that octave.
function draw() {
  background(100);

  if(!mic.enabled || getAudioContext().state !== 'running'){
    drawEnableMicText();
    return;
  }

  // Returns an array of amplitude values (between 0 and 255) across the frequency spectrum.
  // See: https://p5js.org/reference/#/p5.FFT/analyze 
  const spectrum = fft.analyze();
  const minFreqAmplitude = 0, maxFreqAmplitude = 255;

  // Accessibility: update the live caption from the same spectrum
  updateFreqText(spectrum);

  // Determine the total number of bars based on nyquist sampling frequency
  // See: https://en.wikipedia.org/wiki/Nyquist_rate
  const nyquistFreq = sampleRate() / 2.0;
  const numBars = floor(Math.log2(nyquistFreq));
  const freqResolution = nyquistFreq / spectrum.length;

  // Calculate spectrum bars
  let mapSpectrumBarGraphBinToValues = new Map();
  for (let i = 1; i < spectrum.length; i++) {

    // Calc the bar graph bin for that frequency
    const freqAtSpectralBin = freqResolution * i;
    const barGraphBin = floor(Math.log2(freqAtSpectralBin));

    //print(i, freqAtSpectralBin, barGraphBin, spectrum[i]);

    // Create a list of values at that frequency bin
    let valuesAtBin = [];
    if (!mapSpectrumBarGraphBinToValues.has(barGraphBin)) {
      mapSpectrumBarGraphBinToValues.set(barGraphBin, valuesAtBin);
    }

    // Add frequency intensity (loudness) to our list of values at that bin
    valuesAtBin = mapSpectrumBarGraphBinToValues.get(barGraphBin);
    const spectralIntensity = spectrum[i];
    valuesAtBin.push(spectralIntensity);
  }

  // Draw the bars
  const maxBarWidth = width / mapSpectrumBarGraphBinToValues.size;
  const xPixelBufferBetweenBars = 2;
  const barWidth = max(1, maxBarWidth - xPixelBufferBetweenBars);
  let xBar = 0;
  for (let [barGraphBin, barGraphBinValues] of mapSpectrumBarGraphBinToValues) {
    
    // Sum the list of frequency intensities at that bin
    const sumOfValuesAtBin = barGraphBinValues.reduce((a, b) => a + b)
    
    // Calc the average frequency intensities at that bin
    const avgAtBin = sumOfValuesAtBin / barGraphBinValues.length;
    
    // Draw the bar graph for that value
    const binValue = avgAtBin;
    const barHeight = map(binValue, minFreqAmplitude, maxFreqAmplitude, 0, height);
    const yBar = height - barHeight;

    rect(xBar, yBar, barWidth, barHeight);
    xBar += maxBarWidth;
  }
  
  // Draw FPS
  drawFps();
}

// Draw the current frame rate in the top-left corner.
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

// Resume the audio context on touch (browsers require a user gesture to start audio).
function touchStarted() {
  if (getAudioContext().state !== 'running') {
    getAudioContext().resume();
  }
}

// Resume the audio context on click (browsers require a user gesture to start audio).
function mouseClicked() {
  getAudioContext().resume().then(() => {
    console.log('Playback resumed successfully');
  });
}

// One-time diagnostic: log the mic object, available input devices, and sample rate.
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