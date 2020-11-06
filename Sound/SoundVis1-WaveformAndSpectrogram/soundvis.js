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
class SoundVisualizer extends Rectangle{
  constructor(x, y, width, height, backgroundColor, lengthInSeconds) {
    super(x, y, width, height, backgroundColor);

    this.samplingRate = sampleRate();
    this.lengthInSeconds = lengthInSeconds;

    print("One x pixel = " + this.getNumSamplesInOnePixel() + " values");
    print("One x pixel = " + this.getNumSecondsInOnePixel() + " secs");
    print("Waveform buffer segment (1024) is " + nfc((1024/this.samplingRate),2) + " secs");
  }
  
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

class WaveformVisualizer extends SoundVisualizer {
  // see: https://p5js.org/reference/#/p5.FFT
  constructor(x, y, width, height, backgroundColor, lengthInSeconds) {
    super(x, y, width, height, backgroundColor, lengthInSeconds);
    this.waveformBuffer = [];
    this.waveformDraw = [];
  }

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
    
    this.hasUpdateEverBeenCalled = false;
    this.bufferIndex = 0;
    
    this.offscreenGfxBuffer1.x = 0;
    this.offscreenGfxBuffer2.x = this.offscreenGfxBuffer1.width;
    
    this.resetGraphicsBuffer(this.offscreenGfxBuffer1);
    this.resetGraphicsBuffer(this.offscreenGfxBuffer2);
    this.spectrum = null;
  }
  
  resetGraphicsBuffer(gfxBuffer){
    gfxBuffer.push();
    gfxBuffer.background(this.backgroundColor);
    gfxBuffer.pop();
  }
  

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


  draw() {
    // draw our offscreen buffers to the screen!   
    image(this.offscreenGfxBuffer1, this.offscreenGfxBuffer1.x, this.y);
    image(this.offscreenGfxBuffer2, this.offscreenGfxBuffer2.x, this.y);
  }
}

class SpectrumVisualizer extends Rectangle {
  // see: https://p5js.org/reference/#/p5.FFT
  constructor(x, y, width, height, backgroundColor) {
    super(x, y, width, height, backgroundColor);
    this.spectrum = null;
    this.samplingRate = sampleRate();
  }

  update(spectrum) {
    this.spectrum = spectrum;
  }

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