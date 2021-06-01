// TODO
//
// By Jon E. Froehlich
// http://makeabilitylab.io/

let video;
let poseNet;
let currentPoses = [];

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


function onPoseNetModelReady() {
  print("The PoseNet model is ready...");
}

function onPoseDetected(poses) {
  currentPoses = poses;
}

function draw() {
  image(video, 0, 0, width, height);

  // Iterate through all poses and print them out
  if(currentPoses){
    for(const pose of currentPoses){
      drawPose(pose);
    }
  }
}

function drawPose(pose){
  
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
  for (let j = 0; j < keypoints.length; j += 1) {
    // A keypoint is an object describing a body part (like rightArm or leftShoulder)
    const kp = keypoints[j];

    fill(kpFillColor); 
    noStroke();
    circle(kp.position.x, kp.position.y, kpSize);

    fill(textColor);
    textAlign(LEFT);
    let xText = kp.position.x + kpSize + kpTextMargin;
    if(kp.part.startsWith("right")){
      textAlign(RIGHT);
      xText = kp.position.x - (kpSize + kpTextMargin);
    }
    textStyle(BOLD);
    text(kp.part, xText, kp.position.y);
    textStyle(NORMAL);
    text(nf(kp.score, 1, 2), xText, kp.position.y + textSize());
    //console.log(keypoint);
    // Only draw an ellipse is the pose probability is bigger than 0.2
    //if (keypoint.score > 0.2) {

    noFill();
    stroke(kpOutlineColor);
    circle(kp.position.x, kp.position.y, kpSize);
  }
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