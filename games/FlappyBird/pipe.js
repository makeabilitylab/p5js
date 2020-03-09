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
  
  checkIfHitsBird(bird){
    // returns true if pipe hits bird, false otherwise
    if((bird.x + bird.width > this.x && bird.x < this.x + this.width) &&
       (bird.y < this.topHeight || (bird.y + bird.height) > (height - this.bottomHeight))){
      return true; 
    }
    return false;
  }
  
  checkIfPastBird(bird){
    // returns true if pipe passes bird, false otherwise
    // also sets the this.pastBird member variable
    this.pastBird = bird.x > this.x + this.width;
    return this.pastBird;
  }
  
  update(){
    // pipes always go from right to left
    this.x -= this.speed; 
  }
  
  draw(){
    fill(0);
    rect(this.x, 0, this.width, this.topHeight);
    rect(this.x, height - this.bottomHeight, this.width, this.bottomHeight);
  }
}