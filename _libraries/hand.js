// This library provides a basic set of features around the ml5js handpose library, including:
// basic hand wave detection and drawing functionality (e.g., keypoints, hand skeleton).
// 
// You can subscribe to four events:
//  - Hand.EVENT_ENTERED_HAND_WAVE_POSITION, which is called when a handwave pose is detected
//  - Hand.EVENT_EXITED_HAND_WAVE_POSITION, which is called when a handwave pose is exited
//  - Hand.EVENT_NEW_HAND_WAVE_ANGLE, which is called when the user is in a handwave pose
//  - Hand.EVENT_NEW_HAND_WAVE_DETECTED, which is called when a new handwave gesture is detected
//
// The ml5js handpose library
// https://learn.ml5js.org/#/reference/handpose
//
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
// }
//
// By Professor Jon E. Froehlich
// https://jonfroehlich.github.io/
// http://makeabilitylab.cs.washington.edu
//
//
// TOOD: 
// - [] add in optional hand wave emoji when hand wave detected
//

let HandWaveStateEnum = {
  INITIAL: 1,
  HAND_WAVE_LEFT_THRESHOLD_EXCEEDED: 2,
  HAND_WAVE_RIGHT_THRESHOLD_EXCEEDED: 3,
};

class Hand {
  // for event handling info, see: https://stackoverflow.com/a/56612753
  static EVENT_ENTERED_HAND_WAVE_POSITION = "enteredHandWavePosition";
  static EVENT_EXITED_HAND_WAVE_POSITION = "exitedHandWavePosition";
  static EVENT_NEW_HAND_WAVE_ANGLE = "newHandWaveAngle"; // only called when in hand wave position
  static EVENT_NEW_HAND_WAVE_DETECTED = "newHandWaveDetected";

  // For approximate hand wave estimation, we simply examine the angle of an open palm hand
  // If the user moves their hand across a left angle threshold and a right angle threshold
  // then a hand wave detected
  static ANGLE_WAVE_LEFT_THRESHOLD = -75; // in degrees
  static ANGLE_WAVE_RIGHT_THRESHOLD = -100; // in degrees

  constructor() {
    this.handPose = null;

    this.timestampFirstContiguousHandPoseDetection = -1;
    this.contiguousHandPoseDetections = 0;

    this.tightBoundingBox = null;
    this.isInHandWavePosition = false;
    this.palmToMiddleFingerLineSegment = null;

    this.isBoundingBoxVisible = true;
    this.isHandWaveTextVisible = true;

    // Hand wave stuff  
    this.handWaveState = HandWaveStateEnum.INITIAL;
    this.lastHandWaveAngleThresholdExceeded = null; // stores the last hand wave angle exceeded
    this.overallHandWaveCount = 0;
    this.contiguousHandWaveCount = 0;

    // event handling https://stackoverflow.com/a/56612753
    this.events = new Map();

    this.knownEvents = new Set([Hand.EVENT_ENTERED_HAND_WAVE_POSITION,
    Hand.EVENT_EXITED_HAND_WAVE_POSITION,
    Hand.EVENT_NEW_HAND_WAVE_ANGLE,
    Hand.EVENT_NEW_HAND_WAVE_DETECTED]);
  }

  get hasHandPose() {
    return this.handPose != null;
  }

  on(label, callback) {
    if (this.knownEvents.has(label)) {
      if (!this.events.has(label)) {
        this.events.set(label, []);
      }
      this.events.get(label).push(callback);
    } else {
      console.log(`Could not create event subscription for ${label}. Event unknown.`);
    }
  }

