/**
 * A simple time series graph of sound levels with axes
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/

let mic;

// Make room for x and y axes (tick marks and labels)
const Y_AXIS_HORIZONTAL_SPACE = 20;
const X_AXIS_VERTICAL_SPACE = 20;

let xStart = Y_AXIS_HORIZONTAL_SPACE;
let currentXPos = Y_AXIS_HORIZONTAL_SPACE;
let yStart = -1;
let yMaxHeight = -1;
let xWidth = -1;

let bgColor = null;

// Set up the canvas and microphone, reserving space for labeled x and y axes.
function setup() {
  createCanvas(600, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A scrolling time-series line charting the microphone's loudness over time, with labeled x and y axes and the newest readings on the right.");
  
  // Gets a reference to computer's microphone
  // https://p5js.org/reference/#/p5.AudioIn
  mic = new p5.AudioIn();

  // Start processing audio input
  // https://p5js.org/reference/#/p5.AudioIn/start
  mic.start();
  
  // Helpful for debugging
  printAudioSourceInformation();
  
  // Set the background
  bgColor = color(40);
  background(bgColor);
  yStart = height - X_AXIS_VERTICAL_SPACE;
  yMaxHeight = height - X_AXIS_VERTICAL_SPACE;
  xWidth = width - Y_AXIS_HORIZONTAL_SPACE;
}

// Each frame: draw one vertical line (hue mapped from loudness) at the next x
// column, scrolling left to right; redraw the axes and wipe when it reaches the
// right edge.
function draw() {

  if(!mic.enabled || getAudioContext().state !== 'running'){
    background(bgColor);
    drawEnableMicText();
    return;
  }

  // get current microphone level (between 0 and 1)
  // See: https://p5js.org/reference/#/p5.AudioIn/getLevel
  let micLevel = mic.getLevel(); // between 0 and 1

  // accessibility: update the text caption + screen-reader announcement
  updateMicLevelText(micLevel);

  if(currentXPos > width || currentXPos == xStart){
    currentXPos = xStart;
    drawAxes();
  }

  push();
  // Set the color mode to HSB, so now we set color by
  // (H, S, B, A) where H is 0-360, S = 0 - 100, B = 0 - 100, and A = 0 - 1
  // https://p5js.org/reference/#/p5/colorMode
  colorMode(HSB);
  let hue = map(micLevel, 0, 1, 320, 180);
  stroke(hue, 100, 100);
  
  const yLineHeight = micLevel * yMaxHeight;
  const yEnd = yStart - yLineHeight;
  line(currentXPos, yStart, currentXPos, yEnd);
  currentXPos++;
  pop();

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

// Clear the canvas and redraw the axes: horizontal gridlines/labels for mic
// level (y) and tick marks/labels in frame counts along the bottom (x).
function drawAxes(){
  background(bgColor);
  const micLevelIncrement = 0.2;
  const yTick = 0.2;
  const maxMicLevel = 1;
  const axesColor = color(150);
  
  // Draw y axis
  const yTickFontSize = 10;
  textSize(yTickFontSize);
  for(let micLevel = micLevelIncrement; micLevel < maxMicLevel; micLevel += micLevelIncrement){
    const yMicLevel = getYPixelValueForMicLevel(micLevel);
    const yText = yMicLevel + yTickFontSize * 0.3;
    const xText = 1;
    const micLevelText = nf(micLevel, 0, 1);
    
    noStroke();
    fill(axesColor);
    text(micLevelText, xText, yText);

    const yTickLblWidth = textWidth(micLevelText);
    noFill();
    stroke(axesColor);
    line(xStart, yMicLevel, width, yMicLevel);
  }

  // Draw x axis (in samples)
  const xTickIncrement = 100;
  const xTickStart = frameCount;
  const xTickEnd = frameCount + xWidth;
  const xTickHeight = 4;
  for(let xTickVal = xTickStart; xTickVal < xTickEnd; xTickVal += xTickIncrement){
    let xTickPixelLoc = map(xTickVal, xTickStart, xTickEnd, xStart, xStart + xWidth);
    noFill();
    stroke(axesColor);
    line(xTickPixelLoc, yStart + 1, xTickPixelLoc, yStart + xTickHeight);

    noStroke();
    fill(axesColor);
    const xTickLbl = str(xTickVal);
    const xTickLblWidth = textWidth(xTickLbl);
    text(xTickLbl, xTickPixelLoc - xTickLblWidth / 2, height - 3);
  }
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

// Convert a mic level (0-1) to its y pixel position on the chart (0 sits at the
// x-axis baseline, 1 reaches the top).
function getYPixelValueForMicLevel(micLevel){
  // The min/max mic levels are 0 and 1
  const minMicLevel = 0, maxMicLevel = 1; 
  const lineHeight = map(micLevel, minMicLevel, maxMicLevel, 0, yMaxHeight);
  const yPixelVal = yStart - lineHeight;
  return yPixelVal;
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
    drawAxes();
  }
}

// Resume the (browser-suspended) audio context on first click so the mic starts.
function mouseClicked() {
  getAudioContext().resume().then(() => {
    console.log('Playback resumed successfully');
    drawAxes();
  });
}

// One-time diagnostic: log the mic object, available audio input devices, the
// sampling rate, and any later audio-context state changes (for debugging).
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