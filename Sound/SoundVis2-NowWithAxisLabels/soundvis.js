// A set of rapidly prototyped sound visualizations
//
// By Jon Froehlich
// http://makeabilitylab.io/
// 
// Feel free to use this source code for inspiration or in your
// own projects. If you do, I'd love to hear about it. Email me
// at jonf@cs.uw.edu or Tweet @jonfroehlich.
//
//  - why isn't this working in fullscreen in Chrome? Permissions issue?
//    -- https://developers.google.com/web/updates/2017/09/autoplay-policy-changes#webaudio
//    -- https://github.com/processing/processing-sound/issues/48
//  - [done] add axis labels to spectrogram
//  - [done] add x axis labels to scrolling waveform
//  - add y axis labels to scrolling waveform?
//  - add axis labels to spectrum? 
//  - add new bar graph fft (with log scale x axis so we have more bars for lower freq?)
//  - play around with different scales for fft (linear vs. log)
//     -- add log scale to spectrogram
//     -- add log scale to spectrumvis
//  - [done] add background color to Rectangle class
//  - add color? (right now, it's grayscale only)
//  - [done] if getNumSamplesInOnePixel() < 1024, need to update code
//     -- draw lines or rects for spectrogram to fill x
//  - [done] add in peak lines and average lines to spectrum vis (see GoldWave)
//  - should peak line refresh every N seconds in spectrum vis?

// ---------------------------------------------------------------------------
// This file defines several self-contained sound visualizers, each fed by
// p5.sound's waveform/FFT data (wired up in sketch.js):
//   Rectangle           - geometry base class (position, size, hit tests)
//   SoundVisualizer     - base for time-scrolling vis: sample<->pixel<->time math
//   WaveformVisualizer  - scrolling amplitude waveform (min/max per x pixel)
//   Line                - tiny x1,y1,x2,y2 segment holder
//   MinMaxRange         - tiny min/max pair (used to track value ranges)
//   Spectrogram         - scrolling time x frequency heat map
//   SpectrumVisualizer  - live frequency spectrum with peak + average lines
//   InstantWaveformVis  - non-scrolling snapshot of the current waveform
//
// This is the "NowWithAxisLabels" version: SoundVisualizer adds x-axis time
// ticks and the Spectrogram adds y-axis frequency (Hz) ticks. See
// SoundVis4-ImprovedPerformance for a faster offscreen-buffer scrolling version.
// ---------------------------------------------------------------------------

class Rectangle {
  constructor(x, y, width, height, backgroundColor) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
  }

  /**
   * Returns the left side of the rectangle
   * @return {Number} the left side of the rectangle
   */
  getLeft() {
    return this.x;
  }

  /**
   * Returns the right side of the rectangle
   * @return {Number} the right side of the rectangle
   */
  getRight() {
    return this.x + this.width;
  }

  /**
   * Returns the top of the rectangle
   * @return {Number} the top of the rectangle
   */
  getTop() {
    return this.y;
  }

  /**
   * Returns the bottom of the rectangle
   * @return {Number} the bottom of the rectangle
   */
  getBottom() {
    return this.y + this.height;
  }

  /**
   * Scales the rectangle width and height by the given fraction
   * @param {Number} fraction the fraction used for scaling
   */
  scale(fraction) {
    this.width *= fraction;
    this.height *= fraction;
  }

  /**
   * Increments the height by the given pixel amount. If lockAspectRatio
   * is true, also scales the width a proportional amount
   *
   * @param {Number} yIncrement the amount of pixels to increment height
   * @param {Number} lockAspectRatio if true, also increments width proportional amount
   */
  incrementHeight(yIncrement, lockAspectRatio) {
    let yIncrementFraction = yIncrement / this.height;
    this.height += yIncrement;
    if (lockAspectRatio) {
      let xIncrement = yIncrementFraction * this.width;
      this.width += xIncrement;
    }
  }

  /**
   * Increments the width by the given pixel amount. If lockAspectRatio
   * is true, also scales the height a proportional amount
   *
   * @param {Number} xIncrement the amount of pixels to increment width
   * @param {Number} lockAspectRatio if true, also increments height proportional amount
   */
  incrementWidth(xIncrement, lockAspectRatio) {
    let xIncrementFraction = xIncrement / this.width;
    this.width += xIncrement;
    if (lockAspectRatio) {
      let yIncrement = xIncrementFraction * this.height;
      this.height += yIncrement;
    }
  }

  /**
   * Returns true if this rectangle overlaps the rectangle r
   *
   * @param {Rectangle} r the rectangle to check for overlap
   * @return {boolean} true if there is overlap
   */
  overlaps(r) {
    // based on https://stackoverflow.com/a/4098512
    return !(this.getRight() < r.x ||
      this.getBottom() < r.y ||
      this.x > r.getRight() ||
      this.y > r.getBottom());
  }

  /**
   * Returns true if this rectangle contains the point x,y
   *
   * @param {Number} x the x position of the point
   * @param {Number} y the y position of the point
   * @return {boolean} true if this rectangle contains the point
   */
  contains(x, y) {
    return x >= this.x && // check within left edge
      x <= (this.x + this.width) && // check within right edge
      y >= this.y && // check within top edge
      y <= (this.y + this.height); // check within bottom edge
  }
}

