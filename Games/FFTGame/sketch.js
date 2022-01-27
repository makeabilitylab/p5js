// In this interactive sound game, we use the frequency components of sound (as computed by
// an FFT) to propel a ball into falling stars. This was maybe my ~3rd or 4th p5js sketch ever! :)
//
// By Jon Froehlich
// http://makeabilitylab.io
//
// See:
//  - https://p5js.org/examples/sound-frequency-spectrum.html
//
// The mario sounds are from:
//  - https://themushroomkingdom.net/media/smw/wav
//  - http://soundfxcenter.com/video-games/super-mario-bros/8d82b5_Super_Mario_Bros_Coin_Sound_Effect.mp3
// TODO:
//  - have a ball that you try to get in a basket using sound. like the fft bounces it up
//    and you try to get it in a hole
//  - Improve collision detection so point actually hits ball (right now, we are treating bottom of ball as a rect)
//  - ball size could maybe change based on amplitude of sound? getLevel()?
//  - [done] maybe stars are falling? or moving?
//  - make it so ball bounces off stars?
//  - how to include more strategy? stars fall? need to save X stars before Y fall?
//  - over time, could make stars fall faster, make ball smaller, etc.
//  - HIGH PRIORITY: looks like if we share the code in full screen, it won't work due to a security setting issue:
//     -- see: https://github.com/jonfroehlich/HCID521Wi2020/issues/3
//  - Maybe make them falling notes rather than stars
//  - Maybe the notes should fall in a sine wavey fashion like a leaf?
//  - Maybe the FFT frequency distribution should inform *where* stars fall
//  - Maybe ball gets bigger or smaller with number of stars saved or lost?

let mic, fft;
let ball;
let stars = [];
let lastSpectrum = null;
let numStars = 20;
let score = 0;
let starsLost = 0;

let MAX_Y_VELOCITY = 100;
let DEFAULT_BALL_DIAMETER = 50;

let starHitSound;
let starLostSound;
let hasStarted = false;

function setup() {
  createCanvas(1024, 600);
  noFill();

  mic = new p5.AudioIn();
  mic.start();
  fft = new p5.FFT();
  fft.setInput(mic);

  ball = new Ball(width / 10, height / 2, DEFAULT_BALL_DIAMETER);

  //   let spectrum = fft.analyze();
  //   print("The spectrum length is: ", spectrum.length);
  //   print(mic);
  //   print(sampleRate()); // https://p5js.org/reference/#/p5/sampleRate
  for (let i = 0; i < numStars; i++) {
    let star = generateStar();
    stars.push(star);
  }
  
  starHitSound = loadSound('super_mario_bros_coin.mp3');
  starLostSound = loadSound('smw_stomp.wav');
}

function generateStar() {
  let size = random(30, 100);
  let x = random(size / 2, width - size / 2);
  let y = random(-300, -100);
  return new Star(x, y, size);
}

function draw() {
  background(20);

  if(!hasStarted){
    // We must force a mouse click to get past Chrome's security permissions
    // for listening to or playing audio: https://developer.chrome.com/blog/autoplay/#webaudio
    drawStartGameText();
  }else{
    // dynamically scale based on ball height
    if (ball.y < 0) {
      let totalHeight = height + abs(ball.y);
      let scaleFactor = height / totalHeight;
      translate(0, abs(ball.y));
      scale(scaleFactor);
    }

    // draw slight grid (to enable zoom feeling)
    drawGrid();
    drawScore();
    // draw star
    // - some links: https://p5js.org/examples/form-star.html
    // - https://p5js.org/examples/hello-p5-simple-shapes.html


    let spectrum = fft.analyze();

    // draw the frequency spectrum
    noFill();
    stroke(200);
    beginShape();
    for (i = 0; i < spectrum.length; i++) {
      vertex(i, map(spectrum[i], 0, 255, height, 0));
    }
    endShape();

    // check if the frequency spectrum hit our ball!
    if (lastSpectrum != null) {

      // calculate the difference between this spectrum and the last one 
      // we'll use this to calculate and estimate of force against the ball
      let diffSpectrum = []
      for (let i = 0; i < spectrum.length; i++) {
        let diff = spectrum[i] - lastSpectrum[i];
        diffSpectrum.push(diff);
      }

      // find the maximum spectrum value undernear the ball (we currently treat the entire bottom of
      // the ball as a flat line)
      let maxSpectrumValUnderBall = -1;
      let maxSpectrumIndex = -1;
      for (let i = floor(ball.x - ball.width / 2); i < floor(ball.x + ball.width / 2); i++) {
        if (maxSpectrumValUnderBall < spectrum[i]) {
          maxSpectrumValUnderBall = spectrum[i];
          maxSpectrumIndex = i;
        }
      }

      // calculate the difference at the maximum spectrum index under the ball 
      let ySpectrumValAtBall = map(spectrum[maxSpectrumIndex], 0, 255, height, 0);
      let yDiffAtBall = diffSpectrum[maxSpectrumIndex];
      let xDiffAtBall = ball.x - maxSpectrumIndex;

      ball.update(ySpectrumValAtBall, yDiffAtBall, xDiffAtBall);
    }

    for (let i = 0; i < stars.length; i++) {
      stars[i].update();
      if (stars[i].hasBeenHit == false && stars[i].collision(ball)) {
        stars[i].explode();
        starHitSound.play();
        score++;
      }
      
      if(stars[i].isLost){
        starLostSound.play();
        stars[i] = generateStar();
        starsLost++;
      }
      else if (stars[i].hasExplosionCompleted) {
        stars[i] = generateStar();
      }
      
      stars[i].draw();
    }

    ball.draw();

    lastSpectrum = spectrum;
  }
}

