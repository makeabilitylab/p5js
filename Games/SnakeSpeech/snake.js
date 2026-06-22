const DIRECTION = {
  LEFT: 'left',
  RIGHT: 'right',
  UP: 'up',
  DOWN: 'down'
}

// The snake: an ordered list of body-part positions (p5.Vectors). body[0] is
// the head; each following part trails the one ahead of it. The snake grows by
// one part each time it eats food.
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
        return false;
      }
    }
    
    this.direction = newDirection;
    return true;
  }

  getHead() {
    return this.body[0];
  }

  // Returns true if the head has moved off the edge of the canvas.
  checkRanOffScreen() {
    let h = this.getHead();
    if (h.x < 0 || h.x > width || h.y < 0 || h.y > height) {
      return true;
    }
    return false;
  }

  // Returns true if the head is on the same cell as the food.
  isOverFood(food) {
    return this.getHead().x == food.loc.x && this.getHead().y == food.loc.y;
  }

  // Add one body part (duplicates the current tail; it slots into place as the
  // snake moves).
  grow() {
    this.body.push(this.body[this.body.length - 1].copy());
  }

  // Advance one step: move the head one cell in the current direction, then drag
  // each body part to where the part ahead of it just was.
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

  // Draw each body part as a black square.
  draw() {
    fill(0);

    for (let bodyPart of this.body) {
      rect(bodyPart.x, bodyPart.y, this.bodyPartSize, this.bodyPartSize);
    }
  }
}