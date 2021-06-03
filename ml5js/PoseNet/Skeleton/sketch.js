// Demonstrates the ml5.js PoseNet API:
// https://learn.ml5js.org/#/reference/posenet
//
// Based loosely on the official ml5.js PoseNet example:
// https://github.com/ml5js/ml5-library/blob/main/examples/p5js/PoseNet/PoseNet_webcam/sketch.js
//
// As linked to from:
// https://ml5js.org/reference/api-PoseNet/
// 
// By Jon E. Froehlich
// http://makeabilitylab.io/

let video;
let poseNet;
let currentPoses = [];
let poseNetModelReady = false;

// The following options are all optional. Here are the defaults:
// {
//   architecture: 'MobileNetV1',
//   imageScaleFactor: 0.3,
//   outputStride: 16,
//   flipHorizontal: false,
//   minConfidence: 0.5,
//   maxPoseDetections: 5,
//   scoreThreshold: 0.5,
//   nmsRadius: 20,
//   detectionType: 'multiple',
//   inputResolution: 513,
//   multiplier: 0.75,
//   quantBytes: 2,
// };
const poseNetOptions = { detectionType: "single"};

function setup() {
  createCanvas(640, 480);
  video = createCapture(VIDEO);
  //video.size(width, height);
  video.hide();

  // Setup PoseNet. This can take a while, so we load it 
  // asynchronously (when it's done, it will call modelReady)
  poseNet = ml5.poseNet(video, poseNetOptions, onPoseNetModelReady); //call onModelReady when setup
  
  // PoseNet has one and only one event subscription called 'pose', which is
  // called when pose is detected
  poseNet.on('pose', onPoseDetected); // call onPoseDetected when pose detected
  //frameRate(1);
}

/**
 * Callback function called by ml5.js PoseNet when the PoseNet model is ready
 * Will be called once and only once
 */
function onPoseNetModelReady() {
  print("The PoseNet model is ready...");
  poseNetModelReady = true;
}

/**
 * Callback function called by ml5.js PosetNet when a pose has been detected
 */
function onPoseDetected(poses) {
  currentPoses = poses;
}

function draw() {
  image(video, 0, 0, width, height);

  if(!poseNetModelReady){
    background(100);
    push();
    textSize(32);
    textAlign(CENTER);
    fill(255);
    noStroke();
    text("Waiting for PoseNet model to load...", width/2, height/2);
    pop();
  }

  // Iterate through all poses and print them out
  if(currentPoses){
    for (let i = 0; i < currentPoses.length; i++) {
      drawPose(currentPoses[i], i);
    }
  }
}

function drawPose(pose, poseIndex){
  
  // Draw skeleton
  const skeletonColor = color(255, 255, 255, 128);
  stroke(skeletonColor); 
  strokeWeight(2);
  const skeleton = pose.skeleton;
  for (let j = 0; j < skeleton.length; j += 1) {
    const partA = skeleton[j][0];
    const partB = skeleton[j][1];
    line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
  }
  
  // Draw keypoints with text
  const kpFillColor = color(255, 255, 255, 200);
  const textColor = color(255, 255, 255, 230);
  const kpOutlineColor = color(0, 0, 0, 150);
  strokeWeight(1);

  const keypoints = pose.pose.keypoints;
  const kpSize = 10;
  const kpTextMargin = 2;
  let xPoseLeftMost = width;
  let xPoseRightMost = -1;
  let yPoseTop = height;
  let yPoseBottom = -1;
  for (let j = 0; j < keypoints.length; j += 1) {
    // A keypoint is an object describing a body part (like rightArm or leftShoulder)
    const kp = keypoints[j];

    // check for maximum extents
    if(xPoseLeftMost > kp.position.x){
      xPoseLeftMost = kp.position.x;
    }else if(xPoseRightMost < kp.position.x){
      xPoseRightMost = kp.position.x;
    }

    if(yPoseBottom < kp.position.y){
      yPoseBottom = kp.position.y;
    }else if(yPoseTop > kp.position.y){
      yPoseTop = kp.position.y;
    }

    fill(kpFillColor); 
    noStroke();
    circle(kp.position.x, kp.position.y, kpSize);

    fill(textColor);
    textAlign(LEFT);
    let xText = kp.position.x + kpSize + kpTextMargin;
    let yText = kp.position.y;
    if(kp.part.startsWith("right")){
      textAlign(RIGHT);
      xText = kp.position.x - (kpSize + kpTextMargin);
    }
    textStyle(BOLD);
    text(kp.part, xText, yText);
    textStyle(NORMAL);
    yText += textSize();
    text(int(kp.position.x) + ", " + int(kp.position.y), xText, yText);

    yText += textSize();
    text(nf(kp.score, 1, 2), xText, yText);
    //console.log(keypoint);
    // Only draw an ellipse is the pose probability is bigger than 0.2
    //if (keypoint.score > 0.2) {

    noFill();
    stroke(kpOutlineColor);
    circle(kp.position.x, kp.position.y, kpSize);
  }

  const boundingBoxExpandFraction = 0.1;
  let boundingBoxWidth = xPoseRightMost - xPoseLeftMost;
  let boundingBoxHeight = yPoseBottom - yPoseTop;
  let boundingBoxXMargin = boundingBoxWidth * boundingBoxExpandFraction;
  let boundingBoxYMargin = boundingBoxHeight * boundingBoxExpandFraction;
  xPoseRightMost += boundingBoxXMargin / 2;
  xPoseLeftMost -= boundingBoxXMargin / 2;
  yPoseTop -= boundingBoxYMargin / 2;
  yPoseBottom += boundingBoxYMargin / 2;
  
  noStroke();
  fill(textColor);
  textStyle(BOLD);
  textAlign(LEFT, BOTTOM);
  const strPoseNum = "Pose: " + (poseIndex + 1);
  text(strPoseNum, xPoseLeftMost, yPoseTop - textSize() - 1);
  const strWidth = textWidth(strPoseNum);
  textStyle(NORMAL);
  text("Confidence: " + nf(pose.pose.score, 0, 1), xPoseLeftMost, yPoseTop);

  noFill();
  stroke(kpFillColor);
  rect(xPoseLeftMost, yPoseTop, boundingBoxWidth + boundingBoxXMargin, 
    boundingBoxHeight + boundingBoxYMargin);
}


// A function to draw ellipses over the detected keypoints
function drawKeypoints() {
  // Loop through all the poses detected
  for (let i = 0; i < poses.length; i += 1) {
    // For each pose detected, loop through all the keypoints
    const pose = poses[i].pose;
    for (let j = 0; j < pose.keypoints.length; j += 1) {
      // A keypoint is an object describing a body part (like rightArm or leftShoulder)
      const keypoint = pose.keypoints[j];
      // Only draw an ellipse is the pose probability is bigger than 0.2
      if (keypoint.score > 0.2) {
        fill(255, 0, 0);
        noStroke();
        ellipse(keypoint.position.x, keypoint.position.y, 10, 10);
      }
    }
  }
}

// A function to draw the skeletons
function drawSkeleton() {
  // Loop through all the skeletons detected
  for (let i = 0; i < poses.length; i += 1) {
    const skeleton = poses[i].skeleton;
    // For every skeleton, loop through all body connections
    for (let j = 0; j < skeleton.length; j += 1) {
      const partA = skeleton[j][0];
      const partB = skeleton[j][1];
      stroke(255, 0, 0);
      line(partA.position.x, partA.position.y, partB.position.x, partB.position.y);
    }
  }
}