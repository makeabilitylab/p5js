// This sketch detects a hand wave and angle using the HandPose implementation in ml5js
//  - https://learn.ml5js.org/#/reference/handPose
//
// ml5js is a Machine Learning JavaScript library that provides an easy-to-use API
// for machine learning. See: https://ml5js.org/
// 
// By Jon E. Froehlich
// UW CSE Professor
// http://makeabilitylab.cs.uw.edu
//
// TODO: 
//  - [done] calculate and show a tighter bounding box; the one from handPose model seems large (unless I have a bug)
//  - [done] calculate angle from palm to middle finger to determine angle of hand?
//  - use hand angle to calculate wave rate
//  - to determine wave:
//    - first, check to see if hand is mostly open. if so, consider this wave stance.
//      to do this, could check the landmarks for each finger and deviation from a straight
//      line from palm to end of finger. another way, simply check that end finger points
//      are on top of all other points
//    - second, determine angle of wave

let handPoseModel;
let video;
let hand;

function setup() {
  createCanvas(640, 480);
  hand = new Hand();
  video = createCapture(VIDEO);
  // video.size(width, height);

  handPoseModel = ml5.handpose(video, onHandPoseModelReady);

  // Call onNewHandPosePrediction every time a new handPose is predicted
  handPoseModel.on("predict", onNewHandPosePrediction);

  // Hide the video element, and just show the canvas
  video.hide();

  hand.on(Hand.EVENT_ENTERED_HAND_WAVE_POSITION, onHandWavePositionEntered);
  hand.on(Hand.EVENT_EXITED_HAND_WAVE_POSITION, onHandWavePositionExited);
  hand.on(Hand.EVENT_NEW_HAND_WAVE_DETECTED, onHandWaveDetected);
  hand.on(Hand.EVENT_NEW_HAND_WAVE_ANGLE, onNewHandWaveAngle);
}

function onHandWaveDetected(contiguousHandWaveCount, overallHandWaveCount){
  console.log(`onHandWaveDetected: contiguousHandWaveCount=${contiguousHandWaveCount}, overallHandWaveCount=${overallHandWaveCount}`);
}

function onNewHandWaveAngle(handWaveAngle){
  console.log("onNewHandWaveAngle", handWaveAngle);
}

function onHandWavePositionEntered(){
  console.log("onHandWavePositionEntered");
}

function onHandWavePositionExited(){
  console.log("onHandWavePositionExited");
}

function onHandPoseModelReady() {
  console.log("HandPose model ready!");
  document.getElementById("status").style.display = "none";
}

/**
 * Called by ml5js HandPose library
 * 
 * @param {*} predictions 
 */
function onNewHandPosePrediction(predictions) {
  hand.setNewHandPose(predictions);
}

function draw() {

  // Draw the video to the screen
  image(video, 0, 0, width, height);

  // Draw debug info
  fill(255);
  noStroke();
  const yTextHeight = 15;
  let yDebugText = 15;
  let xDebugText = 6;
  text("fps: " + nfc(frameRate(), 1), xDebugText, yDebugText);

  yDebugText += yTextHeight;
  if (!hand.hasHandPose) {
    text("Hand detected: false", xDebugText, yDebugText);
  } else {
    text("Hand detected: true", xDebugText, yDebugText);
    yDebugText += yTextHeight;
    let handPoseDetectionsPerSecond = hand.contiguousHandPoseDetections / (millis() - hand.timestampFirstContiguousHandPoseDetection) * 1000;
    text("Hand detections / sec: " + nfc(handPoseDetectionsPerSecond, 1), xDebugText, yDebugText);
  }

  hand.draw();
}