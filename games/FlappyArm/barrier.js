class Barrier extends Shape {
  
  constructor(speed, maxGaps) {
    super(width, 0, 20, height);

    speed = min(9, speed);
    this.speed = speed;
    
    let birdHeight = 10;
    
    maxGaps = min(3, max(1, maxGaps)); // ensures that maxGaps is between 1 - 3 . 
    let numGaps = round(random(1, maxGaps));
    
    let absMinGapHeight = birdHeight * 5; // birdHeight * 5 is challenging but not impossible
    let minGapHeight = birdHeight * 20;
    let maxGapHeight = birdHeight * 30;
    
    if(numGaps > 2){
      minGapHeight = birdHeight * 10;
      maxGapHeight = birdHeight * 20;
    }
    else if(numGaps > 1){
      minGapHeight = birdHeight * 14;
      maxGapHeight = birdHeight * 26;
    }
    
    let gaps = [];
    let totalGapHeight = 0;
    for(let i = 0; i < numGaps; i++){
      let gapHeight = random(minGapHeight, maxGapHeight);
      totalGapHeight += gapHeight;
      gaps.push(gapHeight); 
    }
    
    let totalPipeHeight = height - totalGapHeight;
    let minPipeHeight = 10; 
    let maxPipeHeight = totalPipeHeight - ((numGaps + 1) * minPipeHeight);
    let newPipeY = 0;
    this.pipes = [];
    for(let i = 0; i < numGaps; i++){
      let pipeHeight = random(minPipeHeight, maxPipeHeight); 
      let newPipe = new Pipe(this.x, newPipeY, this.width, pipeHeight);
      this.pipes.push(newPipe);
      maxPipeHeight -= pipeHeight;
      newPipeY = newPipe.getTop() + gaps[i];
    }
    
    let pipeHeight = height - newPipeY;
    let newPipe = new Pipe(this.x, newPipeY, this.width, pipeHeight);
    this.pipes.push(newPipe);
    
    // true if the barrier is completely past the bird
    this.pastBird = false; 
  }
  
  checkIfHitsBird(bird){
    // returns true if barrier hits bird, false otherwise
    for (let pipe of this.pipes){
      if(pipe.overlaps(bird)){
        return true; 
      }
    }
    return false;
  }
  
  checkIfPastBird(bird){
    // returns true if pipe passes bird, false otherwise
    // also sets the this.pastBird member variable
    this.pastBird = bird.x > this.getRight();
    return this.pastBird;
  }
  
  update(){
    // pipes always go from right to left
    this.x -= this.speed; 
    for (let pipe of this.pipes){
      pipe.x = this.x; 
    } 
  }
  
  draw(){
    for (let pipe of this.pipes){
      pipe.draw();
    } 
  }
}

class Pipe extends Shape{
  
  constructor(x, y, width, height) {
    super(x, y, width, height);
    //print("Created new pipe, bottom: ", this.getBottom(), " top", this.getTop()); 
  }
  
  draw(){
    push();
      fill(0);
      rect(this.x, this.y, this.width, this.height); 
    pop();
  }
}