// "Abstract" base class for the time-scrolling visualizers (extended by
// WaveformVisualizer, Spectrogram, etc.). Holds the audio timeline (sampling
// rate, how many seconds fit on screen) and the conversions between sample
// index <-> x pixel <-> time in seconds that subclasses rely on.
class SoundVisualizer extends Rectangle {
  constructor(x, y, width, height, backgroundColor, lengthInSeconds) {
    super(x, y, width, height, backgroundColor);

    this.samplingRate = sampleRate();
    this.lengthInSeconds = lengthInSeconds;

    print("One x pixel = " + this.getNumSamplesInOnePixel() + " values");
    print("One x pixel = " + this.getNumSecondsInOnePixel() + " secs");
    print("Waveform buffer segment (1024) is " + nfc((1024 / this.samplingRate), 2) + " secs");

    this.bDrawAxes = true;

    this.xTicks = [];
    this.tickLength = 3; // in pixels
    this.axisLabelsTextSize = 8;
    let numXAxisTicks = 4;
    this.xTickEveryNSec = lengthInSeconds / numXAxisTicks;
    for (let xTickInSecs = 0; xTickInSecs < lengthInSeconds; xTickInSecs += this.xTickEveryNSec) {
      this.xTicks.push(xTickInSecs);
    }

    this.hasUpdateEverBeenCalled = false;
    this.bufferIndex = 0;
  }

  // Advance the running sample index (which drives the scroll). Subclasses call
  // super.update() after drawing.
  update(buffer) {
    if (this.hasUpdateEverBeenCalled == false) {
      // Helpful to understand length of fft buffer for debugging purposes
      let bufferLengthInXPixels = this.convertBufferLengthToXPixels(buffer.length);
      print("The buffer segment is " + buffer.length + " samples, which is " +
        nfc((buffer.length / this.samplingRate), 2) + " secs and " +
        nfc(bufferLengthInXPixels, 2) + " x pixels");
      this.hasUpdateEverBeenCalled = true;
    }

    this.bufferIndex += buffer.length;
  }

  // Conversion helpers between the three coordinate spaces this vis juggles:
  // sample index <-> x pixel <-> time in seconds (plus the on-screen min/max of
  // each as the timeline scrolls). The subclasses use these to map audio data
  // onto the canvas.
  getXAxisLengthInSeconds() {
    return this.lengthInSeconds;
  }

  getXAxisLengthInSamples() {
    return this.lengthInSeconds * this.samplingRate;
  }

