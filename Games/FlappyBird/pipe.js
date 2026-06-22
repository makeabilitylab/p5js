// An obstacle that scrolls right-to-left: a top pipe and a bottom pipe with a
// randomly sized gap between them for the bird to fly through.
class Pipe {
  constructor() {
    this.x = width;
    this.width = 20;
    this.speed = 5;
    let minimumPipeGap = 140;
    
    // pipes have two parts, a top pipe and a bottom pipe
    // the gap controls how big the gap is between the two pipes
    // (and thus, the pipe height themselves)
    let gap = random(minimumPipeGap, height/3);
    this.topHeight = random(0, height - gap);
    this.bottomHeight = height - (this.topHeight + gap);
    
    // true if the pipe is completely past the bird
    this.pastBird = false; 
  }
  
  // Returns true if the bird overlaps either the top or bottom pipe (i.e. it's
  // horizontally within the pipe and outside the gap).
  checkIfHitsBird(bird){
    if((bird.x + bird.width > this.x && bird.x < this.x + this.width) &&
       (bird.y < this.topHeight || (bird.y + bird.height) > (height - this.bottomHeight))){
      return true; 
    }
    return false;
  }
  
  // Returns true once the bird has fully passed the pipe (and caches the result
  // in this.pastBird for scoring).
  checkIfPastBird(bird){
    this.pastBird = bird.x > this.x + this.width;
    return this.pastBird;
  }

  // Scroll the pipe left by `speed` each frame.
  update(){
    this.x -= this.speed;
  }

  // Draw the top and bottom pipes as black rectangles.
  draw(){
    fill(0);
    rect(this.x, 0, this.width, this.topHeight);
    rect(this.x, height - this.bottomHeight, this.width, this.bottomHeight);
  }
}