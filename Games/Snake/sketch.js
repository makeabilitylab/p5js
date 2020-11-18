// A basic snakes game: https://en.wikipedia.org/wiki/Snake_(video_game_genre)
// This is my very first p5js project! :)
//
// A version of this lives on the p5js editor: 
//  - https://editor.p5js.org/jonfroehlich/sketches/S327HfhYu
// as well as my p5js github:
//  - https://github.com/jonfroehlich/p5js
// I try my best to keep my github and the p5js editor sync'd.
//
// By Jon Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//
// Feel free to use this source code for inspiration or in your
// own projects. If you do, I'd love to hear about it. Email me
// at jonf@cs.uw.edu or Tweet @jonfroehlich.
//
// Based on Daniel Shiffman's 'Snake Game Redux'
//  - https://thecodingtrain.com/CodingChallenges/115-snake-game-redux.html
//  - https://youtu.be/OMoVcohRgZA
//
// The arcade font is a Google Open Font
//  - https://fonts.google.com/specimen/Press+Start+2P?selection.family=Press+Start+2P
//
// Ideas for extensions:
//   - Let a bot control another snake
//   - have a fluid that moves around when snake goes through it
//   - make Snake2 with two player (wasd and arrows)
//   - make game faster (harder) as snake grows (just update frame rate?)
//   - have more than one food piece?
//   - have walls?
//
// Experiment with input
//   - whistling?
//   - posenet?
//   - sound classification?
//
// TODO:
//  - add in comments: https://javascript.info/comments
//  - add code to github (and a runnable version from github.io)?

let snake;
let food;
let grid;
let arcadeFont;
let isGameOver = false;

function preload() {
  // I originally tried to load a font like this example, but it didn't work
  //  - Example: https://editor.p5js.org/allison.parrish/sketches/ByyxP7Gbe
  arcadeFont = loadFont('assets/arcadefont.ttf');
}

function setup() {
  frameRate(4);
  textFont(arcadeFont);
  //textFont('Coiny');
  
  grid = new Grid(); // Snake is based on a grid of cells
  createCanvas(grid.getWidth(), grid.getHeight()); // the canvas is derived from grid size
  setupGameEntities();
}

function setupGameEntities() {
  snake = new Snake(grid.cellSize, grid.getRandomLoc());
  food = new Food(grid.cellSize, grid.getRandomLoc());
}

function draw() {
  background(220);

  if (isGameOver == false) {
    if (snake.isOverFood(food)) {
      food = new Food(grid.cellSize, grid.getRandomLoc());
      snake.grow();
    }

    snake.update();
    if (snake.checkRanOffScreen()) {
      isGameOver = true;
    }
  }

  grid.draw();
  food.draw();
  snake.draw();

  // draw the score
  drawScore();
}

function drawScore() {

  fill(0);
  textAlign(LEFT);
  textSize(15);
  text('Score:' + (snake.getLength() - 1), 10, 20);

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
  }
}

function touchStarted(){
  print("touchStarted: ", mouseX, mouseY);
  mousePressed();
  
}

function mousePressed(){
  let snakeHead = snake.getHead();
  let diffY = abs(mouseY - snakeHead.y);
  let diffX = abs(mouseX - snakeHead.x);
  let hasRunIntoSelf = false;
  
  if(mouseY < snakeHead.y && diffY >= diffX){
    hasRunIntoSelf = !snake.setDir(DIRECTION.UP);
  }else if(mouseY > snakeHead.y && diffY >= diffX){
    hasRunIntoSelf = !snake.setDir(DIRECTION.DOWN);
  }else if(mouseX > snakeHead.x){
    hasRunIntoSelf = !snake.setDir(DIRECTION.RIGHT);
  }else if(mouseX < snakeHead.x){
    hasRunIntoSelf = !snake.setDir(DIRECTION.LEFT);
  }

  if (hasRunIntoSelf){
    isGameOver = true;  
  }

  if (isGameOver == true && 
    (mouseButton === RIGHT || touches.length >= 2)) {
    setupGameEntities();
    isGameOver = false;
  }
}

function keyPressed() {
  let hasRunIntoSelf = false;
  switch (keyCode) {
    case LEFT_ARROW:
      hasRunIntoSelf = !snake.setDir(DIRECTION.LEFT);
      break;
    case RIGHT_ARROW:
      hasRunIntoSelf = !snake.setDir(DIRECTION.RIGHT);
      break;
    case UP_ARROW:
      hasRunIntoSelf = !snake.setDir(DIRECTION.UP);
      break;
    case DOWN_ARROW:
      hasRunIntoSelf = !snake.setDir(DIRECTION.DOWN);
      break;
  }
  
  if (hasRunIntoSelf){
    isGameOver = true;  
  }

  if (isGameOver == true && key === ' ') {
    setupGameEntities();
    isGameOver = false;
  }
}

class Grid {

  constructor() {
    this.cellSize = 20;
    this.numCols = 20;
    this.numRows = 20;
  }

  getWidth() {
    return floor(this.cellSize * this.numCols);
  }

  getHeight() {
    return floor(this.cellSize * this.numRows);
  }

  getRandomLoc() {
    let randCol = floor(random(0, this.numCols));
    let randRow = floor(random(0, this.numRows));
    return createVector(randCol * this.cellSize, randRow * this.cellSize);
  }

  draw() {
    // mainly for debugging
    stroke(144, 144, 144, 100);
    for (let col = 0; col < this.numCols; col++) {
      let xLoc = floor(col * this.cellSize);
      line(xLoc, 0, xLoc, height);
    }

    for (let row = 0; row < this.numRows; row++) {
      let yLoc = floor(row * this.cellSize);
      line(0, yLoc, width, yLoc);
    }
  }
}

class Food {
  constructor(foodSize, loc) {
    this.size = foodSize;
    this.loc = loc;
    this.color = color(255, 0, 0);
  }

  draw() {
    fill(255, 0, 0);
    noStroke();
    rect(this.loc.x, this.loc.y, this.size, this.size);
  }
}