class Bubble{
  constructor(x, y, minSize, maxSize, fillColor){
    this.x = x;
    this.y = y;

    this.minSize = minSize;
    this.maxSize = maxSize;

    this.fillColor = fillColor;

    this.micLevel = 0.5; // between 0 and 1

    this.grayscaleColor = color(255, 50); // in HSB mode
    this.drawGrayscale = false;
  }

  update(micLevel){
    this.micLevel = micLevel;
  }

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