  setNewHandPose(predictions) {
    let prevIsHandWavePosition = this.isInHandWavePosition;
    let handWaveAngle = -1;
    let prevOverallHandWaveCount = this.overallHandWaveCount;

    if (predictions && predictions.length > 0) {
      this.handPose = predictions[0];
      this.tightBoundingBox = this.calculateBoundingBox();

      this.isInHandWavePosition = this.calculateIsInHandWavePosition();

      // Calculate vector from palm to middle finger for hand wave tracking
      const a = this.handPose.annotations;
      const palmBaseVector = createVector(a.palmBase[0][0], a.palmBase[0][1]);
      const middleFingerVector = createVector(a.middleFinger[a.middleFinger.length - 1][0], a.middleFinger[a.middleFinger.length - 1][1]);
      this.palmToMiddleFingerLineSegment = new LineSegment(palmBaseVector, middleFingerVector);
      this.palmToMiddleFingerLineSegment.strokeColor = color(255);

      handWaveAngle = degrees(this.palmToMiddleFingerLineSegment.getHeading() - TWO_PI);

      // Basic tracking
      if (this.contiguousHandPoseDetections == 0) {
        this.timestampFirstContiguousHandPoseDetection = millis();
      }
      this.contiguousHandPoseDetections++;

      // Hand wave inference
      if (this.isInHandWavePosition) {
        if (handWaveAngle > Hand.ANGLE_WAVE_LEFT_THRESHOLD) {
          // hand wave angle just exceeded left angle wave threshold
          if (this.handWaveState == HandWaveStateEnum.HAND_WAVE_RIGHT_THRESHOLD_EXCEEDED) {
            this.overallHandWaveCount++;
            this.contiguousHandWaveCount++;
          }

          this.handWaveState = HandWaveStateEnum.HAND_WAVE_LEFT_THRESHOLD_EXCEEDED;
          this.lastHandWaveAngleThresholdExceeded = handWaveAngle;
        } else if (handWaveAngle < Hand.ANGLE_WAVE_RIGHT_THRESHOLD) {
          // hand wave angle just exceeded right angle wave threshold
          if (this.handWaveState == HandWaveStateEnum.HAND_WAVE_LEFT_THRESHOLD_EXCEEDED) {
            this.overallHandWaveCount++;
            this.contiguousHandWaveCount++;
          }

          this.handWaveState = HandWaveStateEnum.HAND_WAVE_RIGHT_THRESHOLD_EXCEEDED;
          this.lastHandWaveAngleThresholdExceeded = handWaveAngle;
        }
      } else {
        this.contiguousHandWaveCount = 0;
        this.handWaveState = HandWaveStateEnum.INITIAL;
        this.lastHandWaveAngleThresholdExceeded = null;
      }

    } else {
      this.handPose = null;
      this.tightBoundingBox = null;
      this.contiguousHandPoseDetections = 0;
      this.isInHandWavePosition = false;
      this.palmToMiddleFingerLineSegment = null;
    }

    // Go through and execute events
    for (let [eventName, callbackFunctions] of this.events) {
      // console.log(eventName + " = " + callbackFunctions);
      switch (eventName) {
        case Hand.EVENT_ENTERED_HAND_WAVE_POSITION:
          if (!prevIsHandWavePosition && this.isInHandWavePosition) {
            for (const callback of callbackFunctions) {
              callback();
            }
          }
          break;
        case Hand.EVENT_EXITED_HAND_WAVE_POSITION:
          if (prevIsHandWavePosition && !this.isInHandWavePosition) {
            for (const callback of callbackFunctions) {
              callback();
            }
          }
          break;
        case Hand.EVENT_NEW_HAND_WAVE_ANGLE:
          if (this.isInHandWavePosition) {
            for (const callback of callbackFunctions) {
              callback(handWaveAngle);
            }
          }
          break;
        case Hand.EVENT_NEW_HAND_WAVE_DETECTED:
          if (prevOverallHandWaveCount != this.overallHandWaveCount) {
            for (const callback of callbackFunctions) {
              callback(this.contiguousHandWaveCount, this.overallHandWaveCount);
            }
          }
          break;
      }
    }
  }

