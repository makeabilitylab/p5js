// A more sophisticated version of the Cookie Monster game 
// 
// See also previous Cookie Monster prototypes:
// - Cookie Monster 1: https://editor.p5js.org/jonfroehlich/sketches/YPT_BMxFI
// - Cookie Monster 2: https://editor.p5js.org/jonfroehlich/sketches/jV9diy_FD
//
// By Jon Froehlich
// http://makeabilitylab.io
// 
// See:
//  - https://learning.oreilly.com/library/view/make-getting-started/9781457186769/ch05.html#response
//
// Ideas for Extension:
// - make it coffee monster, so it's not a cookie, it's coffee?
// - [done] add in cookie monster who "chases" me and also eats cookies
// - [done] track cookie monster score too
// - [done] if cookie monster touches avatar, game over?
// - [done] add in sound effects
//   -- [done] cookie monster sounds here: https://www.soundboard.com/sb/Cookie_Monster_Soundboard
//   -- [done] bite sound effect: https://youtu.be/B3vkzRdp9vU
// - make it so cookie has to actually go in the mouth (rather than just head)
// - [done] use game font
// - [done] add in more than one cookie at a time?
// - [done] grow the avatar everytime he eats a cookie? same with cookie monster?
//   this will make game more challenging over time
// - support two player! (so have two heads, of different types?)
//   or G's idea was to control Cookie Monster! (which is a good idea!)
// - Control eating by using ml5js (or face keypoint identification) to recognize open mouth
// - another idea is to add in another kind of cookie that when you eat it,
//   gives you a super power (For example, shrinks cookie monster down or makes you fast, or makes cookie monster run from you)
// - have crumbs fall when cookie eaten
// - incorporate speech for input
// - give player a health bar
// - let player upload their own picture (one open mouth, one closed) 
// - let player upload two pictures for cookie monster avatar too (could be another person's head_
// - [done] fix bug where cookie monster gets stuck

let avatar;
let cookieMonster;
let cookies;

let imgBackground;

let hasGameBegun = false;
let isGameOver = false;
let drawDebugInfo = false; // set to true to turn on debug
let isInvincible = true; // set to true to make avatar invincible

let maxCookies = 4;

let hiScore = -1;
let lastHiScore = -1;

function preload() {
  arcadeFont = loadFont('assets/arcadefont.ttf');

  // create the game characters
  avatar = new Avatar();
  cookieMonster = new CookieMonster();

  imgBackground = loadImage('assets/sesame_street_background.jpg');
}

function setup() {
  createCanvas(650, 500);
  textFont(arcadeFont);
  frameRate(8);

  resetGame();
 
  noLoop();
}

function resetGame() {
  // start with only one cookie
  cookies = [new Cookie()]
  
  avatar = new Avatar();
  avatar.moveToStartPosition();
  cookieMonster = new CookieMonster();
  cookieMonster.moveToStartPosition();
  isGameOver = false;
  loop();
}

function draw() {
  background(255);

  tint(180, 100);
  image(imgBackground, 0, 0);
  noTint();
  
  // move avatar when key remains pressed
  if (keyIsDown(LEFT_ARROW)) {
     avatar.moveDir(DIRECTION.LEFT);
  } else if (keyIsDown(RIGHT_ARROW)) {
     avatar.moveDir(DIRECTION.RIGHT);
  }
  
  if (keyIsDown(DOWN_ARROW)) {
     avatar.moveDir(DIRECTION.DOWN);
  } else if (keyIsDown(UP_ARROW)) {
    avatar.moveDir(DIRECTION.UP);
  }

  for (let cookie of cookies) {
    cookie.draw();

    if (avatar.contains(cookie.x, cookie.y)) {
      print("Yum!");
      avatar.ateCookie();
      cookie.relocate();

      // every 5 cookies, add a new cookie
      if (avatar.numCookiesEaten % 5 == 0 &&
        cookies.length < maxCookies) {
        print("Adding a new cookie!");
        cookies.push(new Cookie());
      }
    } else if (cookieMonster.contains(cookie.x, cookie.y)) {
      cookieMonster.ateCookie();
      cookie.relocate();
    }
  }

  cookieMonster.update();
  cookieMonster.draw();

  if (cookieMonster.overlaps(avatar) && !isInvincible) {
    print("Game Over!");
    noLoop();
    cookieMonster.playThankYouSound();
    isGameOver = true;


    lastHiScore = hiScore;
    if (hiScore < avatar.numCookiesEaten) {
      hiScore = avatar.numCookiesEaten;
    }
  }

  drawScore();
}

function drawScore() {
  push();

  avatar.draw();
  textSize(15);

  // draw avatar score
  text("Score:" + avatar.numCookiesEaten, 10, 20);

  // draw cookie monster score
  let cookieMonsterScoreStr = 'Cookie Monster:' + cookieMonster.numCookiesEaten;
  text(cookieMonsterScoreStr, width - textWidth(cookieMonsterScoreStr) - 8, 20);

  if (isGameOver) {

    // dark overlay
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    // draw gameover text
    textAlign(CENTER);
    textSize(35);
    fill(255);
    text('GAME OVER!', width / 2, height / 3);


    textSize(12);
    let yText = height / 2;

    if (hiScore > lastHiScore && hiScore > 0) {
      text('New Hi-Score of ' + hiScore + '!', width / 2, yText);
      yText += 30;
    }

    text('Press SPACE BAR to play again.', width / 2, yText);
  } else if (hasGameBegun == false) {
    // if we're here, then the game has yet to begin for the first time

    // dark overlay
    fill(0, 0, 0, 180);
    rect(0, 0, width, height);

    // draw game over text
    textAlign(CENTER);
    textSize(18);
    fill(255);
    text('Use CURSOR KEYS to eat cookies\nand avoid Cookie Monster!', width / 2, height / 3);

    textSize(15);
    text('Press ANY KEY to begin', width / 2, height / 2);
  }
  pop();
}

function mousePressed(){
  if(hasGameBegun){
    //add new cookie on mouse press
    let cookie = new Cookie();
    cookie.x = mouseX;
    cookie.y = mouseY;
    cookies.push(cookie);
  }
}

function keyPressed() {
  //print(keyCode, key);
  if (hasGameBegun == false) {
    hasGameBegun = true;
    loop();
    return;
  }

  if (key == ' ' && isGameOver == true) {
    resetGame();
    return;
  }

  if (key == ' ') { // jump
    avatar.jump();
  }
  
  if (keyCode == LEFT_ARROW) {
    avatar.moveDir(DIRECTION.LEFT);
  } else if (keyCode == RIGHT_ARROW) {
    avatar.moveDir(DIRECTION.RIGHT);
  } else if(keyCode == DOWN_ARROW){
    avatar.moveDir(DIRECTION.DOWN);
  }else if(keyCode == UP_ARROW){
    avatar.moveDir(DIRECTION.UP);
  }
}