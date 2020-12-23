class MountainRange extends Shape {
  constructor(baseColor, mountainRangeIndex, totalNumMountains) {

    let baseHeight = height - height * (random(0.3, 0.4));
    let maxMountainHeight = (mountainRangeIndex + 1) / totalNumMountains * baseHeight;
    let randomHeightAddition = min(pow(mountainRangeIndex, random(3.3, 5)), mountainRangeIndex * 40);
    maxMountainHeight += randomHeightAddition;
    // print(mountainRangeIndex, randomHeightAddition, maxMountainHeight);

    super(0, height - maxMountainHeight, width, maxMountainHeight);
    let sat = map(mountainRangeIndex, 0, totalNumMountains, 0, saturation(baseColor));
    let bright = map(mountainRangeIndex, 0, totalNumMountains, 0, brightness(baseColor) * 1.3);
    this.fillColor = color(hue(baseColor), sat, bright);

    this.xNoiseStart = random() * 1000;
    //this.xNoiseStep = 0.01; 
    this.xNoiseStep = 0.01; //random(0.01, 0.0001); // 0.1 is very jagged, 0.001 is quite smooth
    this.xNoiseAnimationIncrement = map(mountainRangeIndex, 0, totalNumMountains, this.xNoiseStep * 1.5, this.xNoiseStep / 10);

    this.isAnimated = true;
  }

  draw(){
    push();
    noStroke();
    fill(this.fillColor);
    //rect(this.x, this.y, this.width, this.height);
    beginShape();
    vertex(-20, height);
    let xNoiseInputVal = this.xNoiseStart;
    for(let xPos = 0; xPos < this.width; xPos++){
      let perlinNoiseVal = noise(xNoiseInputVal);
      let yPos = height - perlinNoiseVal * this.height;
      vertex(xPos, yPos);
      xNoiseInputVal += this.xNoiseStep;
    }
    vertex(width + 21, height);
    endShape();
    pop();
    
    this.xNoiseStart += this.xNoiseAnimationIncrement;
    
  }
}