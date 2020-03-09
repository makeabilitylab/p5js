// A basic pong game: https://en.wikipedia.org/wiki/Pong
//
// By Jon Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//
// Feel free to use this source code for inspiration or in your
// own projects. If you do, I'd love to hear about it. Email me
// at jonf@cs.uw.edu or Tweet @jonfroehlich.
//
// Loosely based on Daniel Shiffman's 'Pong' coding challenge
//  - https://thecodingtrain.com/CodingChallenges/067-pong.html
//  - https://youtu.be/IIrC5Qcb2G4
// 
// As well as my own previous Pong implementation:
//  - https://git.io/JeQVp
//
// Ideas for extensions:
//  - Have a ball trail like /Demos/Graphics/Reflection2 or perhaps /Topics/Simualte/SmokeParticleSystem
//    - Have particle explosion when ball hits paddle (see /Demos/Graphics/Particles)
//      -- See also /Topics/Simulate/MultipleParticleSystems
//  - Randomly cut paddle in half to make it harder? Or maybe do this when other team is ahead?
//  - Release multiple balls into game play (maybe ball splits sometimes when it hits paddle?)
//  - Add in directional lighting (see /Basics/Directional)
//  - Could use an animated sprite as a ball (see /Topics/Animation/AnimatedSprite)
//  - Perhaps a bouncing ball/rectangle (or more than one) is injected into gameplay and pong ball bounces off of it
//  - record sound of four or five different ball knocking sounds and use them randomly when paddle hits ball
//  - Use mouse or keyboard as input?
//
// This p5js sketch is also on the p5js editor: 
//  - https://editor.p5js.org/jonfroehlich/sketches/d3j3sRttP
// as well as my p5js github:
//  - https://github.com/jonfroehlich/p5js
// I try my best to keep my github and the p5js editor sync'd.

let ball;
let paddleLeft;
let paddleRight;
let isBallActive = false;
let isGameOver = false;

let scoreLeft = 0;
let scoreRight = 0;
let endScore = 2; // game will end when one side achieves this score

const PADDLE = {
  LEFT: 'left',
  RIGHT: 'right',
}

function setup() {
  createCanvas(600, 600);
  ball = new Ball(50, 50, 20, 20);

  let paddleWidth = 20;
  let paddleHeight = 150;
  let paddleYStart = height / 2 - paddleHeight / 2;
  paddleLeft = new Paddle(0, paddleYStart, paddleWidth, paddleHeight, PADDLE.LEFT);
  paddleRight = new Paddle(width - paddleWidth, paddleYStart, paddleWidth, paddleHeight, PADDLE.RIGHT);
}

function draw() {
  background(220);

  if (isBallActive && !isGameOver) {
    ball.update();

    // check to see if ball went off edge of screen, if so
    // award the point to the correct player
    if (ball.getRight() < 0) {
      scoreRight++;
      isBallActive = false;
      ball.reset();

      print("Score: ", scoreLeft, " to ", scoreRight);
    } else if (ball.getLeft() > width) {
      scoreLeft++;
      isBallActive = false;
      ball.reset();

      print("Score: ", scoreLeft, " to ", scoreRight);
    }

    if (scoreLeft >= endScore || scoreRight >= endScore) {
      isGameOver = true;
    }
  }

  paddleLeft.update(ball);
  paddleRight.update(ball);


  ball.draw();
  paddleLeft.draw();
  paddleRight.draw();

  drawGameboard(); // draws score, instructions, etc.
}

function drawGameboard() {

  // draw midpoint line. to make it a dashed line, see:
  // https://github.com/processing/p5.js/issues/3336#issuecomment-441457612
  strokeWeight(1);
  stroke(0);
  drawingContext.setLineDash([5, 15]);
  line(width / 2, 0, width / 2, height);
  drawingContext.setLineDash([]);

  // draw the score
  noStroke();
  fill(50, 50, 50, 128);

  textAlign(LEFT);
  textSize(30);
  strHeight = textAscent() + textDescent();
  strWidth = textWidth(scoreLeft);
  xPos = width / 2.0 - strWidth - 20;
  text(scoreLeft, xPos, 10 + strHeight - textDescent() - 2);

  strWidth = textWidth(scoreRight);
  xPos = width / 2.0 + 20;
  text(scoreRight, xPos, 10 + strHeight - textDescent() - 2);

  // check to see if ball is active, if not, draw instructions
  if (isGameOver) {
    
    fill(0, 0, 0, 128);
    rect(0, 0, width, height);
    
    textAlign(CENTER);
    textSize(25);
    fill(255, 255, 255, 240);
    let winMsg = ""
    if (scoreLeft >= endScore) {
      winMsg = "Left Player";
    } else {
      winMsg = "Right Player";
    }
    winMsg += " wins!";
    text(winMsg, width / 2, height / 2);

    textSize(12);
    text('Press SPACE BAR to play again', width / 2, height / 2 + 20);
  } else if (isBallActive == false && scoreLeft == 0 && scoreRight == 0) {

    fill(0, 0, 0, 128);
    rect(0, 0, width, height);

    textAlign(CENTER);
    textSize(25);
    fill(255, 255, 255, 240);
    text("Press SPACE BAR to begin!", width / 2, height / 2);

    textSize(12);
    text('Left Player: UP & DOWN | Right Player: LEFT & RIGHT', width / 2, height / 2 + 20);
  } 

  stroke(0);
  strokeWeight(1);
}

function keyPressed() {
  if (isGameOver && key == ' ') {
    // if the game is over and SPACEBAR pressed, reset game
    scoreLeft = 0;
    scoreRight = 0;

    isGameOver = false;
    isBallActive = true;

    ball.launch();
  } else if (isBallActive == false && key == ' ') {
    // if ball is not active and SPACEBAR pressed, launch ball
    isBallActive = true;
    ball.launch();
  }
  
  //print(key);
}