// The player base class: a rectangle fixed in x that jumps under gravity. The
// world scrolls past it, so it only moves vertically. Mario subclasses this to
// draw an animated sprite instead of a plain rectangle.
class Avatar extends Shape{
  constructor(yGround, x, y, width, height){
    super(x, y, width, height);

    this.fillColor = color(70);
    this.gravity = 0.9;
    this.jumpStrength = 15;
    this.yVelocity = 0;
    this.yGround = yGround;
  }

  // Give the avatar an upward impulse (a jump).
  jump(){
    this.yVelocity += -this.jumpStrength;
  }

  // True when the avatar is resting on the ground (so it can jump again).
  isOnGround(){
    return this.y == this.yGround - this.height;
  }

  // Apply gravity + air resistance, move vertically, and clamp to the ground.
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

// An Avatar drawn from a horizontal sprite sheet (running animation) with a
// jump sound. Sized to a fixed height, preserving the sprite's aspect ratio.
class Mario extends Avatar{
  constructor(marioJumpSound, yGround, spritesheet, numFrames, spriteWidth, spriteHeight){

    let marioHeight = 40;
    let marioWidth = (marioHeight / spriteHeight) * spriteWidth; // keep sprite aspect ratio
    super(yGround, 64, yGround - marioHeight, marioWidth, marioHeight);

    this.jumpSound = marioJumpSound;
    this.spritesheet = spritesheet;
    this.spriteWidth = spriteWidth;
    this.spriteHeight = spriteHeight;
    this.spriteFrames = numFrames;
    this.curFrame = 0;
  }

  // Play the jump sound, then do the normal Avatar jump.
  jump(){
    this.jumpSound.play();
    super.jump();
  }

  // Draw the current animation frame from the sprite sheet, advancing to the
  // next frame only while on the ground (so the jump pose holds mid-air).
  draw(){
    if(this.curFrame >= this.spriteFrames){
      this.curFrame = 0;
    }
    let spriteFrameX = this.curFrame * this.spriteWidth; // x offset into the sprite sheet
    image(this.spritesheet, this.x, this.y, this.width, this.height, spriteFrameX, 0, this.spriteWidth, this.spriteHeight);

    //if we are jumping, don't animate
    if(this.isOnGround()){
      this.curFrame++;
    }
  }
}