// This is code is part of a lesson series on creating a servo motor controlled by
// the user's hand, as recognized by a real-time webcam stream and the ml5 HandPose
// library.
//
// See our full step-by-step lesson:
// https://makeabilitylab.github.io/physcomp/communication/handpose-serial.html
//
// Also available in the p5.js online editor
// https://editor.p5js.org/jonfroehlich/sketches/vMbPOkdzu
// 
// 
// By Jon E. Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//


let pHtmlMsg;
let serialOptions = { baudRate: 115200  };
let serial;

let handPoseModel;
let video;
let curHandPose = null;
let isHandPoseModelInitialized = false;
let kpSize = 10;
let palmXNormalized = 0;
let timestampLastTransmit = 0;
const MIN_TIME_BETWEEN_TRANSMISSIONS_MS = 50; // 50 ms is ~20 Hz

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  // Hide the video element, and just show the canvas
  video.hide();

  handPoseModel = ml5.handpose(video, onHandPoseModelReady);

  // Call onNewHandPosePrediction every time a new handPose is predicted
  handPoseModel.on("predict", onNewHandPosePrediction);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");
}

/**
 * Callback function called by ml5.js HandPose when the HandPose model is ready
 * Will be called once and only once
 */
function onHandPoseModelReady() {
  console.log("HandPose model ready!");
  isHandPoseModelInitialized = true;
}

/**
 * Callback function called by ml5.js HandPose when a pose has been detected
 */
function onNewHandPosePrediction(predictions) {
  if (predictions && predictions.length > 0) {
    curHandPose = predictions[0];
    // Grab the palm's x-position and normalize it to [0, 1]
    const palmBase = curHandPose.landmarks[0];
    palmXNormalized = palmBase[0] / width;
    
    if(serial.isOpen()){
      const outputData = nf(palmXNormalized, 1, 4); 
      const timeSinceLastTransmitMs = millis() - timestampLastTransmit;
      if(timeSinceLastTransmitMs > MIN_TIME_BETWEEN_TRANSMISSIONS_MS){
        serial.writeLine(outputData); 
        timestampLastTransmit = millis();
      }else{
        console.log("Did not send  '" + outputData + "' because time since last transmit was " 
                    + timeSinceLastTransmitMs + "ms");
      }
    }
  } else {
    curHandPose = null;
  }
}

function draw() {
  image(video, 0, 0, width, height);

  if(!isHandPoseModelInitialized){
    background(100);
    push();
    textSize(32);
    textAlign(CENTER);
    fill(255);
    noStroke();
    text("Waiting for HandPose model to load...", width/2, height/2);
    pop();
  }

  if(curHandPose){
    drawHand(curHandPose);
    drawBoundingBox(curHandPose);
    
    // draw palm info
    noFill();
    stroke(255);
    const palmBase = curHandPose.landmarks[0];
    circle(palmBase[0], palmBase[1], kpSize);
    
    noStroke();
    fill(255);
    text(nf(palmXNormalized, 1, 4), palmBase[0] + kpSize, palmBase[1] + textSize() / 2);
  }
}

function drawHand(handPose) {

  // Draw keypoints. While each keypoints supplies a 3D point (x,y,z), we only draw
  // the x, y point.
  for (let j = 0; j < handPose.landmarks.length; j += 1) {
    const landmark = handPose.landmarks[j];
    fill(0, 255, 0, 200);
    noStroke();
    circle(landmark[0], landmark[1], 10);
  }
}

function drawBoundingBox(handPose){
  // Draw hand pose bounding box
  const bb = handPose.boundingBox;
  const bbWidth = bb.bottomRight[0] - bb.topLeft[0];
  const bbHeight = bb.bottomRight[1] - bb.topLeft[1];
  noFill();
  stroke("red");
  rect(bb.topLeft[0], bb.topLeft[1], bbWidth, bbHeight);

  // Draw confidence
  fill("red");
  noStroke();
  textAlign(LEFT, BOTTOM);
  textSize(20);
  text(nfc(handPose.handInViewConfidence, 2), bb.topLeft[0], bb.topLeft[1]);
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
}

/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}