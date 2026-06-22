// A set of rapidly prototyped sound visualizations
//
// By Jon Froehlich
// http://makeabilitylab.io/
// 
// Feel free to use this source code for inspiration or in your
// own projects. If you do, I'd love to hear about it. Email me
// at jonf@cs.uw.edu or Tweet @jonfroehlich.
//
//  - add axis labels
//  - add average line to fft
//  - play around with different scales for fft (linear vs. log)
//  - [done] add background color to Rectangle class
//  - add color? (right now, it's grayscale only)
//  - if getNumSamplesInOnePixel() < 1024, need to update code
//     -- draw lines or rects for spectrogram to fill x

// ---------------------------------------------------------------------------
// This file defines several self-contained sound visualizers, each fed by
// p5.sound's waveform/FFT data (wired up in sketch.js):
//   Rectangle           - geometry base class (position, size, hit tests)
//   SoundVisualizer     - base for time-scrolling vis: sample<->pixel<->time math
//   WaveformVisualizer  - scrolling amplitude waveform (min/max per x pixel)
//   Line                - tiny x1,y1,x2,y2 holder
//   MinMaxRange         - tiny min/max value pair
//   Spectrogram         - scrolling time x frequency heat map
//   SpectrumVisualizer  - live frequency spectrum curve
//   InstantWaveformVis  - non-scrolling snapshot of the current waveform
//
// This is the first (simpler) prototype; see SoundVis4-ImprovedPerformance for
// a faster, more featureful version of the same class family.
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
class SoundVisualizer extends Rectangle{
  constructor(x, y, width, height, backgroundColor, lengthInSeconds) {
    super(x, y, width, height, backgroundColor);

    this.samplingRate = sampleRate();
    this.lengthInSeconds = lengthInSeconds;

    print("One x pixel = " + this.getNumSamplesInOnePixel() + " values");
    print("One x pixel = " + this.getNumSecondsInOnePixel() + " secs");
    print("Waveform buffer segment (1024) is " + nfc((1024/this.samplingRate),2) + " secs");
  }

  // Conversion helpers between the coordinate spaces this vis juggles:
  // x-axis length expressed in seconds vs. samples, and how many samples/seconds
  // map onto a single x pixel.
  getXAxisLengthInSeconds() {
    return this.lengthInSeconds;
  }

  getXAxisLengthInSamples() {
    return this.lengthInSeconds * this.samplingRate;
  }

  getNumSamplesInOnePixel() {
    return int(this.getXAxisLengthInSamples() / width);
  }

  getNumSecondsInOnePixel() {
    return this.getXAxisLengthInSeconds() / width;
  }
}

// Scrolling amplitude waveform. Accumulates incoming samples and, for each
// x pixel, collapses the samples that fall on it into a single min/max range so
// the visible history (waveformDraw) stays one entry per pixel.
class WaveformVisualizer extends SoundVisualizer {
  // see: https://p5js.org/reference/#/p5.FFT
  constructor(x, y, width, height, backgroundColor, lengthInSeconds) {
    super(x, y, width, height, backgroundColor, lengthInSeconds);
    this.waveformBuffer = [];
    this.waveformDraw = [];
  }

  // Append the new samples, then drain the buffer one x-pixel's worth at a time,
  // recording each pixel's min/max amplitude and dropping ranges that scroll off
  // the left edge.
  update(waveform) {
    
    if(this.waveformBuffer.length <= 0){
      // Helpful to understand length
      print("The FFT waveform segment is " + waveform.length + " samples"); 
    }

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
      //print(i, numSamplesInOnePixel, i + numSamplesInOnePixel);
      //let tmpBuffer = this.waveformBuffer.slice(i, i + numSamplesInOnePixel);
      let tmpBuffer = this.waveformBuffer.splice(0, numSamplesInOnePixel);

      let maxY = max(tmpBuffer);
      let maxYPixel = map(maxY, -1, 1, this.getBottom(), this.y);
      let minY = min(tmpBuffer);
      let minYPixel = map(minY, -1, 1, this.getBottom(), this.y);
      let minMaxRange = new MinMaxRange(minYPixel, maxYPixel);
      //print(newLine);
      this.waveformDraw.push(minMaxRange);

      if (this.waveformDraw.length > this.width) {
        let removedLine = this.waveformDraw.shift();
        //print("Removed line:", removedLine);
      }

      this.bufferIndex += numSamplesInOnePixel;
      // print("waveformBuffer.length", this.waveformBuffer.length, "tmpBuffer.length", tmpBuffer.length, 
      //       "bufferIndex", this.bufferIndex, "waveformDraw.length", this.waveformDraw.length);
    }
  }

  // Draw the stored per-pixel min/max ranges as one connected vertical-zigzag
  // shape across the panel.
  draw() {
    if (this.waveformDraw) {
      push();

      noStroke();
      fill(this.backgroundColor);
      rect(this.x, this.y, this.width, this.height);

      noFill();
      stroke(255);
      // let xVal = this.x;
      // for (let minMaxRange of this.waveformDraw){
      //   //print("drawing: ", l);
      //   //print(l.x1, l.y1, l.x2, l.y2);
      //   //line(l.x1, l.y1, l.x2, l.y2);
      //   line(xVal, minMaxRange.min, xVal, minMaxRange.max);
      //   xVal++;
      // }

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
  }
}

