// Tracks where the player is in a flap gesture: arms raised (wings up), then
// lowered (wings down) to trigger a flap, then back to neutral (no flap).
const FlapState = {
  NOFLAP: 'no flap',
  WINGSUP: 'wings up',
  WINGSDOWN: 'wings down',
}

// Turns webcam pose data into bird flaps: when both wrists go above the top
// threshold and then drop below the bottom threshold, it counts as one flap.
// Also draws the two threshold zones as a visual cue.
class ArmFlap {

  constructor(bird) {
    this.yTopFlapThreshold = height * 0.4;
    this.yBottomFlapThreshold = height - height * 0.3;
    this.human = null;
    this.flapState = FlapState.NOFLAP;
    
    this.topFlapArea = color(0, 0, 255, 50);
    this.bottomFlapArea = this.topFlapArea;
    this.wingInFlapAreaColor = color(255, 0, 255, 50);
    this.bird = bird;
    this.bird.flapStrength = 30;
    this.bird.gravity = 0.7;
  }

  // Advance the flap state machine for the latest detected pose: wings up, then
  // wings down triggers a flap on the bird, then reset to neutral.
  update(human) {
    this.human = human;

    if(this.areWingsUp()){
      this.flapState = FlapState.WINGSUP;
    }else if(this.flapState == FlapState.WINGSUP &&
            (this.areWingsDown())){
      this.bird.flap();

      this.flapState = FlapState.WINGSDOWN;
    }else if(this.flapState == FlapState.WINGSDOWN){
      this.flapState = FlapState.NOFLAP;
    }
  }

  // True when both wrists are above the top threshold (arms raised).
  areWingsUp(){
    if(this.human){
      return this.human.pose.leftWrist.y < this.yTopFlapThreshold &&
       this.human.pose.rightWrist.y < this.yTopFlapThreshold;
    }
    return false;
  }

  // True when both wrists are below the bottom threshold (arms lowered).
  areWingsDown(){
    if(this.human){
      return this.human.pose.leftWrist.y > this.yBottomFlapThreshold &&
            this.human.pose.rightWrist.y > this.yBottomFlapThreshold; 
    }
    return false;
  }

  // Draw the top and bottom flap zones, highlighting a zone when the wrists are
  // inside it (visual feedback for where to raise/lower the arms).
  draw() {
    push();
    //noFill();
    noStroke();
    if(this.areWingsUp()){
      fill(this.wingInFlapAreaColor); 
    }else{
      fill(this.topFlapArea);
    }
    rect(0, 0, width, this.yTopFlapThreshold);
    
    if(this.areWingsDown()){
      fill(this.wingInFlapAreaColor); 
    }else{
      fill(this.bottomFlapArea); 
    }
    rect(0, this.yBottomFlapThreshold, width, height - this.yBottomFlapThreshold);
    pop();
  }

}