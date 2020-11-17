// This sketch is based on the official Handpose example from ml5js:
// https://github.com/ml5js/ml5-library/blob/main/examples/p5js/Handpose/Handpose_Webcam/sketch.js
//
// This Sketch uses ml5js, a Machine Learning JavaScript library that
// works well with p5js. ml5js provides lots of interesting methods
// including pitch detection, human pose detection, sound classification, etc.
// Read more here: https://ml5js.org/
//
// This particular Sketch uses ml5js's Handpose implementation for hand tracking
//
// Reference for the ml5js PoseNet implementation:
//  - https://learn.ml5js.org/#/reference/handpose
//
// 
// By Jon E. Froehlich
// http://makeabilitylab.io/
//

let handposeModel;
let video;
let predictions = [];
let curHandpose = null;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  // video.size(width, height);

  handposeModel = ml5.handpose(video, onHandposeModelReady);

  // This sets up an event that fills the global variable "predictions"
  // with an array every time new hand poses are detected
  handposeModel.on("predict", onNewHandposePrediction);

  // Hide the video element, and just show the canvas
  video.hide();
}

function onHandposeModelReady() {
  console.log("Handpose model ready!");
}

function onNewHandposePrediction(predictions) {
  if(predictions && predictions.length > 0){
    curHandpose = predictions[0];
    console.log(curHandpose);
  }else{
    curHandpose = null;
  }
}

function draw() {
  image(video, 0, 0, width, height);

  drawHand(curHandpose);
}

// A function to draw ellipses over the detected keypoints
function drawHand(handpose) {
  if(!handpose){
    return;
  }

  // The handpose data is in this format, see: https://learn.ml5js.org/#/reference/handpose?id=predict
  // {
  //   handInViewConfidence: 1, // The probability of a hand being present.
  //   boundingBox: { // The bounding box surrounding the hand.
  //     topLeft: [162.91, -17.42],
  //     bottomRight: [548.56, 368.23],
  //   },
  //   landmarks: [ // The 3D coordinates of each hand landmark.
  //     [472.52, 298.59, 0.00],
  //     [412.80, 315.64, -6.18],
  //     ...
  //   ],
  //   annotations: { // Semantic groupings of the `landmarks` coordinates.
  //     thumb: [
  //       [412.80, 315.64, -6.18]
  //       [350.02, 298.38, -7.14],
  //       ...
  //     ],
  //     ...
  //   }

  // Draw landmarks
  for (let j = 0; j < handpose.landmarks.length; j += 1) {
    const landmark = handpose.landmarks[j];
    fill(0, 255, 0, 200);
    noStroke();
    ellipse(landmark[0], landmark[1], 10, 10);
  }

  // Draw bounding box
  noFill();
  stroke(0, 255, 0, 200);
  const bb = handpose.boundingBox;
  const bbWidth = bb.bottomRight[0] - bb.topLeft[0];
  const bbHeight = bb.bottomRight[1] - bb.topLeft[1];
  rect(bb.topLeft[0], bb.topLeft[1], bbWidth, bbHeight);

  // Draw confidence
  fill(0, 255, 0, 200);
  noStroke();
  text(nfc(handpose.handInViewConfidence, 2), bb.topLeft[0], bb.topLeft[1] - 15);
  
}