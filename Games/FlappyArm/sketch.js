// A flappy bird game controlled by your flapping arms using ml5js's PoseNet
// implementation for human pose tracking.
//
// By Jon Froehlich
// http://makeabilitylab.io/
//
// Reference for the ml5js PoseNet implementation:
//  - https://ml5js.org/reference/api-PoseNet/
//
// Primary PoseNet library, which ml5js is using under the hood:
//  - Read this article: "Real-time Human Pose Estimation in the Browser with TensorFlow.js"
//    here: https://link.medium.com/7EBfMICUh2
//  - https://github.com/tensorflow/tfjs-models/tree/master/posenet
//
// Some code based on Daniel Shiffman's 'Flappy Bird'
//  - https://thecodingtrain.com/CodingChallenges/031-flappybird.html
//  - Video: https://www.youtube.com/watch?v=cXgA1d_E-jY
//
// As well as other 'Flappy Bird' derivatives:
//  - https://mdbrim.github.io/flappy/index.html
//
// Possible TODOs:
//  - add in sound effects?
//  - [done] start easy (large openings) and get harder (small openings)
//  - [done] add in scoring (based on pipes passed)
//  - [done] make game harder longer you play
//  - [done] add in procedurally generated background (+ parallax scrolling)
//  - [done] spawn pipes more randomly
//  - [done] some pipes have multiple holes that you need to choose?
//  - [done] track high scores and show them?
//  - [done] bird flaps with arms in PoseNet
//  - update instructions to have user flap
//  - strength of bird flap corresponds to max,min distance of arms on flap
//    as well as the speed of the flap
//  - use flap motion to start game :-)

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

let video;
let poseNet;
let human = null;
let armFlap = null;
let drawDebugInfo = false; // set to true to turn on debug info

function preload() {
  arcadeFont = loadFont('assets/arcadefont.ttf');
}

function setup() {
  createCanvas(640, 480);
  
  video = createCapture(VIDEO);
  //video.hide();
  
  minDistanceBetweenPipes = width / 2;
  textFont(arcadeFont); 
  
  resetGame();
  
  // stop game loop until space bar hit to begin
  noLoop(); 
  
  poseNet = ml5.poseNet(video, onModelReady); //call onModelReady when setup
  poseNet.on('pose', onPoseDetected); // call onPoseDetected when pose detected
}

function onModelReady() {
  print("The PoseNet model is ready...");
}

function onPoseDetected(poses) {
  // poses can contain an array of bodies (because PoseNet supports
  // recognition for *multiple* human bodies at the same time
  // however, for this demo, we are interested in only one human body
  // which is at poses[0]
  human = poses[0];
}

function createBarrier(){
  return new Barrier(startingSpeed + stage * 0.5, stage - 0.5); 
}

function resetGame(){
  score = 0;
  isGameOver = false; 
  
  landscape = new Background();
  bird = new Bird(64, height / 2);
  armFlap = new ArmFlap(bird);
  barriers = [createBarrier()];
  nextSpawnDistance = random(minDistanceBetweenPipes, width - width/4);
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
  
  armFlap.update(human);
  if(drawDebugInfo){
    drawPose();
    armFlap.draw(); 
  }
  drawScore();
}

function drawPose(){
  push();
  tint(128, 50);
  if(video){
    image(video, 0, 0); // draw the video to screen
  }

  noStroke(); // turn off drawing outlines of shapes

  //if a human has been detected, draw overlay shapes!
  if (human != null) {
  
    for (let keypoint of human.pose.keypoints) {
      fill(255, 255, 255, 50);
      ellipse(keypoint.position.x, keypoint.position.y, 5);
      textSize(10);
      text(keypoint.part, keypoint.position.x, keypoint.position.y);
    } 
  }
  pop();
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
    
    text('Press SPACE BAR to play again.', width / 2, yText);
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
 
  // check for special states (game over or if game hasn't begun)
  if (isGameOver == true && key == ' ') {
    resetGame();
  }else if(hasGameBegun == false && key == ' '){
    hasGameBegun = true;
    loop();
  } 
}



