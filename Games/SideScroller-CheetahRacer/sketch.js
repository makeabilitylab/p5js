// This is a simple side scroller game based loosely on the Chrome
// web browswer game called dino. (When using Chrome, type in 'chrome://dino'
// in the address bar and then hit the SPACE BAR key).
//
// By Jon Froehlich
// http://makeabilitylab.io/
//
// See also:
//  - Daniel Shiffman's "Chrome Dinosaur Game": https://youtu.be/l0HoJHc-63Q
//  - My simple flappy bird: https://editor.p5js.org/jonfroehlich/sketches/sFOMDuDaw
//  - A more complicated flappy bird: https://editor.p5js.org/jonfroehlich/sketches/shtF6XFeY
// 
// Extension Ideas
//  - Have scrolling background (using parallax)
//  - Have pits that you have to jump over
//  - have platforms to jump on
//  - have different barrier shapes and use https://github.com/bmoren/p5.collide2D
//  - control x position of player (like SMB)
//  - Use animated sprites for character (running and jump)
//  - Jump height controlled by how long you hold down space (similar to SMB)
//  - Use ml5js sound recognition library to play? See https://youtu.be/l0HoJHc-63Q?t=1204

let ground;
let avatar;
let barriers;

let isGameOver = false;
let hasGameBegun = false; 
let score = 0;
let arcadeFont;

let minDistanceBetweenBarriers = 100;
let nextSpawnDistance;
let isInvincible = false;

// Accessibility: announce score changes and game over to screen readers via
// the aria-live region in index.html. We track what we last announced so the
// region only updates on a real change (no per-frame spam).
let lastAnnouncedScore = -1;
let announcedGameOver = false;

function announceStatus(message) {
  const statusEl = document.getElementById('aria-status');
  if (statusEl && statusEl.textContent !== message) {
    statusEl.textContent = message;
  }
}

function updateScreenReaderStatus() {
  if (isGameOver) {
    if (!announcedGameOver) {
      announceStatus('Game over. Final score: ' + score + '. Press the space bar to play again.');
      announcedGameOver = true;
    }
  } else {
    if (announcedGameOver) { announcedGameOver = false; lastAnnouncedScore = -1; }
    if (score !== lastAnnouncedScore) {
      announceStatus('Score: ' + score);
      lastAnnouncedScore = score;
    }
  }
}

// Load the arcade font before setup() runs.
function preload() {
  arcadeFont = loadFont('assets/arcadefont.ttf');
}

// One-time setup: make the canvas, build the ground, start a fresh game, then
// pause the loop until the player hits the space bar to begin.
function setup() {
  createCanvas(600, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A side-scrolling endless-runner (Chrome-dino style) where you press a key to jump a cheetah over oncoming obstacles.");
  textFont(arcadeFont); 
  ground = new Ground();
  
  resetGame();
  
  // stop game loop until space bar hit to begin
  noLoop(); 
}

// Reset score and state, spawn a fresh avatar and first barrier, and restart
// the game loop.
function resetGame(){
  score = 0;
  isGameOver = false;

  avatar = new Avatar(ground.y);
  barriers = [new Barrier(width, ground.y)];
  loop();
}

// Each frame: spawn new barriers as needed, update/draw every barrier (ending
// the game on a collision, scoring when one is cleared, culling off-screen
// ones), then update and draw the avatar, ground, and score.
function draw() {
  background(220);

  if(barriers.length <= 0 || width - barriers[barriers.length - 1].x >= nextSpawnDistance){
    barriers.push(new Barrier(width, ground.y)); 
    nextSpawnDistance = random(minDistanceBetweenBarriers, width * 1.2);
  }
  
  // loop through all the barriers and update them
  for(let i = barriers.length - 1; i >= 0; i--){
    barriers[i].update();
    barriers[i].draw();
    
    //if we hit the barrier, end game
    if(isInvincible != true && barriers[i].checkIfCollision(avatar)){
      isGameOver = true;
      noLoop(); // game is over, stop game loop
    }
    
    if(barriers[i].hasScoredYet == false && barriers[i].getRight() < avatar.x){
      barriers[i].hasScoredYet = true;
      score++;
    }
    
    // remove barriers that have gone off the screen
    if(barriers[i].getRight() < 0){
      barriers.splice(i, 1); 
    }
  }
  
  avatar.update(ground.y);  
  ground.draw();
  avatar.draw();
  drawScore();
  updateScreenReaderStatus();
}

// Draw the running score, plus a dark overlay with "game over" or "press space
// to play" text depending on game state.
function drawScore() {

  fill(0);
  textAlign(LEFT);
  textSize(15);
  text('Score:' + score, 10, 20);

  if (isGameOver) {

    // dark overlay
    fill(0, 0, 0, 100);
    rect(0, 0, width, height);

    // draw game over text
    textAlign(CENTER);
    textSize(35);
    fill(255);
    text('GAME OVER!', width / 2, height / 3);
    
    textSize(12);
    text('Press SPACE BAR to play again.', width / 2, height / 2);
  }else if(hasGameBegun == false){
    // if we're here, then the game has yet to begin for the first time
    
    // dark overlay
    fill(0, 0, 0, 100);
    rect(0, 0, width, height);

    // draw game over text
    textAlign(CENTER);
    textSize(15);
    fill(255);
    text('Press SPACE BAR to play!', width / 2, height / 3);
  }
 
}


// Space bar jumps when on the ground; it also starts the first game or
// restarts after a game over.
function keyPressed(){
  if (key == ' ' && avatar.isOnGround()){ // spacebar
    avatar.jump();
  } 
  
  // check for special states (game over or if game hasn't begun)
  if (isGameOver == true && key == ' ') {
    resetGame();
  }else if(hasGameBegun == false && key == ' '){
    hasGameBegun = true;
    loop();
  }
}

// The static ground: a gray bar across the bottom 20% of the canvas.
class Ground extends Shape{
  constructor(){
    let yGround = height * 0.8;        // ground sits at 80% down the canvas
    let groundHeight = ceil(height - yGround);
    super(0, yGround, width, groundHeight);
    this.fillColor = color(128);
  }

  draw(){
    push();
    noStroke();
    fill(this.fillColor);
    rect(this.x, this.y, this.width, this.height);
    pop();
  }
}

// An obstacle: a randomly sized rectangle that scrolls right-to-left and ends
// the game if the avatar hits it.
class Barrier extends Shape{
  constructor(x, yGround){
    let barrierWidth = random(10, 30);
    let barrierHeight = random(10, 40);
    let y = yGround - barrierHeight;  // rest the barrier on top of the ground
    super(x, y, barrierWidth, barrierHeight);
    this.fillColor = color(128);
    this.speed = 6;
    this.hasScoredYet = false;
  }

  // Returns true if this barrier overlaps the given shape (the avatar).
  checkIfCollision(shape){
    return this.overlaps(shape);
  }

  // Scroll the barrier left by its speed each frame.
  update(){
    this.x -= this.speed;
  }

  draw(){
    push();
    noStroke();
    fill(this.fillColor);
    rect(this.x, this.y, this.width, this.height);
    pop();
  }
}

// The player: a rectangle fixed in x that jumps under gravity. The world
// scrolls past it, so it only ever moves vertically.
class Avatar extends Shape{
  constructor(yGround){
    let avatarHeight = 20;
    super(64, yGround - avatarHeight, 10, 20); // x=64 keeps the avatar near the left edge
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