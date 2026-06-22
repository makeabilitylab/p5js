// An updated version of my basic flappy bird implementation
//
// See also my other flappyarm, which enables the user to control 
// flappy bird by flapping their arms (uses ml5js's posenet)
// See: https://editor.p5js.org/jonfroehlich/sketches/V5iBV0lVF
//
// This p5js sketch is also on the p5js editor: 
//  - https://editor.p5js.org/jonfroehlich/sketches/shtF6XFeY
// as well as my p5js github:
//  - https://github.com/jonfroehlich/p5js
// I try my best to keep my github and the p5js editor sync'd.
//
// By Jon Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//
// Based on Daniel Shiffman's 'Flappy Bird'
//  - https://thecodingtrain.com/CodingChallenges/031-flappybird.html
//  - Video: https://www.youtube.com/watch?v=cXgA1d_E-jY
//
// As well as other 'Flappy Bird' derivatives:
//  - https://mdbrim.github.io/flappy/index.html
//
// Ideas for extensions:
//  - bird flaps proportional to arms in PoseNet
//  - bird flaps proportional to sound input (ha, just saw that Shiffman
//    has something similar: https://www.youtube.com/watch?v=aKiyCeIuwn4)
//
// Possible TODOs:
//  - give custom instructions if on an iPhone or tablet
//  - add in comments: https://javascript.info/comments
//  - add code to github (and a runnable version from github.io)
//  - add in sound effects?
//  - [done] start easy (large openings) and get harder (small openings)
//  - [done] add in scoring (based on pipes passed)
//  - [done] make game harder longer you play
//  - [done] add in procedurally generated background (+ parallax scrolling)
//  - [done] spawn pipes more randomly
//  - [done] some pipes have multiple holes that you need to choose?
//  - [done] track high scores and show them?

let bird;
let barriers;
let landscape;

let isGameOver = false;
let hasGameBegun = false; 
let score = 0;
let hiScore = -1;
let lastHiScore = -1;
let stage = 1;
 
let startingSpeed = 4;
let arcadeFont;
let isInvincible = false; // change this to be true to become invincible

let minDistanceBetweenPipes;
let nextSpawnDistance;

// Load the arcade font before setup so text can use it immediately.
function preload() {
  arcadeFont = loadFont('assets/arcadefont.ttf');
}

// Set up the canvas and font, then start a fresh game paused until the first flap.
function setup() {
  createCanvas(600, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("An enhanced Flappy Bird game with parallax-scrolling backgrounds and increasing difficulty; press a key to flap the bird through the gaps between pipes.");
  minDistanceBetweenPipes = width / 3;
  textFont(arcadeFont); 
  
  resetGame();
  
  // stop game loop until space bar hit to begin
  noLoop(); 
}

// Build a barrier whose speed and max number of gaps scale with the current stage
// (so the game gets harder as you progress).
function createBarrier(){
  return new Barrier(startingSpeed + stage * 0.5, stage - 0.5);
}

// Reset score and game state, rebuild the background, bird, and first barrier, and resume the loop.
function resetGame(){
  score = 0;
  isGameOver = false;
  
  landscape = new Background();
  bird = new Bird(64, height / 2);
  barriers = [createBarrier()];
  nextSpawnDistance = random(minDistanceBetweenPipes, width - width/4);
  startingSpeed = 4;
  //nextSpawnDistance = random(width, width * 2);
  loop();
} 

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
  // score is the global pipe-pass count
  if (isGameOver) {
    if (!announcedGameOver) {
      announceStatus('Game over. Final score: ' + score + '. Press the up arrow to play again.');
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

// Each frame: scroll the parallax background, spawn barriers as needed, scroll/draw
// all barriers, check collisions and scoring (advancing the stage every 10 points),
// move/draw the bird, draw the score, and update the screen-reader status.
function draw() {
  background(220);

  landscape.update();
  landscape.draw();

  if(barriers.length <= 0 || width - barriers[barriers.length - 1].x >= nextSpawnDistance){
    barriers.push(createBarrier());
    nextSpawnDistance = random(minDistanceBetweenPipes, width * 1.2);
  }
  
  // loop through all the barriers and update them
  for(let i = barriers.length - 1; i >= 0; i--){
    barriers[i].update();
    barriers[i].draw();
    
    //if we hit the barrier, end game
    if(barriers[i].checkIfHitsBird(bird) && isInvincible == false){
      isGameOver = true;
      
      lastHiScore = hiScore;
      if(hiScore < score){
        hiScore = score;
      }
      
      noLoop(); // game is over, stop game loop
    }
    
    // if we successfully pass the barrier, increase the score
    if(barriers[i].pastBird === false && barriers[i].checkIfPastBird(bird)){
      score++;
      
      if(score % 10 == 0){
        stage++; 
      }
    }
    
    // remove barriers that have gone off the screen
    if(barriers[i].getRight() < 0){
      barriers.splice(i, 1); 
    }
  }
  
  bird.update();
  bird.draw();
  drawScore();

  // announce score / game over to screen readers
  updateScreenReaderStatus();
}

// Draw the score, stage, and hi-score, plus the game-over (with new-hi-score
// notice) or start-screen overlay when relevant.
function drawScore() {

  fill(0);
  textAlign(LEFT);
  textSize(15);
  text('Score:' + score, 10, 20);

  let stageStr = 'Stage:' + stage;
  text(stageStr, width - textWidth(stageStr) - 5, 20);
  
  if(hiScore > 0){
    let hiScoreStr = 'Hi-Score:' + hiScore;
    text(hiScoreStr, width/2 - textWidth(hiScoreStr)/2, 20);
  }

  if (isGameOver) {

    // dark overlay
    fill(0, 0, 0, 100);
    rect(0, 0, width, height);

    // draw gameover text
    textAlign(CENTER);
    textSize(35);
    fill(255);
    text('GAME OVER!', width / 2, height / 3);
    
    
    textSize(12);
    let yText = height / 2;
    
    if(hiScore > lastHiScore && hiScore > 0){
      text('New Hi-Score of ' + hiScore + '!', width / 2, yText);
      yText += 30;
    }
    
    text('Press UP ARROW to play again.', width / 2, yText);
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

// Touch (mobile) flaps the bird; delegates to mousePressed. Returns false to
// suppress the browser's default touch handling.
function touchStarted(){
  mousePressed();

  // prevent default
  return false;
}

// A tap/click flaps the bird; a right-click or two-finger touch starts the game
// the first time and restarts after game over. Returns false to suppress the
// browser's default handling.
function mousePressed(){
  bird.flap();

  if(isGameOver == true &&
    (mouseButton === RIGHT || touches.length >= 2)){
    resetGame();
  }else if(hasGameBegun == false &&
    (mouseButton === RIGHT || touches.length >= 2)){
    hasGameBegun = true;
    loop();
  }

  // prevent default
  return false;
}

// Space bar flaps the bird (and starts the game the first time); the up arrow restarts after game over.
function keyPressed(){
  if (key == ' '){ // spacebar
    bird.flap();
  }
  
  // check for special states (game over or if game hasn't begun)
  if (isGameOver == true && keyIsDown(UP_ARROW)) {
    resetGame();
  }else if(hasGameBegun == false && key == ' '){
    hasGameBegun = true;
    loop();
  } 
}



