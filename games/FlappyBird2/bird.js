class Bird extends Shape{

  constructor(x, y) {
    super(x, y, 20, 10);

    this.angle = 0;
    this.flapStrength = 15;

    this.gravity = 0.9;
    this.velocity = 0; //only one dimensional velocity (y axis)
  }
  
  flap(){
    this.velocity += -this.flapStrength;   
  }

  update() {
    this.velocity += this.gravity;
    this.velocity *= 0.9; // some air resistance
    this.y += this.velocity;

    if (this.y + this.height > height) {
      // hit the bottom of the screen
      this.y = height - this.height;
      this.velocity = 0;
    } else if (this.y < 0) {
      // hit the top of the screen
      this.y = 0;
      this.velocity = 0;
    }
    
    // set angle based on upward / downward velocity
    // this implementation idea came from: https://mdbrim.github.io/flappy/index.html
    this.angle = map(this.velocity, -10, 20, -0.7, 0.7);  
    if(this.velocity == 0){
      this.angle = 0; 
    }
  }

  draw() {
    push();
      translate(this.x, this.y);
      rotate(this.angle);
      fill(0);
      rect(0, 0, this.width, this.height);
    pop();
  }
}