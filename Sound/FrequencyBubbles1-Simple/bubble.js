// A circle tied to one frequency, drawn at a fixed position; its diameter tracks
// the current amplitude (energy) of that frequency, so it pulses with the sound.
class Bubble{
  constructor(x, y, freq, fillColor){
    this.x = x;
    this.y = y;
    this.fillColor = fillColor;
    this.freq = freq;
    this.freqAmplitude = 50;
    this.maxWidth = 200; // diameter (px) at full amplitude (255)

    this.grayscaleColor = color(120, 0.5); // in HSB mode
    this.drawGrayscale = false;
  }

  // Store this frame's amplitude (0-255) for this frequency.
  update(freqAmplitude){
    this.freqAmplitude = freqAmplitude;
  }

  // Draw the bubble, mapping amplitude to diameter (uses grayscale if toggled).
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