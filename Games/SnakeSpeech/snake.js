const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down'
}

// snake
class Snake {

  constructor(bodyPartSize, startLoc) {
    this.body = [];

    // each body part is a vector of x,y 
    this.body[0] = startLoc;
    this.xdir = 0;
    this.ydir = 0;
    this.bodyPartSize = bodyPartSize;
  }

  getLength() {
    return this.body.length;
  }

  // Sets the snake direction
  // Returns true if the direction properly set, false otherwise. 
  // (If false is returned, the snake ran into itself!)
  setDir(newDirection) {
    let prevDir = this.direction;
    
    // check if we ran into ourselves
    if(this.body.length >= 2){
      if ( (prevDir == DIRECTION.LEFT && newDirection == DIRECTION.RIGHT) ||
           (prevDir == DIRECTION.RIGHT && newDirection == DIRECTION.LEFT) ||
           (prevDir == DIRECTION.UP && newDirection == DIRECTION.DOWN) ||
           (prevDir == DIRECTION.DOWN && newDirection == DIRECTION.UP) ){
        
        // if we're here, we ran into ourselves, oops
        print("RAN INTO SELF, DOH!");
        return false;
      }
    }
    
    this.direction = newDirection;
    return true;
  }

  getHead() {
    return this.body[0];
  }

  checkRanOffScreen() {
    let h = this.getHead();
    if (h.x < 0 || h.x > width || h.y < 0 || h.y > height) {
      print("RAN OFF EDGE");
      return true;
    } 
    return false;
  }

  isOverFood(food) {
    return this.getHead().x == food.loc.x && this.getHead().y == food.loc.y;
  }

  grow() {
    this.body.push(this.body[this.body.length - 1].copy());
  }

  update() {
    // copy loc of head
    let prevBodyPartPos = createVector(this.getHead().x, this.getHead().y);

    // move head
    switch (this.direction) {
      case DIRECTION.LEFT:
        this.body[0].x -= this.bodyPartSize;
        break;
      case DIRECTION.RIGHT:
        this.body[0].x += this.bodyPartSize;
        break;
      case DIRECTION.UP:
        this.body[0].y -= this.bodyPartSize;
        break;
      case DIRECTION.DOWN:
        this.body[0].y += this.bodyPartSize;
        break;
    }

    // move rest of body
    for (let i = 1; i < this.body.length; i++) {
      let saveCurBodyPartPos = createVector(this.body[i].x, this.body[i].y);
      this.body[i].x = prevBodyPartPos.x;
      this.body[i].y = prevBodyPartPos.y;

      prevBodyPartPos = saveCurBodyPartPos;
    }
  }

  draw() {
    fill(0);

    for (let bodyPart of this.body) {
      rect(bodyPart.x, bodyPart.y, this.bodyPartSize, this.bodyPartSize);
    }
  }
}