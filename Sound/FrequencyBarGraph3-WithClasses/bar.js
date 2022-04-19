class Bar {
  constructor(x, width, y, maxHeight, barGraphBin, hue) {
    this.x = x;
    this.width = width;
    this.hue = hue;
    this.y = y;
    this.maxHeight = maxHeight;
    this.height = -1;

    this.peakFrequencyAmplitude = -1;
    this.peakFrequencyTimestamp = -1;
    this.peakFrequencyHoldTimeInMs = 500;
    this.peakDropRateStartVal = 0.25;
    this.peakDropRateIncrement = 0.5;
    this.curPeakDropRate = this.peakDropRateStartVal;

    this.mapMaxFrequencyToAmplitude = null;
    this.avgFrequencyAmplitude = -1;

    this.startBinFrequency = -1;
    this.endBinFrequency = -1;
    this.barGraphBin = barGraphBin;

    this.mapFrequenciesToAmplitudes = null;

    this.funcTranslateAmplitudeToYValue = null;
    this.funcTranslateAmplitudeToPercent = null;
  }

  /**
   * Returns the left side of the bar
   * @return {Number} the left side of the bar
   */
  getLeft() {
    return this.x;
  }

  /**
   * Returns the right side of the bar
   * @return {Number} the right side of the bar
   */
  getRight() {
    return this.x + this.width;
  }

  /**
   * Calculates the maximum frequency amplitude at this bar and returns the freq and amplitude
   * @returns {dict} of "freq" mapped to the maxFreq and "amplitude" mapped to the maxAmplitude
   */
  calcMaxFrequency() {
    let maxAmplitude = -1;
    let maxFreq = -1;
    for (let [freq, freqAmplitude] of this.mapFrequenciesToAmplitudes) {
      if (maxAmplitude < freqAmplitude) {
        maxFreq = freq;
        maxAmplitude = freqAmplitude;
      }
    }

    return {
      "freq": maxFreq,
      "amplitude": maxAmplitude
    }
  }


  update(mapFrequencyToAmplitude) {
    this.mapFrequenciesToAmplitudes = mapFrequencyToAmplitude;

    const frequenciesInBin = Array.from(mapFrequencyToAmplitude.values());
    const sumOfValuesAtBin = frequenciesInBin.reduce((a, b) => a + b)

    this.startBinFrequency = Math.min(...frequenciesInBin);
    this.endBinFrequency = Math.max(...frequenciesInBin);
    this.mapMaxFrequencyToAmplitude = this.calcMaxFrequency();
    this.avgFrequencyAmplitude = sumOfValuesAtBin / frequenciesInBin.length;
  }

  draw() {

    if (this.peakFrequencyAmplitude < this.avgFrequencyAmplitude) {
      this.peakFrequencyAmplitude = this.avgFrequencyAmplitude;
      this.peakFrequencyTimestamp = millis();
      this.curPeakDropRate = this.peakDropRateStartVal;
    }

    if ((millis() - this.peakFrequencyTimestamp) > this.peakFrequencyHoldTimeInMs) { 
      this.peakFrequencyAmplitude -= this.curPeakDropRate;
      this.curPeakDropRate += this.peakDropRateIncrement;
    }

    if (this.peakFrequencyAmplitude < this.avgFrequencyAmplitude) {
      this.peakFrequencyAmplitude = this.avgFrequencyAmplitude;
    }

    const yAvgVal = this.getYPixelValueForFrequencyAmplitude(this.avgFrequencyAmplitude);
    const yMinVal = this.getYPixelValueForFrequencyAmplitude(0);
    this.height = yMinVal - yAvgVal;
    const yPeakFreqVal = this.getYPixelValueForFrequencyAmplitude(this.peakFrequencyAmplitude);

    // Draw the bar
    push();
    colorMode(HSB);
    fill(this.hue, 100, 90, 1);
    noStroke();
    rect(this.x, yAvgVal, this.width, this.height);

    // Draw the peak line
    noFill();
    strokeWeight(1);
    stroke(this.hue, 100, 90, 1);
    line(this.getLeft(), yPeakFreqVal, this.getRight(), yPeakFreqVal);

    // Draw the peak line text
    
    noStroke();
    fill(this.hue, 100, 90, 1);
    const lblSize = 14;
    textSize(lblSize);
    textAlign(LEFT);
    const minFreqAmplitude = 0, maxFreqAmplitude = 255;
    const peakVal = this.getPercentFromFrequencyAmplitude(this.peakFrequencyAmplitude)
    const peakValStr = nfc(peakVal, 0);
    const lblWidth = textWidth(peakValStr);
    const xLbl = this.x + this.width / 2.0 - lblWidth / 2.0;
    //print(this.x, this.width, lblWidth, xLbl);
    text(peakValStr, xLbl, yPeakFreqVal - 2);

    pop();

  }

  getYPixelValueForFrequencyAmplitude(freqAmplitude) {
    // The min/max frequency amplitudes are 0 - 255, see https://p5js.org/reference/#/p5.FFT/analyze 
    const minFreqAmplitude = 0, maxFreqAmplitude = 255;
    return map(freqAmplitude, minFreqAmplitude, maxFreqAmplitude, this.maxHeight, this.y);
  }

  getPercentFromFrequencyAmplitude(freqAmplitude) {
    const minFreqAmplitude = 0, maxFreqAmplitude = 255;
    return map(freqAmplitude, minFreqAmplitude, maxFreqAmplitude, 0, 100);
  }
}