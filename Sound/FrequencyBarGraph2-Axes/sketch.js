/**
 * A sound frequency bar graph for p5js with axes and color
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/

let mic, fft;
let showMaxAtBinLines = false;

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
  const smoothingCoefficient = 0.8; // Defaults to 0.8
  fft = new p5.FFT(smoothingCoefficient, numFftBins);
  fft.setInput(mic);
}

function draw() {
  background(100);

  if(!mic.enabled || getAudioContext().state !== 'running'){
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

  // Draw axes
  push();
  const yGridlineIncrement = 20;
  const maxYGridLinePercent = 100;
  let yGridLinePercent = 0;
  textSize(9);
  for(let yGridLinePercent = yGridlineIncrement; yGridLinePercent < maxYGridLinePercent; yGridLinePercent += yGridlineIncrement){
    const freqIntensityAtGridLine = map(yGridLinePercent, 0, maxYGridLinePercent, minFreqAmplitude, maxFreqAmplitude);
    const yGridLinePixel = getYPixelValueForFrequencyIntensity(freqIntensityAtGridLine);
    
    stroke(120);
    strokeWeight(0.5);
    line(0, yGridLinePixel, width, yGridLinePixel);
    
    noStroke();
    fill(120);
    text(yGridLinePercent + "%", 1, yGridLinePixel - 1.5);
  }
  pop();

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
    const maxAtBin = Math.max(...barGraphBinValues);
    
    // Draw the bar graph for that value
    const yBar = getYPixelValueForFrequencyIntensity(avgAtBin);
    const barHeight = height - yBar;

    push();
    noStroke();

    // Set the color mode to HSB, so now we set color by
    // (H, S, B, A) where H is 0-360, S = 0 - 100, B = 0 - 100, and A = 0 - 1
    // https://p5js.org/reference/#/p5/colorMode
    colorMode(HSB);

    let hue = map(barGraphBin - minBarGraphBin, 0, mapSpectrumBarGraphBinToValues.size, 0, 360);
    fill(hue, 100, 80, 1);
    rect(xBar, yBar, barWidth, barHeight);

    if(showMaxAtBinLines){
      noFill();
      stroke(hue, 100, 80, 1);
      strokeWeight(1);
      const peakLine = getYPixelValueForFrequencyIntensity(maxAtBin);
      line(xBar, yLine, xBar + barWidth, yLine);
    }
    pop();

    // draw text
    push();
    textSize(10);
    fill(250);
    noStroke();
    let lbl = getMaxFreqAtBin(barGraphBin);

    lbl = nfc(lbl, 0);
    if (barGraphBin === minBarGraphBin) {
      lbl += " Hz"; // add Hz to first x label
    }

    let lblWidth = textWidth(lbl);
    let xLbl = xBar + barWidth / 2 - lblWidth / 2;
    text(lbl, xLbl, height - 2);
    pop();

    xBar += maxBarWidth;
  }
}

function getYPixelValueForFrequencyIntensity(frequencyIntensity){
  // The min/max frequency amplitudes are 0 - 255, see https://p5js.org/reference/#/p5.FFT/analyze 
  const minFreqAmplitude = 0, maxFreqAmplitude = 255; 
  return map(frequencyIntensity, minFreqAmplitude, maxFreqAmplitude, height, 0);
}

function getMaxFreqAtBin(binIndex) {
  let minFreqAtBin = pow(2, binIndex);
  let maxFreqAtBin = pow(2, binIndex + 1);
  let nyquistFreq = sampleRate() / 2.0;
  if (maxFreqAtBin > nyquistFreq) {
    maxFreqAtBin = nyquistFreq;
  }
  return maxFreqAtBin;
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