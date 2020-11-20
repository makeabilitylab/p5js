// Based on the Coding Train node.js tutorial series:
// Part 1: Introduction to Node - WebSockets and p5.js Tutorial: https://youtu.be/bjULmG8fqc8
// Part 2: Using Express with Node - WebSockets and p5.js Tutorial: https://youtu.be/2hhEOGXcCvg
// Part 3: Connecting Client to Server with Socket.io - WebSockets and p5.js Tutorial: https://youtu.be/HZWmrt3Jy10
// Part 4: Shared Drawing Canvas - WebSockets and p5.js Tutorial: https://youtu.be/i6eP1Lw4gZk
//
// To auto-deploy to Heroku from a subdir: https://medium.com/@timanovsky/heroku-buildpack-to-support-deployment-from-subdirectory-e743c2c838dd
// How to deploy to Heroku: https://www.freecodecamp.org/news/how-to-deploy-a-nodejs-app-to-heroku-from-github-without-installing-heroku-on-your-machine-433bec770efe/

// const { rejects } = require("assert");
// const { text } = require("body-parser");

const SOCKET_EVENT_HANDWAVE = "handwave";

// We set up an app here: https://hand-wave.herokuapp.com/
let handposeModel;
let video;
let hand;

let mostRecentRemoteHandData = null;

function setup() {
  createCanvas(640, 480);
  hand = new Hand();
  video = createCapture(VIDEO);
  // video.size(width, height);

  // if no url is passed to connect, defaults to defaults to window.location
  socket = io.connect();
  socket.on(SOCKET_EVENT_HANDWAVE, onNewHandWaveEventFromServer);

  handposeModel = ml5.handpose(video, onHandPoseModelReady);

  // Call onNewHandposePrediction every time a new handpose is predicted
  handposeModel.on("predict", onNewHandPosePrediction);

  // Hide the video element, and just show the canvas
  video.hide();

  hand.on(Hand.EVENT_ENTERED_HAND_WAVE_POSITION, onHandWavePositionEntered);
  hand.on(Hand.EVENT_NEW_HAND_WAVE_ANGLE, onNewHandWaveAngle);
  hand.on(Hand.EVENT_EXITED_HAND_WAVE_POSITION, onHandWavePositionExited);
}

function onNewHandWaveEventFromServer(data) {
  console.log("onNewHandWaveEventFromServer:", data);
  mostRecentRemoteHandData = data;

  if(data && data.handWaveAngle){
    serialWriteHandWaveAngle(data.handWaveAngle);
  }
}

function onNewHandWaveAngle(handWaveAngle) {
  // console.log("onNewHandWaveAngle", handWaveAngle);
  //serialWriteHandWaveAngle(handWaveAngle);
  sendNewWaveEventToServer(hand, handWaveAngle);
}

function sendNewWaveEventToServer(hand, handWaveAngle) {
  let boundingBox = null;
  if (hand.handPose) {
    boundingBox = {
      topLeft: {
        x: hand.tightBoundingBox.left,
        y: hand.tightBoundingBox.top
      },
      bottomRight: {
        x: hand.tightBoundingBox.right,
        y: hand.tightBoundingBox.bottom
      }
    };
  }

  let landmarks = null;
  if (hand.handPose) {
    landmarks = hand.handPose.landmarks;
  }

  let data = {
    boundingBox: boundingBox,
    handInWavePosition: hand.isInHandWavePosition,
    handWaveAngle: handWaveAngle,
    landmarks: landmarks
  }

  console.log("Sending data", data);
  socket.emit(SOCKET_EVENT_HANDWAVE, data);
}

function onHandWavePositionEntered() {
  console.log("onHandWavePositionEntered");
  sendNewWaveEventToServer(hand, null);
}

function onHandWavePositionExited() {
  console.log("onHandWavePositionExited");
  sendNewWaveEventToServer(hand, null);
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

  if (mostRecentRemoteHandData) {
    // draw bounding box from remote hand position
    const data = mostRecentRemoteHandData;
    const remoteHandColor = color(255, 255, 255, 200);

    if(mostRecentRemoteHandData.boundingBox){
      noFill();
      stroke(remoteHandColor);
      const bbWidth = data.boundingBox.bottomRight.x - data.boundingBox.topLeft.x;
      const bbHeight = data.boundingBox.bottomRight.y - data.boundingBox.topLeft.y;
      rect(data.boundingBox.topLeft.x, data.boundingBox.topLeft.y, bbWidth, bbHeight);
    
      const yTextHeight = 15;
      let yText = data.boundingBox.topLeft.y - yTextHeight;

      noStroke();
      fill(remoteHandColor);
      text("Is remote hand in wave position: " + mostRecentRemoteHandData.handInWavePosition, data.boundingBox.topLeft.x, yText);

      if (mostRecentRemoteHandData.handInWavePosition) {
        yText -= yTextHeight;
        if (data.handWaveAngle) {
          text("Remote hand wave angle: " + nfc(data.handWaveAngle, 1), data.boundingBox.topLeft.x, yText);
        }
      }
    }

    if(mostRecentRemoteHandData.landmarks){
      noStroke();
      fill(remoteHandColor);
      const remoteHandLandmarks = mostRecentRemoteHandData.landmarks;
      for (let i = 0; i < remoteHandLandmarks.length; i += 1) {
        const landmark = remoteHandLandmarks[i];
        ellipse(landmark[0], landmark[1], 10, 10);
      }
    }
  }
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
