class Bubble{
  constructor(x, y, freq, fillColor){
    this.x = x;
    this.y = y;
    this.fillColor = fillColor;
    this.freq = freq;
    this.freqAmplitude = 50;
    this.maxWidth = 200;
  }

  update(freqAmplitude){
    this.freqAmplitude = freqAmplitude;
  }

  draw(){
    push();
    noStroke();
    fill(this.fillColor);
    //fill(255, 255, 255, 128);
    let diameter = map(this.freqAmplitude, 0, 255, 0, this.maxWidth);
    circle(this.x, this.y, diameter);
    pop();
  }
}