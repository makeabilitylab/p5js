class Avatar extends Shape{
  constructor(yGround, x, y, width, height){
    super(x, y, width, height);
    
    this.fillColor = color(70); 
    this.gravity = 0.9;
    this.jumpStrength = 15;
    this.yVelocity = 0;
    this.yGround = yGround;
  }
  
  jump(){
    this.yVelocity += -this.jumpStrength;   
  }
  
  isOnGround(){
    return this.y == this.yGround - this.height;
  }

  update() {
    this.yVelocity += this.gravity;
    this.yVelocity *= 0.9; // some air resistance
    this.y += this.yVelocity;
    
    if (this.y + this.height > this.yGround) {
      // hit the ground
      this.y = this.yGround - this.height;
      this.yVelocity = 0;
    }
  }
  
  draw(){
    push();
    noStroke();
    fill(this.fillColor);
    rect(this.x, this.y, this.width, this.height);
    pop();
  }
}

class Mario extends Avatar{
  constructor(marioJumpSound, yGround, spritesheet, numFrames, spriteWidth, spriteHeight){
    
    let marioHeight = 40;
    let marioWidth = (marioHeight / spriteHeight) * spriteWidth;
    super(yGround, 64, yGround - marioHeight, marioWidth, marioHeight);
    
    this.jumpSound = marioJumpSound;
    this.spritesheet = spritesheet;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.spriteFrames = numFrames;
    this.curFrame = 0; 
  }
  
  jump(){
    this.jumpSound.play();
    super.jump();
  }
  
  draw(){
    if(this.curFrame >= this.spriteFrames){
      this.curFrame = 0; 
    }
    let spriteFrameX = this.curFrame * this.spriteWidth;
    image(this.spritesheet, this.x, this.y, this.width, this.height, spriteFrameX, 0, this.spriteWidth, this.spriteHeight);
    
    //if we are jumping, don't animate
    if(this.isOnGround()){
      this.curFrame++;
    }
  }
}