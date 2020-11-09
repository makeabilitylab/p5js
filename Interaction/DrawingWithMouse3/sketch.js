// A painting example with the mouse. The paint brush 
// size is determined by mouse speed, the color by the mouse's
// X location, and the fill vs. stroke by mouse press or not.
//
// By Jon Froehlich
// http://makeabilitylab.io
// 
// See:
//  - https://medium.com/comsystoreply/introduction-to-p5-js-9a7da09f20aa
//  - https://learning.oreilly.com/library/view/make-getting-started/9781457186769/ch05.html#response


let diameter = 20;
const SPACEBAR_KEYCODE = 32;

function setup() {
  createCanvas(600, 400);
  background(204);
  colorMode(HSB);
  noStroke();
}

function draw() {
  let hue = map(mouseX, 0, width, 0, 360);
  if(mouseIsPressed == true || keyIsDown(SPACEBAR_KEYCODE)){
    noFill();
    strokeWeight(3);
    stroke(hue, 70, 80, 0.8);
  }else{
    noStroke();
    fill(hue, 70, 80, 0.8); 
  }
  
  // set the diameter of the circle based on the distance
  // between the previous mouse points and current mouse points
  diameter = dist(mouseX, mouseY, pmouseX, pmouseY);
    
  ellipse(mouseX, mouseY, diameter);
  
  // if(keyIsDown(SPACEBAR_KEYCODE)){
  //   print("Space bar is down"); 
  // }else{
  //   print("Space bar is NOT down"); 
  // }
}

function keyPressed(){
  if(key != ' '){
    colorMode(RGB);
    background(204);
    colorMode(HSB);
  }
}