  /**
   * Uses a basic heuristic to determine if hand is in the hand wave position
   */
  calculateIsInHandWavePosition() {
    // Loop through all the skeletons detected
    const a = this.handPose.annotations;

    // Check to see if the palm base is lower than the index, middle, ring, and pinky bases
    // Note that we purposefully don't check the thumb here as that base can be lower than the palm
    // when waving
    if (a.palmBase[0][1] < a.indexFinger[0][1] ||
      a.palmBase[0][1] < a.middleFinger[0][1] ||
      a.palmBase[0][1] < a.ringFinger[0][1] ||
      a.palmBase[0][1] < a.pinky[0][1]) {
      return false;
    }

    // For every finger skeleton, check to make sure the points are ordered
    // If not, probably not in a waving position
    for (let i = 0; i < a.thumb.length - 1; i++) {
      if (a.thumb[i][1] < a.thumb[i + 1][1]) {
        return false;
      }
    }

    for (let i = 0; i < a.indexFinger.length - 1; i++) {
      if (a.indexFinger[i][1] < a.indexFinger[i + 1][1]) {
        return false;
      }
    }

    for (let i = 0; i < a.middleFinger.length - 1; i++) {
      if (a.middleFinger[i][1] < a.middleFinger[i + 1][1]) {
        return false;
      }
    }

    for (let i = 0; i < a.ringFinger.length - 1; i++) {
      if (a.ringFinger[i][1] < a.ringFinger[i + 1][1]) {
        return false;
      }
    }

    for (let i = 0; i < a.pinky.length - 1; i++) {
      if (a.pinky[i][1] < a.pinky[i + 1][1]) {
        return false;
      }
    }

    return true;
  }

  /**
   * Returns a tight bounding box around the handpose landmarks with a left, right, top, and bottom
   * as well as point vectors for the furthest left, right, top, and bottom points
   */
  calculateBoundingBox() {
    let boundingBoxLeft = this.handPose.landmarks[0][0];
    let boundingBoxTop = this.handPose.landmarks[0][1];
    let boundingBoxRight = boundingBoxLeft;
    let boundingBoxBottom = boundingBoxTop;

    let furthestLeftPoint = createVector(boundingBoxLeft, boundingBoxTop);
    let furthestRightPoint = createVector(boundingBoxLeft, boundingBoxTop);
    let mostTopPoint = createVector(boundingBoxLeft, boundingBoxTop);
    let mostBottomPoint = createVector(boundingBoxLeft, boundingBoxTop);

    // calculate bounding box
    for (let j = 0; j < this.handPose.landmarks.length; j += 1) {
      const landmark = this.handPose.landmarks[j];
      fill(0, 255, 0, 200);
      noStroke();
      ellipse(landmark[0], landmark[1], 10, 10);
      if (landmark[0] < boundingBoxLeft) {
        boundingBoxLeft = landmark[0];
        furthestLeftPoint.x = landmark[0];
        furthestLeftPoint.y = landmark[1];
      }

      if (landmark[0] > boundingBoxRight) {
        boundingBoxRight = landmark[0];
        furthestRightPoint.x = landmark[0];
        furthestRightPoint.y = landmark[1];
      }

      if (landmark[1] < boundingBoxTop) {
        boundingBoxTop = landmark[1];
        mostTopPoint.x = landmark[0];
        mostTopPoint.y = landmark[1];
      }

      if (landmark[1] > boundingBoxBottom) {
        boundingBoxBottom = landmark[1];
        mostBottomPoint.x = landmark[0];
        mostBottomPoint.y = landmark[1];
      }
    }

    // return the bounding box
    return {
      left: boundingBoxLeft,
      right: boundingBoxRight,
      top: boundingBoxTop,
      bottom: boundingBoxBottom,

      furthestLeftPoint: furthestLeftPoint,
      furthestRightPoint: furthestRightPoint,
      mostTopPoint: mostTopPoint,
      mostBottomPoint: mostBottomPoint,
    };
  }

