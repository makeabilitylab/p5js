// A basic flappy bird game: https://en.wikipedia.org/wiki/Flappy_Bird
// (This is my second p5js project ever!).
//
// See also my other flappy bird versions:
//  - flappybird 2: which has procedurally generated backgrounds + parallax scrolling, 
//    increasing level of difficulty as game progresses, updated pipe generation
//    https://editor.p5js.org/jonfroehlich/sketches/shtF6XFeY
//
//  - flappyarm: control flappy bird by flapping your arms (uses ml5js's posenet)
//    https://editor.p5js.org/jonfroehlich/sketches/V5iBV0lVF
//
// This p5js sketch is also on the p5js editor: 
//  - https://editor.p5js.org/jonfroehlich/sketches/sFOMDuDaw
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
//    -- I did this here: https://editor.p5js.org/jonfroehlich/sketches/V5iBV0lVF
//  - bird flaps proportional to sound input (ha, just saw that Shiffman
//    has something similar: https://www.youtube.com/watch?v=aKiyCeIuwn4)
//
// Possible TODOs:
//  - add in comments: https://javascript.info/comments
//  - add code to github (and a runnable version from github.io)
//  - add in sound effects?
//  - start easy (large openings) and get harder (small openings)
//  - [done] add in scoring (based on pipes passed)
//  - add in procedurally generated background (+ parallax scrolling)
//  - spawn pipes more randomly
//  - some pipes have multiple holes that you need to choose?
//  - track high scores and show them?

let bird;
let pipes;
let isGameOver = false;
let hasGameBegun = false; 
let score = 0;
let arcadeFont;

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

function resetGame(){
  score = 0;
  isGameOver = false; 
  
  bird = new Bird(64, height / 2);
  pipes = [new Pipe()];
  nextSpawnDistance = random(minDistanceBetweenPipes, width - width/4);
  loop();
}

function draw() {
  background(220);
  
  // this controls how often we spawn new pipes. 
  // if(frameCount % 80 == 0){ 
  //   pipes.push(new Pipe()); 
  // }
  
  if(pipes.length <= 0 || width - pipes[pipes.length - 1].x >= nextSpawnDistance){
    pipes.push(new Pipe()); 
    nextSpawnDistance = random(minDistanceBetweenPipes, width - width/5);
  }
  
  // loop through all the pipes and update them
  for(let i = pipes.length - 1; i >= 0; i--){
    pipes[i].update();
    pipes[i].draw();
    
    // if we hit the pipe, end game
    if(pipes[i].checkIfHitsBird(bird)){
      isGameOver = true;
      noLoop(); // game is over, stop game loop
    }
    
    // if we successfully pass the pipe, increase the score
    if(pipes[i].pastBird === false && pipes[i].checkIfPastBird(bird)){
      score++;
    }
    
    // remove pipes that have gone off the screen
    if(pipes[i].x + pipes[i].width < 0){
      pipes.splice(i, 1); 
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

function keyPressed(){
  if (key == ' '){ // spacebar 
    bird.flap();
  }
  
  // check for special states (game over or if game hasn't begun)
  if (isGameOver == true && key == ' ') {
    resetGame();
  }else if(hasGameBegun == false && key == ' '){
    hasGameBegun = true;
    loop();
  }
  
}