  getNumSamplesInOnePixel() {
    return int(this.getXAxisLengthInSamples() / this.width);
  }

  getNumSecondsInOnePixel() {
    return this.getXAxisLengthInSeconds() / this.width;
  }

  getMinXAsTimeInSecs() {
    return this.convertBufferIndexToTime(this.getMinXAsSampleIndex());
  }

  getMaxXAsTimeInSecs() {
    return this.convertBufferIndexToTime(this.getMaxXAsSampleIndex());
  }

  getMinXAsSampleIndex() {
    if (this.bufferIndex < this.getXAxisLengthInSamples()) {
      return 0;
    }
    return this.bufferIndex - this.getXAxisLengthInSamples();
  }

  getMaxXAsSampleIndex() {
    if (this.bufferIndex < this.getXAxisLengthInSamples()) {
      return this.getXAxisLengthInSamples();
    }
    return this.bufferIndex;
  }

  convertBufferLengthToXPixels(bufferLength) {
    return (bufferLength / this.getXAxisLengthInSamples()) * this.width;
  }

  convertBufferIndexToTime(bufferIndex) {
    return bufferIndex / this.samplingRate;
  }

  getXPixelFromSampleIndex(sampleIndex) {
    let xVal = map(sampleIndex, this.getMinXAsSampleIndex(), this.getMaxXAsSampleIndex(), this.x, this.width);
    return xVal;
  }

  getXPixelFromTimeInSecs(timeInSecs) {
    let xVal = map(timeInSecs, this.getMinXAsTimeInSecs(), this.getMaxXAsTimeInSecs(), this.x, this.width);
    //print("xVal", xVal, "timeInSecs", timeInSecs, "minX", this.getMinXAsTimeInSecs(), "maxX", this.getMaxXAsTimeInSecs());
    return xVal;
  }

  // Draw the time (seconds) ticks and labels along the bottom x-axis, recycling
  // ticks that scroll off the left edge so the labels keep advancing.
  drawXAxisTicksAndLabels() {
    push();

    // ** Draw x axis ticks and labels **
    let xTickBufferInPixels = 15;
    textSize(this.axisLabelsTextSize);
    for (let i = this.xTicks.length - 1; i >= 0; i--) {
      let xTickInSecs = this.xTicks[i];
      let xTick = this.getXPixelFromTimeInSecs(xTickInSecs);
      let y1 = this.getBottom() - this.tickLength;
      let y2 = this.getBottom();
      //print(xTick, y1, xTick, y2);

      stroke(220);
      noFill();
      line(xTick, y1, xTick, y2);

      noStroke();
      fill(220);
      let xTickStr = xTickInSecs + "s";
      let xTickStrWidth = textWidth(xTickStr);
      let xTickStrPos = xTick - xTickStrWidth / 2;
      text(xTickStr, xTickStrPos, this.getBottom() - (this.tickLength + 2));

      if (xTick < this.x) {
        let removedXTick = this.xTicks.splice(i, 1);
        this.xTicks.push(this.xTicks[this.xTicks.length - 1] + this.xTickEveryNSec);
      }
    }

    pop();
  }
}

// Scrolling amplitude waveform. To draw efficiently at one column per x pixel,
// it accumulates incoming samples and, for each x pixel's worth of samples,
// stores just the min and max value (drawn as a vertical line) rather than
// every sample. Old columns scroll off the left edge.
class WaveformVisualizer extends SoundVisualizer {
  // see: https://p5js.org/reference/#/p5.FFT
  constructor(x, y, width, height, backgroundColor, lengthInSeconds) {
    super(x, y, width, height, backgroundColor, lengthInSeconds);
    this.waveformBuffer = [];
    this.waveformDraw = [];

    this.colorScheme = COLORSCHEME.GRAYSCALE;
    this.strokeColor = color(255);
    this.setupColors();
  }