// Tiny helper holding two endpoints (x1,y1)-(x2,y2).
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
}

// Scrolling spectrogram: time on the x-axis, frequency on the y-axis, with
// brightness encoding the energy at each frequency. Draws each spectrum column
// once onto one of two ping-ponging offscreen buffers for performance.
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
    
    this.hasUpdateEverBeenCalled = false;
    this.bufferIndex = 0;
    
    this.offscreenGfxBuffer1.x = 0;
    this.offscreenGfxBuffer2.x = this.offscreenGfxBuffer1.width;
    
    this.resetGraphicsBuffer(this.offscreenGfxBuffer1);
    this.resetGraphicsBuffer(this.offscreenGfxBuffer2);
    this.spectrum = null;
  }
  
  // Clear an offscreen buffer to the background color.
  resetGraphicsBuffer(gfxBuffer){
    gfxBuffer.push();
    gfxBuffer.background(this.backgroundColor);
    gfxBuffer.pop();
  }


  // Draw this frame's spectrum as one vertical column (frequency up the y-axis,
  // energy as brightness) onto the current offscreen buffer for the scroll.
  update(spectrum) {

    this.spectrum = spectrum; // grab cur ref to spectrum
    
    if(this.hasUpdateEverBeenCalled == false){
      // Helpful to understand length of spectrum for debugging purposes
      print("The FFT spectrum segment is " + spectrum.length + " samples"); 
      this.hasUpdateEverBeenCalled = true;
    }
    
    // convert buffer index to x pixel position in offscreen buffer
    let xBufferVal = map(this.bufferIndex, 0, this.getXAxisLengthInSamples(), 0, this.width);
    let xVal = xBufferVal - (int(xBufferVal / this.width)) * this.width;
    // print("xVal", xVal, "xVal/width", nfc((xVal / this.width),2), 
    //       "gfx", int(xVal / this.width) % 2, "newX", xBufferVal - (int(xBufferVal / this.width))*this.width);
    
    let selectOffscreenBuffer = int(xBufferVal / this.width) % 2;
    //print("selectOffscreenBuffer", selectOffscreenBuffer);
    let offScreenBuffer = this.offscreenGfxBuffer1;
    
    // TODO: add in a clear for the offscreen background?
    // TODO: if one x pixel < spectrum.length, need to draw rects/lines rather than points
    if(xBufferVal > this.width){
      if(selectOffscreenBuffer == 0){
        offScreenBuffer = this.offscreenGfxBuffer1;
        this.offscreenGfxBuffer1.x = this.width - xVal; 
        this.offscreenGfxBuffer2.x = this.width - (xVal + this.width);
      }else{
        offScreenBuffer = this.offscreenGfxBuffer2;
        this.offscreenGfxBuffer1.x = this.width - (xVal + this.width);
        this.offscreenGfxBuffer2.x = this.width - xVal;

        //print("this.offscreenGfxBuffer1.x", this.offscreenGfxBuffer1.x, "this.offscreenGfxBuffer2.x", this.offscreenGfxBuffer2.x); 
      }
    }
    
    offScreenBuffer.push();
    offScreenBuffer.strokeWeight(1);
    offScreenBuffer.noFill();

    for (let i = 0; i < spectrum.length; i++) {
      let y = map(i, 0, spectrum.length, this.height, 0);
      let col = map(spectrum[i], 0, 255, blue(this.backgroundColor), 255);
      offScreenBuffer.stroke(col);
      offScreenBuffer.point(xVal, y);
    }

    offScreenBuffer.pop();
        
    this.bufferIndex += spectrum.length;
  }


  // Blit the two offscreen buffers to the screen at their scrolled positions.
  draw() {
    // draw our offscreen buffers to the screen!
    image(this.offscreenGfxBuffer1, this.offscreenGfxBuffer1.x, this.y);
    image(this.offscreenGfxBuffer2, this.offscreenGfxBuffer2.x, this.y);
  }
}

// Live frequency spectrum drawn as a single connected curve of the current
// FFT bins (no scrolling, peaks, or averaging — just the latest snapshot).
class SpectrumVisualizer extends Rectangle {
  // see: https://p5js.org/reference/#/p5.FFT
  constructor(x, y, width, height, backgroundColor) {
    super(x, y, width, height, backgroundColor);
    this.spectrum = null;
    this.samplingRate = sampleRate();
  }

  // Store the latest spectrum for drawing.
  update(spectrum) {
    this.spectrum = spectrum;
  }

  // Draw the current spectrum as a connected curve spanning the full width.
  draw() {
    if (this.spectrum) {
      push();
      noStroke();
      fill(this.backgroundColor);
      rect(this.x, this.y, this.width, this.height);
      stroke(255);
      beginShape();
      for (let i = 0; i < this.spectrum.length; i++) {
        let x = map(i, 0, this.spectrum.length, this.x, this.width);
        let y = map(this.spectrum[i], 0, 255, this.getBottom(), this.y);
        vertex(x, y);
      }
      endShape();
      pop();
    }
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

  // Draw the snapshotted waveform as a single connected curve.
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