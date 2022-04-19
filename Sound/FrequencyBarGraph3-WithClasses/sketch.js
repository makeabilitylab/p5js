/**
 * A sound frequency bar graph for p5js with axes and color
 * Uses an object called a bar to simplify drawing and animation handling
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/

let mic, fft;
let mapBinToBars = new Map();

function setup() {
  createCanvas(600, 400);

  // Gets a reference to computer's microphone
  // https://p5js.org/reference/#/p5.AudioIn
  mic = new p5.AudioIn();

  // Helpful to determine if the microphone state changes
  getAudioContext().onstatechange = function () {
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
}

function draw() {
  background(50);

  if (!mic.enabled || getAudioContext().state !== 'running') {
    drawEnableMicText();
    return;
  }

  // Returns an array of amplitude values (between 0 and 255) across the frequency spectrum.
  // See: https://p5js.org/reference/#/p5.FFT/analyze 
  const minFreqAmplitude = 0, maxFreqAmplitude = 255; 
  const spectrum = fft.analyze();

  // Determine the total number of bars based on nyquist sampling frequency
  // See: https://en.wikipedia.org/wiki/Nyquist_rate
  const nyquistFreq = sampleRate() / 2.0;
  const numBars = floor(Math.log2(nyquistFreq));
  const freqResolution = nyquistFreq / spectrum.length;

  // Calculate spectrum bars
  let mapSpectrumBarGraphBinToValues = new Map();
  const minBarGraphBin = floor(Math.log2(freqResolution));
  for (let i = 1; i < spectrum.length; i++) {

    // Calc the bar graph bin for that frequency
    const freqAtBin = freqResolution * i;
    const barGraphBin = floor(Math.log2(freqAtBin));

    //print(i, freqAtSpectralBin, barGraphBin, spectrum[i]);

    // Create a list of values at that frequency bin
    let mapFreqToFreqAmplitudes = new Map();
    if (!mapSpectrumBarGraphBinToValues.has(barGraphBin)) {
      mapSpectrumBarGraphBinToValues.set(barGraphBin, mapFreqToFreqAmplitudes);
    }

    // Add frequency intensity (loudness) to our list of values at that bin
    mapFreqToFreqAmplitudes = mapSpectrumBarGraphBinToValues.get(barGraphBin);
    const freqAmplitude = spectrum[i]; // frequency amplitude between 0 and 255
    mapFreqToFreqAmplitudes.set(freqAtBin, freqAmplitude);
  }

  const maxBarWidth = width / mapSpectrumBarGraphBinToValues.size;
  const xPixelBufferBetweenBars = 2;
  const barWidth = max(1, maxBarWidth - xPixelBufferBetweenBars);
  let xBar = 0;
  for (let [barGraphBin, mapFreqToFreqAmplitudes] of mapSpectrumBarGraphBinToValues) {
   
    if(!mapBinToBars.has(barGraphBin)){
      const hue = map(barGraphBin - minBarGraphBin, 0, mapSpectrumBarGraphBinToValues.size, 0, 360);
      const newBar = new Bar(xBar, barWidth, 0, height, barGraphBin, hue);
      mapBinToBars.set(barGraphBin, newBar);
    }

    const bar = mapBinToBars.get(barGraphBin);
    bar.update(mapFreqToFreqAmplitudes);
    bar.draw();
    xBar += maxBarWidth;
  }

}

// In 2017, Chrome and other browsers started adding additional protection to browsers
// so that media would not auto-play and browsers could not auto-start microphones or
// cameras without the users' permission. So, to get the microphone to work, the user
// must explicitly interact with the page
function drawEnableMicText() {
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

function printAudioSourceInformation() {
  let micSamplingRate = sampleRate();
  print(mic);

  // For debugging, it's useful to print out this information
  // https://p5js.org/reference/#/p5.AudioIn/getSources
  mic.getSources(function (devices) {

    // https://developer.mozilla.org/en-US/docs/Web/API/MediaDeviceInfo
    devices.forEach(function (device) {
      print(device.kind + ": " + device.label + " id = " + device.deviceId);
    });
  });
  print("Sampling rate:", sampleRate());
}

