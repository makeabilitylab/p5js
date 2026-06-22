// A basic snakes game: https://en.wikipedia.org/wiki/Snake_(video_game_genre)
// Use your voice to control the snake: "Up", "Left", "Right", "Down"
//
// For a version without speech input, see:
//  - https://editor.p5js.org/jonfroehlich/sketches/S327HfhYu
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
//   - [done] sound classification?
//
// TODO:
//  - add in comments: https://javascript.info/comments
//  - add code to github (and a runnable version from github.io)
//
// This p5js sketch is also on the p5js editor: 
//  - https://editor.p5js.org/jonfroehlich/sketches/VNTnGxkBH
// as well as my p5js github:
//  - https://github.com/jonfroehlich/p5js
// I try my best to keep my github and the p5js editor sync'd.


let snake;
let food;
let grid;
let arcadeFont;
let isGameOver = false;
let soundClassifier;
let classificationResults;

// Load the arcade font and set up the ml5 sound classifier. The 'SpeechCommands18w'
// model recognizes spoken words like up/down/left/right; probabilityThreshold
// means only classifications it's at least 90% confident about are reported.
function preload() {
  // I originally tried to load a font like this example, but it didn't work
  //  - Example: https://editor.p5js.org/allison.parrish/sketches/ByyxP7Gbe
  arcadeFont = loadFont('assets/arcadefont.ttf');

  let options = { probabilityThreshold: 0.9 };
  soundClassifier = ml5.soundClassifier('SpeechCommands18w', options);
}

// Build the grid/canvas and game entities, then start listening for spoken
// commands (onNewSoundClassified is called each time the model classifies audio).
function setup() {
  frameRate(2); // slow pace so there's time to react to recognized speech
  textFont(arcadeFont);
  //textFont('Coiny');

  grid = new Grid(); // Snake is based on a grid of cells
  createCanvas(grid.getWidth(), grid.getHeight()); // the canvas is derived from grid size

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("The classic Snake game controlled by your voice: say 'up', 'down', 'left', or 'right' to steer the growing snake toward food.");
  setupGameEntities();
  soundClassifier.classify(onNewSoundClassified);
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
    if (announcedGameOver) { announcedGameOver = false; lastAnnouncedScore = -1; }
    if (score !== lastAnnouncedScore) {
      announceStatus('Score: ' + score);
      lastAnnouncedScore = score;
    }
  }
}

// Each frame: show the most recent recognized word, then run the game (eat/grow,
// advance the snake, detect running off screen) and redraw everything.
function draw() {
  background(220);

  // draw classification
  if(classificationResults){
    push();
    textSize(60);
    noStroke();
    fill(70, 70, 70, 70);
    let classifiedSpeech = classificationResults[0].label; 
    let strWidth = textWidth(classifiedSpeech);
    text(classifiedSpeech, width / 2 - strWidth / 2, height / 2);

    pop();
  }

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
  push();
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
  pop();
}

// Arrow keys also steer the snake (reversing into itself ends the game); SPACE
// BAR restarts once the game is over.
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

// ml5 callback fired whenever the sound classifier produces a result. results
// are sorted most-confident-first; we steer the snake based on the top label
// (up/down/left/right) and stash the results so draw() can display the word.
function onNewSoundClassified(error, results){
  // Display error in the console
  if (error) {
    console.error(error);
  }

  let hasRunIntoSelf = false;
  if(results[0].label == "left"){
    hasRunIntoSelf = !snake.setDir(DIRECTION.LEFT);
  }else if(results[0].label == "right"){
    hasRunIntoSelf = !snake.setDir(DIRECTION.RIGHT);
  }else if(results[0].label == "up"){
    hasRunIntoSelf = !snake.setDir(DIRECTION.UP);
  }else if(results[0].label == "down"){
    hasRunIntoSelf = !snake.setDir(DIRECTION.DOWN);
  }
  
  if (hasRunIntoSelf){
    isGameOver = true;  
  }
  
  classificationResults = results;
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