  // Set the stroke color based on the current color scheme (RAINBOW maps the
  // loudest on-screen column's amplitude range to a hue).
  setupColors(){
    if(this.colorScheme == COLORSCHEME.CUSTOM){
      // no op; in this mode, we let user select color via this.strokeColor 
    }else if(this.colorScheme == COLORSCHEME.RAINBOW){
        colorMode(HSB);
        let maxPixelRange = new MinMaxRange(0, 0);
        for (let minMaxRange of this.waveformDraw) {
          //print(maxPixelRange, minMaxRange);
          if(maxPixelRange.getAbsRange() < minMaxRange.getAbsRange()){
              maxPixelRange = minMaxRange;
          }
        }
        //print(maxPixelRange);
        //et maxPixelRange = minMaxRange.max - minMaxRange.min;
        let hue = map(maxPixelRange.getAbsRange(), 0, this.height, 0, 360);
        this.strokeColor = color(hue, 80, 80);
      }else{
        // default to grayscale
        colorMode(RGB);
        this.strokeColor = color(255);
      }
  }

  // Append the new samples and, for every full x pixel's worth, store the
  // min/max amplitude as one column; drop columns that scroll past the width.
  update(waveform) {

    // concat returns a concatenation between the two arrays
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/concat
    this.waveformBuffer = this.waveformBuffer.concat(waveform);
    let numSamplesInOnePixel = this.getNumSamplesInOnePixel();
    //print("waveform.length", waveform.length, "samples and", waveform.length / this.samplingRate, "secs");
    //print("!! waveform.length", waveform.length, "waveformBuffer.length", this.waveformBuffer.length, " numSamplesInOnePixel", numSamplesInOnePixel);

    // the overall idea here is that we can only draw at the x pixels
    // so we take all of the samples for a particular x pixel and find the
    // min and max value in the waveform buffer corresponding to that x pixel
    // and then use that to draw a line
    while (this.waveformBuffer.length >= numSamplesInOnePixel) {
      let tmpBuffer = this.waveformBuffer.splice(0, numSamplesInOnePixel);

      let maxY = max(tmpBuffer);
      let maxYPixel = map(maxY, -1, 1, this.getBottom(), this.y);
      let minY = min(tmpBuffer);
      let minYPixel = map(minY, -1, 1, this.getBottom(), this.y);
      let minMaxRangePixelRange = new MinMaxRange(minYPixel, maxYPixel);
      //print(newLine);
      this.waveformDraw.push(minMaxRangePixelRange);

      if (this.waveformDraw.length > this.width) {
        let removedLine = this.waveformDraw.shift();
        //print("Removed line:", removedLine);
      }
    }

    super.update(waveform);
  }

  // Draw each stored column as a vertical min->max line over the background,
  // then overlay the x-axis time ticks/labels.
  draw() {
    if (this.waveformDraw) {
      push();

      noStroke();
      fill(this.backgroundColor);
      rect(this.x, this.y, this.width, this.height);

      //noFill();
      //stroke(255);
      strokeWeight(1);
      this.setupColors();
      stroke(this.strokeColor);
      
      beginShape();
      let xVal = this.x;
      for (let minMaxRange of this.waveformDraw) {
        vertex(xVal, minMaxRange.min);
        vertex(xVal, minMaxRange.max);
        
        xVal++;
      }
      endShape();

      pop();
    }

    this.drawXAxisTicksAndLabels();
  }
}

// Tiny helper holding a line segment's two endpoints.
class Line {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
}

// Tiny helper holding a min/max pair (used to track value ranges).
class MinMaxRange {
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }

  // The signed span (max - min).
  getRange(){
    return this.max - this.min;
  }

  // The unsigned span (absolute value of the range).
  getAbsRange(){
    return abs(this.getRange());
  }
}

const COLORSCHEME = {
  GRAYSCALE: 'grayscale',
  RAINBOW: 'rainbow',
  PURPLEICE: 'purpleice',
  CUSTOM: 'custom'
}