  draw() {
    if (this.handPose) {
      if(this.isBoundingBoxVisible){
        this.drawBoundingBoxes();
      }

      this.drawSkeleton();
      this.drawLandmarks();

      // Draw palm to middle finger segment
      this.palmToMiddleFingerLineSegment.draw();

      const bb = this.tightBoundingBox;
      let lineSegmentXAxis = new LineSegment(this.palmToMiddleFingerLineSegment.x1,
        this.palmToMiddleFingerLineSegment.y1, bb.furthestRightPoint.x, this.palmToMiddleFingerLineSegment.y1);
      
      lineSegmentXAxis.strokeColor = color(255);

      lineSegmentXAxis.draw();
      LineSegment.drawAngleArcs(lineSegmentXAxis, this.palmToMiddleFingerLineSegment, color(255), 100, 80);

      // lineSegmentXAxis.strokeColor = color(120, 120, 120, 50);
      // lineSegmentXAxis.isDashedLine = true;
      // lineSegmentXAxis.drawTextMagnitude = false;

      // Draw tiny circles where the max extent finger points are
      stroke(255);
      fill(255);
      const maxFingerPtSize = 3;

      ellipse(bb.furthestLeftPoint.x, bb.furthestLeftPoint.y, maxFingerPtSize);
      ellipse(bb.furthestRightPoint.x, bb.furthestRightPoint.y, maxFingerPtSize);
      ellipse(bb.mostTopPoint.x, bb.mostTopPoint.y, maxFingerPtSize);
      ellipse(bb.mostBottomPoint.x, bb.mostBottomPoint.y, maxFingerPtSize);

      // Draw minimum distance lines to those points
      // TODO: in future consider drawing a bounding box using these projections
      const op1 = this.palmToMiddleFingerLineSegment.getOrthogonalProjection(bb.furthestRightPoint);
      line(op1.x, op1.y, bb.furthestRightPoint.x, bb.furthestRightPoint.y);

      const op2 = this.palmToMiddleFingerLineSegment.getOrthogonalProjection(bb.furthestLeftPoint);
      line(op2.x, op2.y, bb.furthestLeftPoint.x, bb.furthestLeftPoint.y);
    }
  }

  drawBoundingBoxes() {
    if (!this.handPose) {
      return;
    }

    // Draw tight bounding box
    noFill();
    stroke(255, 0, 0);
    const tightBoundingBoxWidth = this.tightBoundingBox.right - this.tightBoundingBox.left;
    const tightBoundingBoxHeight = this.tightBoundingBox.bottom - this.tightBoundingBox.top;
    rect(this.tightBoundingBox.left, this.tightBoundingBox.top, tightBoundingBoxWidth, tightBoundingBoxHeight);

    // Draw hand pose bounding box
    const bb = this.handPose.boundingBox;
    const bbWidth = bb.bottomRight[0] - bb.topLeft[0];
    const bbHeight = bb.bottomRight[1] - bb.topLeft[1];
    rect(bb.topLeft[0], bb.topLeft[1], bbWidth, bbHeight);

    // Draw confidence
    fill(255, 0, 0);
    noStroke();
    const yTextHeight = 12;
    let yTextPos = this.tightBoundingBox.top - yTextHeight;
    text(nfc(this.handPose.handInViewConfidence, 2), this.tightBoundingBox.left, yTextPos);

    if(this.isHandWaveTextVisible){
      yTextPos -= yTextHeight;
      text("Wave count: " + this.contiguousHandWaveCount, this.tightBoundingBox.left, yTextPos);

      yTextPos -= yTextHeight;
      text("Is hand in 'handwave' position: " + this.isInHandWavePosition, this.tightBoundingBox.left, yTextPos);
    }
    // draw rotated bounding box
    push();
    noFill();
    rectMode(CENTER)
    translate(this.tightBoundingBox.left + tightBoundingBoxWidth / 2.0, this.tightBoundingBox.top + tightBoundingBoxHeight / 2.0);
    rotate(this.palmToMiddleFingerLineSegment.heading - PI / 2);
    rect(0, 0, tightBoundingBoxWidth, tightBoundingBoxHeight);
    pop();
  }

  drawLandmarks() {
    if (!this.handPose) {
      return;
    }

    // draw keypoints
    fill(0, 255, 0, 200);
    noStroke();
    for (let i = 0; i < this.handPose.landmarks.length; i += 1) {
      const landmark = this.handPose.landmarks[i];
      ellipse(landmark[0], landmark[1], 10, 10);
    }
  }

  // A function to draw the skeletons
  drawSkeleton() {
    if (!this.handPose) {
      return;
    }

    stroke(0, 255, 0, 200);
    noFill();

    // Loop through all the skeletons detected
    const a = this.handPose.annotations;

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
  }
}