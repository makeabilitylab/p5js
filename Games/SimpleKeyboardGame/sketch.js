// A basic keyboard game in p5js. Move the blue ball into the blackhole
// and get a point
//
// By Jon Froehlich
// http://makeabilitylab.io
// 
// See:
//  - https://learning.oreilly.com/library/view/make-getting-started/9781457186769/ch05.html#response


let avatar;
let blackhole;
let score = 0;

// Accessibility: announce score changes to screen readers via the aria-live
// region in index.html. We track what we last announced so the region only
// updates on a real change (no per-frame spam). This game has no game-over
// state, so we only announce the score.
let lastAnnouncedScore = -1;

function announceStatus(message) {
  const statusEl = document.getElementById('aria-status');
  if (statusEl && statusEl.textContent !== message) {
    statusEl.textContent = message;
  }
}

function updateScreenReaderStatus() {
  if (score !== lastAnnouncedScore) {
    announceStatus('Score: ' + score);
    lastAnnouncedScore = score;
  }
}

// One-time setup: make the canvas, create the player ball, and place the black
// hole at a random size/position.
function setup() {
  createCanvas(600, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A keyboard game: use the arrow keys to move a blue ball into the black hole to score a point.");

  // create the game character
  avatar = new Ball(width/2, height/2, 30, color(0, 0, 255, 140));
  
  // create the black hole
  let blackholeDiameter = random(avatar.diameter + 10, 100);
  let blackholeRadius = blackholeDiameter/2;
  let blackholeX = random(blackholeRadius, width - blackholeRadius);
  let blackholeY = random(blackholeRadius, height - blackholeRadius);
  blackhole = new Ball(blackholeX, blackholeY, blackholeDiameter, color(0, 0, 0, 128));
}

// Each frame: draw the black hole, and if the avatar is fully inside it, score
// a point and relocate the hole. Then draw the avatar and score.
function draw() {
  background(204);


  blackhole.draw();

  if(blackhole.contains(avatar)){
    score++;
    blackhole.relocate();
  }

  avatar.draw();
  textSize(20);
  text("Score:" + score, 10, 20);

  updateScreenReaderStatus();
}

// Arrow keys move the avatar by a fixed step; space "jumps" it up by 100px.
function keyPressed() {
  //print(keyCode, key);

  // don't put any drawing code in here!
  let pixelIncrement = 15;
  if (keyCode == LEFT_ARROW) {
    avatar.x = avatar.x - pixelIncrement;
  } else if (keyCode == RIGHT_ARROW) {
    avatar.x = avatar.x + pixelIncrement;
  } else if(keyCode == DOWN_ARROW){
    avatar.y = avatar.y + pixelIncrement; 
  }else if(keyCode == UP_ARROW){
    avatar.y = avatar.y - pixelIncrement; 
  }
  
  if(key == ' '){ // jump
    avatar.y = avatar.y - 100; 
  }
}

// A filled circle used for both the player avatar and the black hole.
class Ball{
  constructor(x, y, diameter, fillColor){
    this.x = x;
    this.y = y;
    this.diameter = diameter;
    this.fillColor = fillColor;
  }

  draw(){
    push();
    noStroke();
    fill(this.fillColor);
    ellipse(this.x, this.y, this.diameter);
    pop();
  }

  // Move to a random spot fully inside the canvas.
  relocate(){
    let radius = this.diameter / 2;
    this.x = random(radius, width - radius);
    this.y = random(radius, height - radius);
  }

  // Returns true if otherBall is fully contained within this ball.
  contains(otherBall){
    let distFromThisBallToOtherBall = dist(this.x, this.y, otherBall.x, otherBall.y);
    let otherBallRadius = otherBall.diameter / 2;
    let thisRadius = this.diameter / 2;
    if(distFromThisBallToOtherBall + otherBallRadius <= thisRadius){
      return true;  
    }
    return false;
  }
}










