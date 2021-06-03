// This sketch detects a hand wave and angle using the HandPose implementation in ml5js
// and spits this information out on Web Serial. 
//
// Designed to work with this Arduino sketch, which controls a servo motor
// based on hand position:
// https://github.com/makeabilitylab/arduino/tree/master/Serial/HandWaveSerialInServo
//
// For the non-web serial version of this project, see: 
// https://github.com/makeabilitylab/p5js/tree/master/ml5js/HandPose/HandWaveDetector
//
// Or, for a live demo (without web serial), see:  
// https://makeabilitylab.github.io/p5js/ml5js/HandPose/HandWaveDetector/
//
// HandPose implementation in ml5js
// https://learn.ml5js.org/#/reference/handPose
//
// ml5js is a Machine Learning JavaScript library that provides an easy-to-use API
// for machine learning. See: https://ml5js.org/
// 
// By Jon E. Froehlich
// http://makeabilitylab.io/
//

let handPoseModel;
let video;
let hand;
let pHtmlMsg;

function setup() {
  createCanvas(640, 480);
  hand = new Hand();
  video = createCapture(VIDEO);
  // video.size(width, height);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort();

  pHtmlMsg = select('#html-messages');

  // Setup the hand pose model. This is from ml5js
  handPoseModel = ml5.handpose(video, onHandPoseModelReady);

  // Call onNewHandPosePrediction every time a new handPose is predicted
  handPoseModel.on("predict", onNewHandPosePrediction);

  // Setup our hand callback functions
  hand.on(Hand.EVENT_ENTERED_HAND_WAVE_POSITION, onHandWavePositionEntered);
  hand.on(Hand.EVENT_EXITED_HAND_WAVE_POSITION, onHandWavePositionExited);
  hand.on(Hand.EVENT_NEW_HAND_WAVE_ANGLE, onNewHandWaveAngle);
  hand.on(Hand.EVENT_NEW_HAND_WAVE_DETECTED, onNewHandWaveDetected);

  // Useful to slow down the framerate to debug. Commenting out for now
  // frameRate(2);

  // Hide the video element, and just show the canvas
  video.hide();

  // Move connect button down
  let mainTag = document.getElementsByTagName("main")[0];
  mainTag.appendChild(
    document.getElementById('connect-button')
  );
}

/**
 * Callback function for when the connect button is pressed
 */
async function onButtonConnectToSerialDevice(){
  if (!serial.isOpen()) {
    await serial.connectAndOpen();
  }
}

/**
 * Callback function by serial.js when there is an error on web serial
 * 
 * @param {} eventSender 
 */
function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

/**
 * Callback function by serial.js when web serial connection is opened
 * 
 * @param {} eventSender 
 */
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("Serial connection opened successfully");

  let canvas = document.getElementsByClassName('p5Canvas')[0];
  canvas.style.display = "block";

  document.getElementById("connect-button").style.display = "none";
}

/**
 * Callback function by serial.js when web serial connection is closed
 * 
 * @param {} eventSender 
 */
function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
}

/**
 * Callback function serial.js when new web serial data is received
 * 
 * @param {*} eventSender 
 * @param {String} newData new data received over serial
 */
function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);

  // Check if data received starts with '#'. If so, ignore it
  // Otherwise, parse it! We ignore lines that start with '#' 
  if(!newData.startsWith("#")){
    // Empty for now 
  }
}

/**
 * Send the hand wave angle over Serial
 * 
 * @param {Number} handWaveAngle 
 */
async function serialWriteHandWaveAngle(handWaveAngle) {

  // The hand wave angle goes from 0 to -180. We remap this
  // to go from 180 down to 0 
  let remappedAngle = Math.round(handWaveAngle + 180);
  
  if (serial.isOpen()) {
    console.log("serialWriteHandWaveAngle ", handWaveAngle, " remappedAngle", remappedAngle);
    console.log("Writing to serial: ", remappedAngle.toString());
    serial.writeLine(remappedAngle);
  }
}

function onNewHandWaveDetected(contiguousHandWaveCount, overallHandWaveCount){
  print("onNewHandWaveDetected: contiguousHandWaveCount: " + contiguousHandWaveCount + " overallHandWaveCount:" + overallHandWaveCount);
}

/**
 * Call back function by hand.js when a new hand angle is detected
 * 
 * @param {Number} handWaveAngle 
 */
function onNewHandWaveAngle(handWaveAngle){
  // console.log("onNewHandWaveAngle", handWaveAngle);
  serialWriteHandWaveAngle(handWaveAngle);
}

/**
 * Callback function by hand.js when a hand enters into a hand wave position
 */
function onHandWavePositionEntered(){
  console.log("onHandWavePositionEntered");
  pHtmlMsg.html("onHandWavePositionEntered");
}

/**
 * Callback function by hand.js when a hand exists a hand wave position
 */
function onHandWavePositionExited(){
  console.log("onHandWavePositionExited");
  pHtmlMsg.html("onHandWavePositionExited");
}

/**
 * Callback function by ml5js handPose library when the hand pose model is ready
 */
function onHandPoseModelReady() {
  let debugMsg = "HandPose model ready!";
  console.log(debugMsg);
  if(serial.isOpen()){
    debugMsg += " And we are connected to web serial!"
  }else{
    debugMsg += " Waiting to connect to serial...";
  }
  pHtmlMsg.html(debugMsg);

  // Hide the hand-pose-status div
  document.getElementById("hand-pose-status").style.display = "none";

  // Move the lil html message output to main tag so the messages are below the canvas 
  // https://stackoverflow.com/a/6329160/388117
  let mainTag = document.getElementsByTagName("main")[0];
  mainTag.appendChild(
    document.getElementById('html-messages')
  );
}

/**
 * Called by ml5js HandPose library each time there is a new hand pose detection
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

