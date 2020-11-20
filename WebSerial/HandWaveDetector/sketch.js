// This sketch detects a hand wave and angle using the Handpose implementation in ml5js
// and spits this information out on Web Serial. For the non-web serial version of this
// project, see: 
// https://github.com/makeabilitylab/p5js/tree/master/ml5js/Handpose/HandWaveDetector
//
// Or, for a live demo, see:  
// https://makeabilitylab.github.io/p5js/ml5js/Handpose/HandWaveDetector/
//
// Handpose implementation in ml5js
// https://learn.ml5js.org/#/reference/handpose
//
// ml5js is a Machine Learning JavaScript library that provides an easy-to-use API
// for machine learning. See: https://ml5js.org/
// 
// By Jon E. Froehlich
// http://makeabilitylab.io/
//

let handposeModel;
let video;
let hand;

function setup() {
  createCanvas(640, 480);
  hand = new Hand();
  video = createCapture(VIDEO);
  // video.size(width, height);

  handposeModel = ml5.handpose(video, onHandPoseModelReady);

  // Call onNewHandposePrediction every time a new handpose is predicted
  handposeModel.on("predict", onNewHandPosePrediction);

  // Hide the video element, and just show the canvas
  video.hide();

  hand.on(Hand.EVENT_ENTERED_HAND_WAVE_POSITION, onHandWavePositionEntered);
  hand.on(Hand.EVENT_NEW_HAND_WAVE_ANGLE, onNewHandWaveAngle);
}

function onNewHandWaveAngle(handWaveAngle){
  // console.log("onNewHandWaveAngle", handWaveAngle);
  serialWriteHandWaveAngle(handWaveAngle);
}

function onHandWavePositionEntered(){
  console.log("onHandWavePositionEntered");
}

function onHandPoseModelReady() {
  console.log("Handpose model ready!");
  document.getElementById("status").style.display = "none";
}

/**
 * Called by ml5js Handpose library
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

async function serialWriteHandWaveAngle(handWaveAngle) {

  // // let remappedAngle = //-70, 
  let remappedAngle = handWaveAngle + 180;
  if (serialWriter) {
    console.log("Writing to serial: ", remappedAngle.toString());
    let rv = await serialWriter.write(remappedAngle + "\n");
    console.log("Writing finished.");
  }
}