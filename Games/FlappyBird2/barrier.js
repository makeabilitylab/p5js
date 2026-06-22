// A Barrier is a vertical wall made of black Pipes with 1-3 gaps the bird
// flies through. The constructor randomly picks how many gaps and how tall
// each is, then fills the remaining vertical space with pipes. Barriers scroll
// right-to-left; the game ends if any pipe overlaps the bird. Extends Shape.
class Barrier extends Shape {

  constructor(speed, maxGaps) {
    super(width, 0, 20, height); // start fully off the right edge, full canvas height

    this.speed = min(9, speed); // cap scroll speed so barriers stay dodgeable

    let birdHeight = 10; // assumed bird height; gap sizes are multiples of this

    maxGaps = min(3, max(1, maxGaps)); // clamp to 1-3 gaps
    let numGaps = round(random(1, maxGaps));

    // Gap sizing is in multiples of the bird's height. Fewer gaps can be larger;
    // more gaps must each be smaller so the barrier stays passable overall.
    let minGapHeight = birdHeight * 10;
    let maxGapHeight = birdHeight * 20;
    if(numGaps > 2){
      minGapHeight = birdHeight * 5;  // 5x bird height: tight but still passable
      maxGapHeight = birdHeight * 7;
    }
    else if(numGaps > 1){
      minGapHeight = birdHeight * 7;
      maxGapHeight = birdHeight * 13;
    }

    let gaps = [];
    let totalGapHeight = 0;
    for(let i = 0; i < numGaps; i++){
      let gapHeight = random(minGapHeight, maxGapHeight);
      totalGapHeight += gapHeight;
      gaps.push(gapHeight); 
    }
    
    // Lay the pipes out top-to-bottom, alternating pipe / gap / pipe / gap...
    // Reserve at least minPipeHeight for every pipe still to come so none
    // collapse to zero height.
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
      newPipeY = newPipe.getBottom() + gaps[i];
    }
    
    // Final pipe fills whatever space is left below the last gap.
    let pipeHeight = height - newPipeY;
    let newPipe = new Pipe(this.x, newPipeY, this.width, pipeHeight);
    this.pipes.push(newPipe);

    // true once the barrier has fully scrolled past the bird (used for scoring)
    this.pastBird = false;
  }
  
  // Returns true if any of this barrier's pipes overlaps the bird.
  checkIfHitsBird(bird){
    for (let pipe of this.pipes){
      if(pipe.overlaps(bird)){
        return true; 
      }
    }
    return false;
  }
  
  // Returns true once the barrier has fully scrolled past the bird (and caches
  // the result in this.pastBird for scoring).
  checkIfPastBird(bird){
    this.pastBird = bird.x > this.getRight();
    return this.pastBird;
  }
  
  // Scroll the barrier (and all its pipes) left by `speed` each frame.
  update(){
    this.x -= this.speed;
    for (let pipe of this.pipes){
      pipe.x = this.x;
    }
  }

  // Draw all of the barrier's pipes.
  draw(){
    for (let pipe of this.pipes){
      pipe.draw();
    }
  }
}

// A single solid rectangle segment of a Barrier (the black pipes). Extends Shape.
class Pipe extends Shape{

  constructor(x, y, width, height) {
    super(x, y, width, height);
  }

  // Draw the pipe as a solid black rectangle.
  draw(){
    push();
      fill(0);
      rect(this.x, this.y, this.width, this.height);
    pop();
  }
}