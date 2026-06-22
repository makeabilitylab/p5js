// A basic keyboard game in p5js. 
//
// For a more advanced version, see: https://editor.p5js.org/jonfroehlich/sketches/jV9diy_FD
//
// By Jon Froehlich
// http://makeabilitylab.io
// 
// See:
//  - https://learning.oreilly.com/library/view/make-getting-started/9781457186769/ch05.html#response
//
// Ideas for Extension:
// - make it coffee monster, so it's not a cookie, it's coffee
// - add in cookie/coffee monster who "chases" me and also eats cookies
// - track cookie monster score too
// - add in sound effects
//   -- cookie monster sounds here: https://www.soundboard.com/sb/Cookie_Monster_Soundboard
//   -- [done] bite sound effect: https://youtu.be/B3vkzRdp9vU
// - make it so cookie has to actually go in the mouth (rather than just head)
// - use game font

let avatar;
let cookie;
let score = 0;

let drawDebugInfo = false; // set to true to turn on debug

// Accessibility: announce score changes to screen readers via the aria-live
// region in index.html. This game is endless (no game-over state), so we only
// announce the score, tracking what we last announced so the region updates on
// a real change (no per-frame spam).
let lastAnnouncedScore = -1;

// Write a message into the aria-live region (only when it actually changes).
function announceStatus(message) {
  const statusEl = document.getElementById('aria-status');
  if (statusEl && statusEl.textContent !== message) {
    statusEl.textContent = message;
  }
}

// Announce the score to screen readers whenever it changes.
function updateScreenReaderStatus() {
  if (score !== lastAnnouncedScore) {
    announceStatus('Score: ' + score);
    lastAnnouncedScore = score;
  }
}

// Load images/sound before setup by creating the avatar (its constructor loads assets).
function preload(){

  // create the game characters
  avatar = new Avatar(50, 50);

}

// Set up the canvas, slow the frame rate to a chewable pace, and place the first cookie.
function setup() {
  createCanvas(600, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A keyboard game where each key press makes Cookie Monster take another bite of the cookie until it is gone.");
  
  
  frameRate(8);
  cookie = new Cookie(); 
}

// Each frame: redraw cookie and avatar; if the avatar overlaps the cookie,
// score a point, play the bite sound, and move the cookie somewhere new.
function draw() {
  background(204);


  cookie.draw();


  if(avatar.contains(cookie.x, cookie.y)){
    score++;
    avatar.ateCookie();
    cookie.relocate();
  }

  avatar.draw();
  textSize(20);
  text("Score:" + score, 10, 20);

  updateScreenReaderStatus();
}

// Arrow keys move/face the avatar; space bar makes it "jump" up. Movement is
// then clamped so the avatar stays on screen.
function keyPressed() {
  //print(keyCode, key);

  // don't put any drawing code in here!
  let pixelIncrement = 15;
  if (keyCode == LEFT_ARROW) {
    avatar.x = avatar.x - pixelIncrement;
    avatar.setDir(DIRECTION.LEFT);
  } else if (keyCode == RIGHT_ARROW) {
    avatar.x = avatar.x + pixelIncrement;
    avatar.setDir(DIRECTION.RIGHT);
  } else if(keyCode == DOWN_ARROW){
    avatar.y = avatar.y + pixelIncrement; 
    avatar.setDir(DIRECTION.DOWN);
  }else if(keyCode == UP_ARROW){
    avatar.y = avatar.y - pixelIncrement; 
    avatar.setDir(DIRECTION.UP);
  }
  
  if(key == ' '){ // jump
    avatar.y = avatar.y - 100; 
  }
  
  if(avatar.getTop() < 0){
    avatar.y = 0; 
  }else if(avatar.getBottom() > height){
    avatar.y = height - avatar.height; 
  }
  
  if(avatar.getLeft() < 0){
    avatar.x = 0; 
  }else if(avatar.getRight() > width){
    avatar.x = width - avatar.width; 
  }
  
}


// A circle (drawn as an ellipse), sized by diameter. Extends Shape, so it still
// has a square rectangular hit box of width = height = diameter.
class Circle extends Shape{
  constructor(x, y, diameter, fillColor){
    super(x, y, diameter, diameter);
    this.fillColor = fillColor;
  }

  // Returns true if otherCircle is fully contained within this circle.
  containsCircle(otherCircle){
    let distFromThisCircleToOtherCircle = dist(this.x, this.y, otherCircle.x, otherCircle.y);
    let otherCircleRadius = otherCircle.diameter / 2;
    let thisRadius = this.diameter / 2;
    if(distFromThisCircleToOtherCircle + otherCircleRadius <= thisRadius){
      return true;  
    }
    return false;
  }

  // Draw the circle as a filled ellipse.
  draw(){
    push();
    noStroke();
    fill(this.fillColor);
    ellipse(this.x, this.y, this.width);
    pop();
  }
}

// Named directions the avatar can face (used to flip/rotate its image).
const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down'
}