// Scrolling spectrogram: time on the x-axis, frequency on the y-axis, with
// brightness encoding the energy at each frequency. Uses two ping-ponging
// offscreen buffers for performance.
class Spectrogram extends SoundVisualizer {
  constructor(x, y, width, height, backgroundColor, lengthInSeconds) {
    super(x, y, width, height, backgroundColor, lengthInSeconds);

    // the spectrogram works by drawing on offscreen graphics
    // which is crucial to performance! the idea here is that we
    // draw each spectrum buffer once and only once to the offscreen
    // buffer and then just "paint" this image to the screen (which is fast)
    // we need two offscreen buffers to support our scrolling effect.
    this.offscreenGfxBuffer1 = createGraphics(this.width, this.height);
    this.offscreenGfxBuffer2 = createGraphics(this.width, this.height);

    this.offscreenGfxBuffer1.x = 0;
    this.offscreenGfxBuffer2.x = this.offscreenGfxBuffer1.width;

    this.resetGraphicsBuffer(this.offscreenGfxBuffer1);
    this.resetGraphicsBuffer(this.offscreenGfxBuffer2);
    this.spectrum = null;
    
    this.colorScheme = COLORSCHEME.GRAYSCALE;
  }

  // Clear an offscreen buffer to the background color.
  resetGraphicsBuffer(gfxBuffer) {
    gfxBuffer.push();
    gfxBuffer.background(this.backgroundColor);
    gfxBuffer.pop();
  }

  // Draw this frame's spectrum as one vertical column (frequency up the y-axis,
  // energy as brightness) onto the current offscreen buffer for the scroll.
  update(spectrum) {

    this.spectrum = spectrum; // grab cur ref to spectrum

    // convert buffer index to x pixel position in offscreen buffer
    let xBufferVal = map(this.bufferIndex, 0, this.getXAxisLengthInSamples(), 0, this.width);
    let xVal = xBufferVal - (int(xBufferVal / this.width)) * this.width;
    // print("xVal", xVal, "xVal/width", nfc((xVal / this.width),2), 
    //       "gfx", int(xVal / this.width) % 2, "newX", xBufferVal - (int(xBufferVal / this.width))*this.width);

    let selectOffscreenBuffer = int(xBufferVal / this.width) % 2;
    //print("selectOffscreenBuffer", selectOffscreenBuffer);
    let offScreenBuffer = this.offscreenGfxBuffer1;

    // TODO: add in a clear for the offscreen background?
    if (xBufferVal > this.width) {
      if (selectOffscreenBuffer == 0) {
        offScreenBuffer = this.offscreenGfxBuffer1;
        this.offscreenGfxBuffer1.x = this.width - xVal;
        this.offscreenGfxBuffer2.x = this.width - (xVal + this.width);
      } else {
        offScreenBuffer = this.offscreenGfxBuffer2;
        this.offscreenGfxBuffer1.x = this.width - (xVal + this.width);
        this.offscreenGfxBuffer2.x = this.width - xVal;

        //print("this.offscreenGfxBuffer1.x", this.offscreenGfxBuffer1.x, "this.offscreenGfxBuffer2.x", this.offscreenGfxBuffer2.x); 
      }
    }

    offScreenBuffer.push();
    offScreenBuffer.strokeWeight(1);
    offScreenBuffer.noFill();

    if(this.colorScheme == COLORSCHEME.RAINBOW ||
       this.colorScheme == COLORSCHEME.PURPLEICE){
      offScreenBuffer.colorMode(HSB);
    }else{
      offScreenBuffer.colorMode(RGB);
    }
    
    let bufferLengthInXPixels = this.convertBufferLengthToXPixels(spectrum.length);
    for (let i = 0; i < spectrum.length; i++) {
      let y = map(i, 0, spectrum.length, this.height, 0);
      //let col = map(spectrum[i], 0, 255, blue(this.backgroundColor), 255);
      let col;
      if(this.colorScheme == COLORSCHEME.RAINBOW){
        let hue = map(spectrum[i], 0, 255, 0, 360);
        col = offScreenBuffer.color(hue, 80, 80);
      }else if(this.colorScheme == COLORSCHEME.PURPLEICE){
        let hue = map(spectrum[i], 0, 255, 240, 360);
        col = offScreenBuffer.color(hue, 80, 90);
      }else{
        col = map(spectrum[i], 0, 255, blue(this.backgroundColor), 255);
      }
      offScreenBuffer.stroke(col);

      // TODO: if spectrum.length > this.height, draw rect instead of point or line
      if (bufferLengthInXPixels <= 1) {
        offScreenBuffer.point(xVal, y);
      } else {
        //TODO: this works *most* of the time unless the x1 and x2 values
        //fall exactly on the crease between the two offscreen buffers
        offScreenBuffer.line(xVal, y, xVal + bufferLengthInXPixels, y);
      }
    }
    //print(spectrum);

    offScreenBuffer.pop();

    //this.bufferIndex += spectrum.length;
    super.update(spectrum);
    //noLoop();
  }


