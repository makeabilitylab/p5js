// The rival/hazard: Cookie Monster bounces around the canvas, eats cookies the
// player doesn't grab first (growing and speeding up each time, with a random
// "om nom nom" sound), and ends the game if it touches the avatar.
class CookieMonster extends Shape {
  constructor() {
    //cookie monster is 347 x 500
    let imgHeight = 180;
    let imgWidth = imgHeight / 500 * 347;
    super(150, 150, imgWidth, imgHeight);
    this.fillColor = color(0, 0, 255);

    this.maxVelocity = 5;
    this.xVelocity = random(2, this.maxVelocity);
    this.yVelocity = random(2, this.maxVelocity);

    this.imgLeftStep = loadImage('assets/cookie_monster_left_step_347x500.png');
    this.imgRightStep = loadImage('assets/cookie_monster_right_step_347x500.png');

    this.eatingSounds = [];
    this.eatingSounds.push(loadSound('assets/cookie_monster_me_want_cookie.mp3'));
    this.eatingSounds.push(loadSound('assets/cookie_monster_om_nom_nom.mp3'));
    this.eatingSounds.push(loadSound('assets/cookie_monster_very_good.mp3'));

    this.thankYouByeSound = loadSound('assets/cookie_monster_thank_you_bye.mp3')

    this.numCookiesEaten = 0;
  }

  // Place Cookie Monster at the top-right corner (used on game reset).
  moveToStartPosition() {
    this.x = width - (this.width + 5);
    this.y = 50;
  }

  // Move by the current velocity and bounce off the walls, flipping velocity and
  // then nudging back in-bounds (5px margin) so it can't get stuck on an edge.
  update() {
    this.x += this.xVelocity;
    this.y += this.yVelocity;

    if (this.getTop() < 0 || this.getBottom() > height) {
      this.yVelocity *= -1;
    }

    if (this.getLeft() < 0 || this.getRight() > width) {
      this.xVelocity *= -1;
    }

    if(this.getBottom() > height){
      this.y = height - (this.height + 5) 
    }else if(this.getTop() < 0){
      this.y = 5; 
    }
    
    if(this.getRight() > width){
       this.x = width - (this.width + 5); 
    }else if(this.getLeft() < 0){
      this.x = 5; 
    }
    
    
  }

  // Play the "thank you, bye" clip (used on game over).
  playThankYouSound() {
    this.thankYouByeSound.play();
  }

  // Eat a cookie: play a random eating sound, grow a bit (up to 70% of the
  // canvas height), speed up with a fresh random velocity (random direction),
  // and increment the count.
  ateCookie() {
    let randomSoundIndex = int(floor(random(0, this.eatingSounds.length)));
    let eatingSound = this.eatingSounds[randomSoundIndex];
    eatingSound.play();

    // scale up a bit when we eat a cookie
    let maxHeight = height * 0.7;
    if(this.height < maxHeight){
      this.incrementHeight(10, true);
    }

    // speed up a bit
    this.maxVelocity++;
    this.xVelocity = random(2, this.maxVelocity);
    this.yVelocity = random(2, this.maxVelocity);
    if (random(0, 1) <= 0.5) {
      this.xVelocity *= -1;
    }

    if (random(0, 1) <= 0.5) {
      this.yVelocity *= -1;
    }

    this.numCookiesEaten++;
  }

  // Overlap test with a forgiving hit box: shrink Cookie Monster's bounds by a
  // buffer on all sides so the player has to get well inside before it counts.
  overlaps(shape) {
    // based on https://stackoverflow.com/a/4098512
    let hitBoxBuffer = 25; // pixels trimmed off each side of the hit box
    return !((this.getRight() - hitBoxBuffer) < shape.x ||
      (this.getBottom() - hitBoxBuffer) < shape.y ||
      (this.x + hitBoxBuffer) > shape.getRight() ||
      (this.y + hitBoxBuffer) > shape.getBottom());
  }

  // Draw Cookie Monster, alternating the left/right step images to animate walking.
  draw() {
    let img = this.imgLeftStep;
    if (frameCount % 2 == 0) {
      img = this.imgRightStep;
    }
    image(img, this.x, this.y, this.width, this.height);

    if (drawDebugInfo) {
      push();
      stroke(255, 0, 0);
      noFill();
      rect(this.x, this.y, this.width, this.height);
      pop();
    }
  }
}