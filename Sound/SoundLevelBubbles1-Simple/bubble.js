// A single bubble at a fixed position whose diameter maps from the current mic
// level (0-1) to its [minSize, maxSize] range. Can draw in color or grayscale.
class Bubble{
  constructor(x, y, minSize, maxSize, fillColor){
    this.x = x;
    this.y = y;

    this.minSize = minSize;
    this.maxSize = maxSize;

    this.fillColor = fillColor;

    this.micLevel = 0.5; // between 0 and 1

    this.grayscaleColor = color(120, 0.5); // in HSB mode
    this.drawGrayscale = false;
  }

  // Store the latest mic level (0-1) used to size the bubble on the next draw().
  update(micLevel){
    this.micLevel = micLevel;
  }

  // Draw the bubble, its diameter scaled from the current mic level.
  draw(){
    push();
    noStroke();

    if(this.drawGrayscale){
      fill(this.grayscaleColor);
    }else{
      fill(this.fillColor);
    }
 
    let diameter = map(this.micLevel, 0, 1, this.minSize, this.maxSize);
    circle(this.x, this.y, diameter);
    pop();
  }
}