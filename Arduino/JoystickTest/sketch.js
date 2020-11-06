// This sketch shows the joystick and button values from the Arduino sketch
// entitled '4Button2AxisJoystick.ino' and found here:
//  - https://github.com/jonfroehlich/arduino/tree/master/GameController/4Button2AxisJoystick
//
// It will work with any Arduino program that uses Mouse.move() and Keyboard.press()
// commands. For the keyboard, we've currently hooked up the arrow keys to the four
// directional buttons.
//
// By Jon Froehlich
// @jonfroehlich
// http://makeabilitylab.io
// 

const SPACEBAR_KEYCODE = 32;
let smallButtonSize = 35;
let unpressedColor;
let pressedColor;
let prevMouseX;
let prevMouseY;

let mouseXDelta = 0;
let mouseYDelta = 0
let lastMouseMoveTimestamp;

function setup() {
  createCanvas(700, 300);
  
  unpressedColor = color(255);
  pressedColor = color(50);
  
  prevMouseX = mouseX;
  prevMouseY = mouseY;
  mouseMoveTimestamp = millis();
}

function draw() {
  background(180);
  
  let yUpButton = height * 0.3;
  let xUpButton = width * 0.8;
  fill(getButtonStateColor(UP_ARROW));
  circle(xUpButton, yUpButton, smallButtonSize); 
  
  let yDownButton = height * 0.7;
  let xDownButton = xUpButton;
  fill(getButtonStateColor(DOWN_ARROW));
  circle(xDownButton, yDownButton, smallButtonSize); 
  
  let yLeftButton = height * 0.5;
  let xLeftButton = xUpButton - 1.6 * smallButtonSize;
  fill(getButtonStateColor(LEFT_ARROW));
  circle(xLeftButton, yLeftButton, smallButtonSize); 
  
  let yRightButton = yLeftButton;
  let xRightButton = xUpButton + (xUpButton - xLeftButton);
  fill(getButtonStateColor(RIGHT_ARROW));
  circle(xRightButton, yRightButton, smallButtonSize);
  
  
  // 
  let baseJoystickSize = 150;
  let joystickPosSize = 40;
  let baseJoystickX = width * 0.2;
  let baseJoystickY = height / 2;
  fill(255);
  circle(baseJoystickX, baseJoystickY, baseJoystickSize);
  
  if(millis() - lastMouseMoveTimestamp > 200){
    mouseXDelta = 0;
    mouseYDelta = 0;
    prevMouseX = mouseX;
    prevMouseY = mouseY;
  }
  
  if(abs(mouseXDelta) > 0 || abs(mouseYDelta) > 0){
    fill(0);
    let x = baseJoystickX + mouseXDelta;
    let y = baseJoystickY + mouseYDelta;
    let distance = int(dist(baseJoystickX, baseJoystickY, x, y));
    
    if(distance > baseJoystickSize / 2){
      let angle = atan2(y - baseJoystickY, x - baseJoystickX);
      //print(angle);
      
      x = cos(angle) * baseJoystickSize/2 + baseJoystickX;
      y = sin(angle) * baseJoystickSize/2 + baseJoystickY;
    }
    
    // if(x + joystickPosSize / 2 > baseJoystickX + baseJoystickSize / 2){
    //   x = baseJoystickX + baseJoystickSize / 2 - joystickPosSize / 2
    // }else if(x - joystickPosSize / 2 < baseJoystickX - baseJoystickSize / 2){
    //   x = baseJoystickX - baseJoystickSize / 2 + joystickPosSize / 2
    // }
    
    circle(x, y, joystickPosSize);
  }else if(abs(mouseXDelta) == 0 || abs(mouseYDelta) == 0){
    fill(250);
    circle(baseJoystickX, baseJoystickY, joystickPosSize);
  }

}

function getButtonStateColor(keyCode){
  if(keyIsDown(keyCode)){
    return pressedColor; 
  }else{
    return unpressedColor; 
  }
}

function keyPressed(){
  print("keyPressed", key);
}

function mouseMoved(event) {
  lastMouseMoveTimestamp = millis();
  mouseXDelta = mouseX - prevMouseX;
  mouseYDelta = mouseY - prevMouseY;
  
  prevMouseX = mouseX;
  prevMouseY = mouseY;
  
  print(millis(), "mouseX", mouseX, "mouseY", mouseY, "mouseXDelta", mouseXDelta, "mouseYDelta", mouseYDelta); 
}