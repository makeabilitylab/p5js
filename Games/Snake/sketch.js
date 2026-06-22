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

// Slow the frame rate to a playable pace, build the grid (which sizes the
// canvas), then create the snake and first food piece.
function setup() {
  frameRate(4); // game steps 4 times per second (one snake move per frame)
  textFont(arcadeFont);
  //textFont('Coiny');

  grid = new Grid(); // Snake is based on a grid of cells
  createCanvas(grid.getWidth(), grid.getHeight()); // the canvas is derived from grid size

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("The classic Snake game: steer a growing snake with the arrow keys to eat food while avoiding the walls and the snake's own body.");
  setupGameEntities();
}

// Create (or recreate) the snake and food at random grid locations.
function setupGameEntities() {
  snake = new Snake(grid.cellSize, grid.getRandomLoc());
  food = new Food(grid.cellSize, grid.getRandomLoc());
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
  const score = snake.getLength() - 1;
  if (isGameOver) {
    if (!announcedGameOver) {
      announceStatus('Game over. Final score: ' + score + '. Press the space bar to play again.');
      announcedGameOver = true;
    }
  } else {
    if (announcedGameOver) { // a new game just started
      announcedGameOver = false;
      lastAnnouncedScore = -1;
    }
    if (score !== lastAnnouncedScore) {
      announceStatus('Score: ' + score);
      lastAnnouncedScore = score;
    }
  }
}

// Each frame: if playing, eat-and-grow when over food, advance the snake, and
// end the game if it runs off screen; then redraw grid, food, snake, and score.
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

  // announce score / game over to screen readers
  updateScreenReaderStatus();
}

// Draw the current score (snake length minus its starting segment), plus the
// dark "GAME OVER" overlay when the game has ended.
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

// Touch input: treat a tap the same as a mouse press.
function touchStarted(){
  mousePressed();
}

// Steer the snake toward where you tapped/clicked relative to its head: the
// larger of the horizontal/vertical gaps decides the turn direction. A reversal
// into itself ends the game; a right-click / two-finger tap restarts after game over.
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

// Arrow keys turn the snake (reversing into itself ends the game); SPACE BAR
// restarts once the game is over.
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

// The playing field: a fixed grid of square cells. Defines the canvas size and
// hands out random cell-aligned positions for the snake and food.
class Grid {

  constructor() {
    this.cellSize = 20;
    this.numCols = 20;
    this.numRows = 20;
  }

  // Canvas dimensions in pixels (cell size times column/row count).
  getWidth() {
    return floor(this.cellSize * this.numCols);
  }

  getHeight() {
    return floor(this.cellSize * this.numRows);
  }

  // Pick a random cell and return its top-left corner in pixel coordinates.
  getRandomLoc() {
    let randCol = floor(random(0, this.numCols));
    let randRow = floor(random(0, this.numRows));
    return createVector(randCol * this.cellSize, randRow * this.cellSize);
  }

  // Draw the faint grid lines.
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

// A single piece of food: one red cell-sized square the snake tries to eat.
class Food {
  constructor(foodSize, loc) {
    this.size = foodSize;
    this.loc = loc;
    this.color = color(255, 0, 0);
  }

  // Draw the food as a red square.
  draw() {
    fill(255, 0, 0);
    noStroke();
    rect(this.loc.x, this.loc.y, this.size, this.size);
  }
}