  // Blit the two offscreen buffers to the screen, then overlay the axes.
  draw() {
    // draw our offscreen buffers to the screen!
    image(this.offscreenGfxBuffer1, this.offscreenGfxBuffer1.x, this.y);
    image(this.offscreenGfxBuffer2, this.offscreenGfxBuffer2.x, this.y);

    if (this.bDrawAxes) {
      this.drawAxes();
    }
  }

  // Draw the frequency (Hz) ticks/labels up the y-axis and the time ticks along
  // the x-axis.
  drawAxes() {
    if (this.spectrum) {
      push();

      // ** Draw y axis ticks and labels **

      // The frequency resolution of each spectral line is equal to the 
      // Sampling Rate divided by the FFT size
      // And according to the p5js docs, actual size of the FFT buffer is twice the 
      // number of bins: https://p5js.org/reference/#/p5.FFT. Hmm, confusing! :)
      let fftBufferSize = (2 * this.spectrum.length);
      let nyquistFreq = this.samplingRate / 2.0;
      let freqResolution = nyquistFreq / this.spectrum.length;
      let freqRangeOfEachYPixel = nyquistFreq / this.height;
      let yTickFreqInPixels = 50;

      noFill();
      textSize(this.axisLabelsTextSize);
      //print("this.getTop()", this.getTop(), "this.getBottom()", this.getBottom());
      for (let yTick = this.getTop(); yTick <= this.getBottom(); yTick += yTickFreqInPixels) {
        stroke(220);
        let yVal = this.getBottom() - yTick;
        let yFreqVal = yVal * freqRangeOfEachYPixel;
        line(this.x, yTick, this.x + this.tickLength, yTick);
        //print(this.x, yTick, this.x + tickLength, yTick);

        noStroke();
        fill(220);
        let xText = this.x + this.tickLength + 3;
        text(nfc(yFreqVal, 1) + " Hz", xText, yTick + 2.5);
        //print(yVal, yFreqVal);
      }
      pop();

      this.drawXAxisTicksAndLabels();
    }

    // print(nfc(this.convertBufferIndexToTime(this.bufferIndex), 1) + 
    //       " secs " + this.convertBufferIndexToXPixel(this.bufferIndex));

    let minXAsTime = this.getMinXAsTimeInSecs();
    let maxXAsTime = this.getMaxXAsTimeInSecs();
    //print("minXAsTime", minXAsTime, "maxXAsTime", maxXAsTime, "length", (maxXAsTime - minXAsTime));
  }
}