// The player's character: a head image that faces the direction it last moved,
// chomps by alternating open/closed-mouth images, and plays a bite sound when
// it eats a cookie.
class Avatar extends Shape{

  constructor(x, y){
    // dimensions of the avatar pngs are 200x229
    // mouth is ~46 pixels in height and 132 pixels from top
    let imgHeight = 229;
    let imgWidth = 200;

    let scaledHeight = 80;
    let scaledWidth = scaledHeight / imgHeight * imgWidth;

    super(x, y, scaledWidth, scaledHeight);

    this.imgOpenMouth = loadImage('assets/JonOpenMouth_200x229.png');
    this.imgClosedMouth = loadImage('assets/JonClosedMouth_200x229.png');
    //this.imgHappyMouth = loadImage('assets/JonHappyMouth_200x229.png');
    this.curDirection = DIRECTION.RIGHT;
    this.fillColor =  color(128, 0, 0);

    this.biteSound = loadSound('assets/bite_sound_effect.mp3');
  }

  // Play the bite sound effect (called when the avatar reaches a cookie).
  ateCookie(){
    this.biteSound.play();
  }

  // Set which way the avatar faces.
  setDir(direction){
    this.curDirection = direction;
  }

  // Draw the avatar, flipping/rotating its image to face curDirection and
  // alternating open/closed mouth every couple frames to animate chewing.
  draw(){
    push();

    let img = this.imgOpenMouth;
    if (frameCount % 4 < 2){
      img = this.imgClosedMouth;
    }
  
    
    if(this.curDirection == DIRECTION.LEFT){
      translate(this.x + this.width, this.y); 
      scale(-1, 1);  
    }else if(this.curDirection == DIRECTION.RIGHT){
      translate(this.x, this.y);  
    }else if(this.curDirection == DIRECTION.DOWN){
      translate(this.x + this.height, this.y); 
      rotate(HALF_PI);
    }else if(this.curDirection == DIRECTION.UP){
      translate(this.x, this.y + this.width); 
      rotate(-HALF_PI);
    }
    
    //imageMode(CENTER);
    image(img, 0, 0, this.width, this.height);
    
    pop();
    
    
    if(drawDebugInfo){
      push();
      stroke(255,0,0);
      noFill();
      rect(this.x, this.y, this.width, this.height);
      pop();
    }
  }
}

// The cookie to be eaten: a Circle drawn as a cookie image, placed at a random
// in-bounds spot and re-placed each time it's eaten.
class Cookie extends Circle{
  constructor(){
    let cookieDiameter = 30;
    let cookieRadius = cookieDiameter/2;
    let cookieX = random(cookieRadius, width - cookieRadius);
    let cookieY = random(cookieRadius, height - cookieRadius);
    super(cookieX, cookieY, cookieDiameter, color(255));

    this.imgCookie = loadImage('assets/cookie_300x300.png');
  }

  // Move the cookie to a new random position that stays fully on screen.
  relocate(){
    let radius = this.width / 2;
    this.x = random(radius, width - radius);
    this.y = random(radius, height - radius);
  }

  // Draw the cookie image centered on its (x, y).
  draw(){
    push();
    imageMode(CENTER);
    image(this.imgCookie, this.x, this.y, this.width, this.height); 
    
    if(drawDebugInfo){
      noFill();
      stroke(255, 0, 0);
      ellipse(this.x, this.y, this.width, this.height);
    }
    pop();
  }
}










