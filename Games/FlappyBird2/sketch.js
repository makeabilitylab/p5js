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

function preload() {
  arcadeFont = loadFont('assets/arcadefont.ttf');
}

function setup() {
  createCanvas(600, 400);
  minDistanceBetweenPipes = width / 3;
  textFont(arcadeFont); 
  
  resetGame();
  
  // stop game loop until space bar hit to begin
  noLoop(); 
}

function createBarrier(){
  return new Barrier(startingSpeed + stage * 0.5, stage - 0.5); 
}

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
}

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

function touchStarted(){
  print("touchStarted with " + touches.length + " touches");
  
  mousePressed();
  
  // prevent default
  return false;
}

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

  print("mousePressed: mouseButton = " + mouseButton);

  // prevent default
  return false;
}

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