// Live frequency spectrum drawn as a continuous filled curve, with a held
// "peak" line that slowly falls and a rolling-average line (like the spectrum
// displays in audio editors such as GoldWave/Audacity).
class SpectrumVisualizer extends Rectangle {
  // see: https://p5js.org/reference/#/p5.FFT
  constructor(x, y, width, height, backgroundColor) {
    super(x, y, width, height, backgroundColor);
    this.spectrum = null;
    this.samplingRate = sampleRate();

    this.spectrumPeaks = null;

    // in secs, amount of spectrum history to save
    // this is used to calculate the average spectrum
    this.spectrumHistoryTime = 1; 
    this.spectrumHistory = [];
    this.spectrumAvg = [];
    
    this.isStrokeOn = true;
    this.isFillOn = true;
    
    this.colorScheme = COLORSCHEME.GRAYSCALE;
    this.strokeColor = color(255);
    this.setupColors();
  }

  // Set the stroke/fill colors for the spectrum, peaks, and average lines based
  // on the current color scheme.
  setupColors(){
    if(this.colorScheme == COLORSCHEME.CUSTOM){
      // no op; in this mode, we let user select color via this.strokeColor
    }
    else if(this.colorScheme == COLORSCHEME.PURPLEICE){
      this.spectrumStrokeColor = color(180);
      this.spectrumPeaksStrokeColor = color(0, 0, 180);
      this.spectrumAvgStrokeColor = color(220, 0, 220);

      this.spectrumFillColor = color(red(this.spectrumStrokeColor), green(this.spectrumStrokeColor), 
                                     blue(this.spectrumStrokeColor), 140);
      this.spectrumPeaksFillColor = color(red(this.spectrumPeaksStrokeColor), green(this.spectrumPeaksStrokeColor), 
                                     blue(this.spectrumPeaksStrokeColor), 200);
      this.spectrumAvgFillColor = color(red(this.spectrumAvgStrokeColor), green(this.spectrumAvgStrokeColor), 
                                     blue(this.spectrumAvgStrokeColor), 128);
    }else{
      //default to grayscale
      this.spectrumStrokeColor = color(225);
      this.spectrumPeaksStrokeColor = color(50);
      this.spectrumAvgStrokeColor = color(160);

      this.spectrumFillColor = color(red(this.spectrumStrokeColor), green(this.spectrumStrokeColor), 
                                     blue(this.spectrumStrokeColor), 50);
      this.spectrumPeaksFillColor = color(red(this.spectrumPeaksStrokeColor), green(this.spectrumPeaksStrokeColor), 
                                     blue(this.spectrumPeaksStrokeColor), 128);
      this.spectrumAvgFillColor = color(red(this.spectrumAvgStrokeColor), green(this.spectrumAvgStrokeColor), 
                                     blue(this.spectrumAvgStrokeColor), 128);
    }
  }

  // Store the latest spectrum and update the rolling average (over the last
  // spectrumHistoryTime seconds) and the held peak values.
  update(spectrum) {
    this.spectrum = spectrum;

    let bufferLengthInSecs = (spectrum.length / this.samplingRate);
    let numOfHistoricalRecords = int(this.spectrumHistoryTime / bufferLengthInSecs);
    this.spectrumHistory.push(this.spectrum);

    //print("Saving", numOfHistoricalRecords, " records");

    if (this.spectrumHistory.length > numOfHistoricalRecords) {
      let deleteCount = this.spectrumHistory.length - numOfHistoricalRecords;
      let removedRecords = this.spectrumHistory.splice(0, deleteCount);
    }

    // calculate average for each index
    // See: https://stackoverflow.com/a/32141173

    let calculateVerticalSum = (r, a) => r.map((b, i) => a[i] + b);
    let spectrumSums = this.spectrumHistory.reduce(calculateVerticalSum);

    // This is the same code as above but doing it the more "traditional way"
    // let spectrumSums = new Array(this.spectrum.length).fill(0);;
    // for(let col = 0; col < this.spectrum.length; col++){
    //   for(let row = 0; row < this.spectrumHistory.length; row++){
    //     spectrumSums[col] += this.spectrumHistory[row][col];
    //   }
    // }

    for (let i = 0; i < spectrumSums.length; i++) {
      this.spectrumAvg[i] = spectrumSums[i] / numOfHistoricalRecords;
    }

    if (this.spectrumPeaks == null) {
      this.spectrumPeaks = this.spectrum;
    }

    for (let i = 0; i < this.spectrumPeaks.length; i++) {
      if (this.spectrumPeaks[i] < this.spectrum[i]) {
        this.spectrumPeaks[i] = this.spectrum[i];
      }
    }
  }

