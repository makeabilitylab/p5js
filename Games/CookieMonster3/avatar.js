// Named directions the avatar can face (used to flip/rotate its image and to move it).
const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down'
}


// The player's character: a head image that faces the way it last moved, chomps
// by alternating open/closed-mouth images, plays a bite sound and grows slightly
// each time it eats a cookie, and tracks how many cookies it has eaten (the score).
class Avatar extends Shape {

  constructor() {
    // dimensions of the avatar pngs are 200x229
    // mouth is ~46 pixels in height and 132 pixels from top
    let imgHeight = 229;
    let imgWidth = 200;

    let scaledHeight = 80;
    let scaledWidth = scaledHeight / imgHeight * imgWidth;

    super(50, 50, scaledWidth, scaledHeight);

    this.imgOpenMouth = loadImage('assets/JonOpenMouth_200x229.png');
    this.imgClosedMouth = loadImage('assets/JonClosedMouth_200x229.png');
    //this.imgHappyMouth = loadImage('assets/JonHappyMouth_200x229.png');
    this.curDirection = DIRECTION.RIGHT;
    this.fillColor = color(128, 0, 0);

    this.biteSound = loadSound('assets/bite_sound_effect.mp3');
    this.numCookiesEaten = 0;
    
    this.jumpStrength = 100;
    this.moveStrength = 15;
  }

  // Place the avatar back at its top-left starting spot (used on game reset).
  moveToStartPosition() {
    this.x = 50;
    this.y = 50;
  }

  // Eat a cookie: play the bite sound, grow a little (up to a max width), and
  // increment the score.
  ateCookie() {
    this.biteSound.play();

    let maxWidth = 200; // stop growing once this wide
    if(this.width < maxWidth){
      this.incrementWidth(2, true);
    }
    this.numCookiesEaten++;
  }

  // Leap a fixed distance in whichever direction the avatar is currently facing.
  jump(){
    if(this.curDirection == DIRECTION.RIGHT){
      avatar.x += this.jumpStrength; 
    }else if(this.curDirection == DIRECTION.LEFT){
      avatar.x -= this.jumpStrength; 
    }else if(this.curDirection == DIRECTION.UP){
      avatar.y -= this.jumpStrength; 
    }else if(this.curDirection == DIRECTION.DOWN){
      avatar.y += this.jumpStrength; 
    }
  }

  // Face the given direction, step one moveStrength in it, then clamp the
  // avatar so it stays on screen.
  moveDir(direction) {
    this.curDirection = direction;

    if(this.curDirection == DIRECTION.LEFT){
      this.x = this.x - this.moveStrength;
    } else if (this.curDirection == DIRECTION.RIGHT) {
      this.x = this.x + this.moveStrength;
    } else if(this.curDirection == DIRECTION.DOWN){
      this.y = this.y + this.moveStrength; 
    }else if(this.curDirection == DIRECTION.UP){
      this.y = this.y - this.moveStrength; 
    }

    if (this.getTop() < 0) {
      this.y = 0;
    } else if (this.getBottom() > height) {
      this.y = height - this.height;
    }

    if (this.getLeft() < 0) {
      this.x = 0;
    } else if (this.getRight() > width) {
      this.x = width - this.width;
    }
  }

  // Draw the avatar, flipping/rotating its image to face curDirection and
  // alternating open/closed mouth every couple frames to animate chewing.
  draw() {
    push();

    let img = this.imgOpenMouth;
    if (frameCount % 4 < 2) {
      img = this.imgClosedMouth;
    }


    if (this.curDirection == DIRECTION.LEFT) {
      translate(this.x + this.width, this.y);
      scale(-1, 1);
    } else if (this.curDirection == DIRECTION.RIGHT) {
      translate(this.x, this.y);
    } else if (this.curDirection == DIRECTION.DOWN) {
      translate(this.x + this.height, this.y);
      rotate(HALF_PI);
    } else if (this.curDirection == DIRECTION.UP) {
      translate(this.x, this.y + this.width);
      rotate(-HALF_PI);
    }

    //imageMode(CENTER);
    image(img, 0, 0, this.width, this.height);

    pop();


    if (drawDebugInfo) {
      push();
      stroke(255, 0, 0);
      noFill();
      rect(this.x, this.y, this.width, this.height);
      pop();
    }
  }
}