function mouseClicked() {
  hasStarted = true;
}

function drawStartGameText(){
  push();
  fill(255);
  noStroke();
  textAlign(CENTER);
  textSize(40);
  text('Click anywhere to start the game', width / 2, height / 3);
  pop();
}

function drawScore(){
  push();
  fill(255, 255, 255, 200);
  textAlign(LEFT);
  textSize(20);
  text('Saved: ' + score + "  Lost: " + starsLost, 10, 33);
  pop();

//   if (isGameOver) {

//     // dark overlay
//     fill(0, 0, 0, 100);
//     rect(0, 0, width, height);

//     // draw game over text
//     textAlign(CENTER);
//     textSize(35);
//     fill(255);
//     text('GAME OVER!', width / 2, height / 3);
    
//     textSize(12);
//     text('Press SPACE BAR to play again.', width / 2, height / 2);
//   } 
}

function drawGrid() {
  let gridCellSize = 20;
  stroke(100, 100, 100, 40);
  let startY = -height * 2;
  let endX = width * 2;
  for (let col = 0; col < endX; col += gridCellSize) {
    line(col, startY, col, height);
  }

  for (let row = startY; row < height; row += gridCellSize) {
    line(0, row, endX, row);
  }
}

class Star extends Shape {
  
  constructor(x, y, diameter) {
    super(x, y, diameter, diameter);
    this.npoints = floor(random(5, 10));
    let radius = diameter / 2;
    this.radius1 = random(5, radius / 2);
    this.radius2 = radius;
    this.scaleVal = 1;
    this.hasBeenHit = false;
    this.hasExplosionCompleted = false
    this.isLost = false;
    this.fillColor = color(255, 255, 102, 150);
    this.rotationSpeed = random(25, 150); // higher is slower
    this.gravity = random(0.01, 0.2);
    this.yVelocity = 0;
  }

  explode() {
    this.hasBeenHit = true;
  }

  update() {
    this.yVelocity += this.gravity;
    this.yVelocity *= 0.9; // some air resistance
    this.y += this.yVelocity;
    
    if (this.hasBeenHit) {
      this.scaleVal = max(0, this.scaleVal - 0.1);
      let a = max(0, alpha(this.fillColor) - 1);
      this.fillColor = color(red(this.fillColor), green(this.fillColor),
        blue(this.fillColor), a);

      if (this.scaleVal <= 0) {
        this.hasExplosionCompleted = true;
      }
    }
    
    if (this.getTop() > height){
      this.isLost = true;
    }
  }

  draw() {
    let angle = TWO_PI / this.npoints;
    let halfAngle = angle / 2.0;
    push();
    noStroke();
    fill(this.fillColor);
    beginShape();
    let x = this.x + this.width / 2;
    let y = this.y + this.height / 2;
    
    translate(x, y);
    rotate(frameCount / this.rotationSpeed);
    scale(this.scaleVal);
    for (let a = 0; a < TWO_PI; a += angle) {
      let sx = cos(a) * this.radius2;
      let sy = sin(a) * this.radius2;
      vertex(sx, sy);
      sx = cos(a + halfAngle) * this.radius1;
      sy = sin(a + halfAngle) * this.radius1;
      vertex(sx, sy);
    }
    endShape(CLOSE);
    pop();

    super.draw();
  }
}

class Ball extends Shape {
  constructor(x, y, diameter) {
    super(x, y, diameter, diameter);

    this.gravity = 1;
    this.yVelocity = 0;
    this.xVelocity = 0;
  }

  getDiameter() {
    return this.width;
  }

  update(ySpectrumVal, ySpectrumVel, xSpectrumVel) {

    // check to see if the new yVal is less than the current ball position
    // if so, we should accept this new value (as the spectrum spike hit our ball!)
    if (ySpectrumVal < this.y) {
      this.y = ySpectrumVal;
      this.yVelocity = -ySpectrumVel;

      this.xVelocity = xSpectrumVel;
      //print("newYVal", ySpectrumVal, "yVel", ySpectrumVel, "xVel", this.xVelocity);
    }

    this.yVelocity += this.gravity; // apply some downward gravity
    this.yVelocity *= 0.9; // some air resistance

    // ensure we don't go too fast
    if (this.yVelocity < -MAX_Y_VELOCITY) {
      this.yVelocity = -MAX_Y_VELOCITY;
      print("over max velocity");
    }

    // add in our velocity
    this.y += this.yVelocity;
    this.x += this.xVelocity;

    // check for running off the left and right edges of the screen
    if (this.getLeft() < 0 || this.getRight() > width) {
      this.xVelocity *= -0.95; //reverse direction and slow down a bit 

      // make sure ball doesn't get stuck on the edge accidentally
      if (this.getLeft() < 0) {
        this.x += 1;
      } else if (this.getRight() > width) {
        this.x -= 1;
      }
    }

    // check for the bottom of the screen and make ball bounce a bit
    if (this.getBottom() > height) {

      this.yVelocity *= -0.95; // bounces on ground 
      this.y = height - this.getDiameter();

      this.xVelocity *= 0.95; // give the floor some friction
    }
  }

  draw() {
    push();
    ellipseMode(CORNER);
    fill(255, 0, 200);
    ellipse(this.x, this.y, this.width);
    pop();
    
    super.draw();
  }

}