  // Draw the peak, average, and current spectrum as three filled curves.
  draw() {
    if (this.spectrum) {
      push();

      // draw background
      noStroke();
      fill(this.backgroundColor);
      rect(this.x, this.y, this.width, this.height);

      // draw spectrums
      this.drawSpectrum(this.spectrumPeaks, this.spectrumPeaksFillColor, this.spectrumPeaksStrokeColor);
      this.drawSpectrum(this.spectrumAvg, this.spectrumAvgFillColor, this.spectrumAvgFillColor);
      this.drawSpectrum(this.spectrum, this.spectrumFillColor, this.spectrumStrokeColor);
      pop();

      this.drawAxes();
    }
  }

  // Draw one spectrum array as a filled curve spanning the full width, with the
  // given fill/stroke colors (honoring isFillOn/isStrokeOn).
  drawSpectrum(spectrum, fillColor, strokeColor) {
    //noFill();
    if(this.isFillOn && fillColor){
      fill(fillColor);
    }else{
      noFill(); 
    }
    
    if(this.isStrokeOn && strokeColor){
      stroke(strokeColor);
    }else{
      noStroke(); 
    }
    
    beginShape();
    vertex(this.getLeft(), this.getBottom());
    for (let i = 0; i < spectrum.length; i++) {
      let x = map(i, 0, spectrum.length, this.x, this.getRight());
      let y = map(spectrum[i], 0, 255, this.getBottom(), this.y);
      vertex(x, y);
    }
    vertex(this.getRight(), this.getBottom());
    endShape();
  }

  // Axis drawing for the spectrum (work-in-progress; not yet finished).
  drawAxes() {
    // draw x axis
    // TODO: finish this

    // The frequency resolution of each spectral line is equal to the 
    // Sampling Rate divided by the FFT size
    let nyQuistFreq = this.samplingRate / 2.0;
    let freqResolution = nyQuistFreq / this.spectrum.length;
    //print(freqResolution);
  }
}

// Non-scrolling waveform: draws just the current audio buffer as a single
// snapshot each frame, rather than scrolling history.
class InstantWaveformVis extends SoundVisualizer {
  // see: https://p5js.org/reference/#/p5.FFT
  constructor(x, y, width, height, backgroundColor, lengthInSeconds) {
    super(x, y, width, height, backgroundColor, lengthInSeconds);
    this.waveform = null;
  }

  // Snapshot the current waveform buffer; unlike the scrolling vis, no history
  // is kept.
  // not sure if I should pass the fft reference to InstanveWaveformVis
  // in the constructor or this waveform in update
  update(waveform) {
    // clone array by slice: https://www.samanthaming.com/tidbits/35-es6-way-to-clone-an-array/
    this.waveform = waveform.slice();
  }

  // Draw the snapshotted waveform as a single connected curve over the
  // background.
  draw() {
    if (this.waveform) {
      push();

      noStroke();
      fill(this.backgroundColor);
      rect(this.x, this.y, this.width, this.height);

      noFill();
      beginShape();
      stroke(255);
      strokeWeight(3);
      for (let i = 0; i < this.waveform.length; i++) {
        let x = map(i, 0, this.waveform.length, this.x, this.width);
        let y = map(this.waveform[i], -1, 1, this.getBottom(), this.y);
        vertex(x, y);
      }
      endShape();
      pop();
    }
  }
}