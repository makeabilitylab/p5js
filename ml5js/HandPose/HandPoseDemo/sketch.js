// This sketch is based on the official HandPose example from ml5js:
// https://github.com/ml5js/ml5-library/blob/main/examples/p5js/HandPose/HandPose_Webcam/sketch.js
//
// See our step-by-step guide:
// https://makeabilitylab.github.io/physcomp/communication/handpose-serial
//
// This Sketch uses ml5js, a Machine Learning JavaScript library that
// works well with p5js. ml5js provides lots of interesting methods
// including pitch detection, human pose detection, sound classification, etc.
// Read more here: https://ml5js.org/
//
// This particular Sketch uses ml5js's HandPose implementation for hand tracking
//
// Reference for the ml5js PoseNet implementation:
//  - https://learn.ml5js.org/#/reference/handPose
//
// 
// By Jon E. Froehlich
// http://makeabilitylab.io/
//

let handPoseModel;
let video;
let curHandPose = null;
let isHandPoseModelInitialized = false;

let boundingBoxColor;
let kpCircleDiameter = 10;
let kpColor;
let skeletonColor;

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  // video.size(width, height);

  handPoseModel = ml5.handpose(video, onHandPoseModelReady);

  // Call onNewHandPosePrediction every time a new handPose is predicted
  handPoseModel.on("predict", onNewHandPosePrediction);

  // Hide the video element, and just show the canvas
  video.hide();

  boundingBoxColor = color(255, 0, 0);
  kpColor = color(0, 255, 0, 200);
  skeletonColor = color(kpColor);
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
    // console.log(curHandPose);
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
  }
}

// A function to draw ellipses over the detected keypoints
function drawHand(handPose) {

  // The handPose data is in this format, see: https://learn.ml5js.org/#/reference/handPose?id=predict
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
  // Find tight bounding box
  const tightBoundingBox = drawKeypoints(handPose);
  drawSkeleton(handPose);

  // Draw tight bounding box
  noFill();
  stroke(boundingBoxColor);
  const tightBoundingBoxWidth = tightBoundingBox.right - tightBoundingBox.left;
  const tightBoundingBoxHeight = tightBoundingBox.bottom - tightBoundingBox.top;
  rect(tightBoundingBox.left, tightBoundingBox.top, tightBoundingBoxWidth, tightBoundingBoxHeight);

  // Draw hand pose bounding box
  const bb = handPose.boundingBox;
  const bbWidth = bb.bottomRight[0] - bb.topLeft[0];
  const bbHeight = bb.bottomRight[1] - bb.topLeft[1];
  rect(bb.topLeft[0], bb.topLeft[1], bbWidth, bbHeight);

  // Draw confidence
  fill(boundingBoxColor);
  noStroke();
  text(nfc(handPose.handInViewConfidence, 2), tightBoundingBox.left, tightBoundingBox.top - 15);
}

function drawKeypoints(handPose) {
  if (!handPose) {
    return;
  }

  let boundingBoxLeft = handPose.landmarks[0][0];
  let boundingBoxTop = handPose.landmarks[0][1];
  let boundingBoxRight = boundingBoxLeft;
  let boundingBoxBottom = boundingBoxTop;

  // Draw keypoints. While each keypoints supplies a 3D point (x,y,z), we only draw
  // the x, y point.
  for (let j = 0; j < handPose.landmarks.length; j += 1) {
    const landmark = handPose.landmarks[j];
    fill(kpColor);
    noStroke();
    circle(landmark[0], landmark[1], kpCircleDiameter);
    if (landmark[0] < boundingBoxLeft) {
      boundingBoxLeft = landmark[0];
    } else if (landmark[0] > boundingBoxRight) {
      boundingBoxRight = landmark[0];
    }

    if (landmark[1] < boundingBoxTop) {
      boundingBoxTop = landmark[1];
    } else if (landmark[1] > boundingBoxBottom) {
      boundingBoxBottom = landmark[1];
    }
  }

  // return the bounding box
  return {
    left: boundingBoxLeft,
    right: boundingBoxRight,
    top: boundingBoxTop,
    bottom: boundingBoxBottom
  };
}

// A function to draw the skeletons
function drawSkeleton(handPose) {
  if (!handPose) {
    return;
  }

  stroke(skeletonColor);
  noFill();

  // Loop through all the skeletons detected
  const a = handPose.annotations;

  // For every skeleton, loop through all body connections
  for (let i = 0; i < a.thumb.length - 1; i++) {
    line(a.thumb[i][0], a.thumb[i][1], a.thumb[i + 1][0], a.thumb[i + 1][1]);
  }
  for (let i = 0; i < a.indexFinger.length - 1; i++) {
    line(a.indexFinger[i][0], a.indexFinger[i][1], a.indexFinger[i + 1][0], a.indexFinger[i + 1][1]);
  }
  for (let i = 0; i < a.middleFinger.length - 1; i++) {
    line(a.middleFinger[i][0], a.middleFinger[i][1], a.middleFinger[i + 1][0], a.middleFinger[i + 1][1]);
  }
  for (let i = 0; i < a.ringFinger.length - 1; i++) {
    line(a.ringFinger[i][0], a.ringFinger[i][1], a.ringFinger[i + 1][0], a.ringFinger[i + 1][1]);
  }
  for (let i = 0; i < a.pinky.length - 1; i++) {
    line(a.pinky[i][0], a.pinky[i][1], a.pinky[i + 1][0], a.pinky[i + 1][1]);
  }

  line(a.palmBase[0][0], a.palmBase[0][1], a.thumb[0][0], a.thumb[0][1]);
  line(a.palmBase[0][0], a.palmBase[0][1], a.indexFinger[0][0], a.indexFinger[0][1]);
  line(a.palmBase[0][0], a.palmBase[0][1], a.middleFinger[0][0], a.middleFinger[0][1]);
  line(a.palmBase[0][0], a.palmBase[0][1], a.ringFinger[0][0], a.ringFinger[0][1]);
  line(a.palmBase[0][0], a.palmBase[0][1], a.pinky[0][0], a.pinky[0][1]);

  noStroke();
  fill(skeletonColor);
  const xTextMargin = kpCircleDiameter / 2 + 3;
  text("Thumb", a.thumb[a.thumb.length - 1][0] + xTextMargin, a.thumb[a.thumb.length - 1][1]);
  text("Index Finger", a.indexFinger[a.indexFinger.length - 1][0] + xTextMargin, a.indexFinger[a.indexFinger.length - 1][1]);
  text("Middle Finger", a.middleFinger[a.middleFinger.length - 1][0] + xTextMargin, a.middleFinger[a.middleFinger.length - 1][1]);
  text("Ring Finger", a.ringFinger[a.ringFinger.length - 1][0] + xTextMargin, a.ringFinger[a.ringFinger.length - 1][1]);
  text("Pinky", a.pinky[a.pinky.length - 1][0] + xTextMargin, a.pinky[a.pinky.length - 1][1]);
  text("Palm Base", a.palmBase[0][0] + xTextMargin, a.palmBase[0][1]);
}