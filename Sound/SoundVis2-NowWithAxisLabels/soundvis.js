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

class Rectangle {
  constructor(x, y, width, height, backgroundColor) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.backgroundColor = backgroundColor;
  }

  getLeft() {
    return this.x;
  }

  getRight() {
    return this.x + this.width;
  }

  getTop() {
    return this.y;
  }

  getBottom() {
    return this.y + this.height;
  }

  scale(fraction) {
    this.width *= fraction;
    this.height *= fraction;
  }

  incrementHeight(yIncrement, lockAspectRatio) {
    let yIncrementFraction = yIncrement / this.height;
    this.height += yIncrement;
    if (lockAspectRatio) {
      let xIncrement = yIncrementFraction * this.width;
      this.width += xIncrement;
    }
  }

  incrementWidth(xIncrement, lockAspectRatio) {
    let xIncrementFraction = xIncrement / this.width;
    this.width += xIncrement;
    if (lockAspectRatio) {
      let yIncrement = xIncrementFraction * this.height;
      this.height += yIncrement;
    }
  }

  overlaps(r) {
    // based on https://stackoverflow.com/a/4098512
    return !(this.getRight() < r.x ||
      this.getBottom() < r.y ||
      this.x > r.getRight() ||
      this.y > r.getBottom());
  }

  contains(x, y) {
    return x >= this.x && // check within left edge
      x <= (this.x + this.width) && // check within right edge
      y >= this.y && // check within top edge
      y <= (this.y + this.height); // check within bottom edge
  }
}

// "Abstract" class extended by WaveformVisualizer, Spectrogram, etc.
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
        print("Max range: ", maxPixelRange.getAbsRange());
        this.strokeColor = color(hue, 80, 80);
      }else{
        // default to grayscale
        colorMode(RGB);
        this.strokeColor = color(255);
      }
  }

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

class Line {
  constructor(x1, y1, x2, y2) {
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
  }
}

class MinMaxRange {
  constructor(min, max) {
    this.min = min;
    this.max = max;
  }
  
  getRange(){
    return this.max - this.min; 
  }
  
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

  resetGraphicsBuffer(gfxBuffer) {
    gfxBuffer.push();
    gfxBuffer.background(this.backgroundColor);
    gfxBuffer.pop();
  }

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


  draw() {
    // draw our offscreen buffers to the screen! 
    image(this.offscreenGfxBuffer1, this.offscreenGfxBuffer1.x, this.y);
    image(this.offscreenGfxBuffer2, this.offscreenGfxBuffer2.x, this.y);

    if (this.bDrawAxes) {
      this.drawAxes();
    }
  }

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

class InstantWaveformVis extends SoundVisualizer {
  // see: https://p5js.org/reference/#/p5.FFT
  constructor(x, y, width, height, backgroundColor, lengthInSeconds) {
    super(x, y, width, height, backgroundColor, lengthInSeconds);
    this.waveform = null;
  }

  // not sure if I should pass the fft reference to InstanveWaveformVis
  // in the constructor or this waveform in update
  update(waveform) {
    // clone array by slice: https://www.samanthaming.com/tidbits/35-es6-way-to-clone-an-array/
    this.waveform = waveform.slice();
  }

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