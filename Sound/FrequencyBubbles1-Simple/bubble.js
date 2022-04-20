class Bubble{
  constructor(x, y, freq, fillColor){
    this.x = x;
    this.y = y;
    this.fillColor = fillColor;
    this.freq = freq;
    this.freqAmplitude = 50;
    this.maxWidth = 200;

    this.grayscaleColor = color(120, 0.5); // in HSB mode
    this.drawGrayscale = false;
  }

  update(freqAmplitude){
    this.freqAmplitude = freqAmplitude;
  }

  draw(){
    push();
    noStroke();

    if(this.drawGrayscale){
      fill(this.grayscaleColor);
    }else{
      fill(this.fillColor);
    }
    //fill(255, 255, 255, 128);
    let diameter = map(this.freqAmplitude, 0, 255, 0, this.maxWidth);
    circle(this.x, this.y, diameter);
    pop();
  }
}