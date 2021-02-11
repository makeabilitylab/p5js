class Panel {
    constructor(x, y, width, height) {
      this.x = x;
      this.y = y;
      this.width = width;
      this.height = height;
    }
  
    /**
     * Returns the left side of the panel
     * @return {Number} the left side of the panel
     */
    getLeft() {
      return this.x;
    }
  
    /**
     * Returns the right side of the panel
     * @return {Number} the right side of the panel
     */
    getRight() {
      return this.x + this.width;
    }
  
    /**
     * Returns the top of the panel
     * @return {Number} the top of the panel
     */
    getTop() {
      return this.y;
    }
  
    /**
     * Returns the bottom of the panel
     * @return {Number} the bottom of the panel
     */
    getBottom() {
      return this.y + this.height;
    }
  
    /**
     * Returns true if this panel contains the x,y. Assumes global coordinates
     * @param {Number} x 
     * @param {Number} y 
     */
    contains(x, y) {
      return x >= this.x && // check within left edge
        x <= (this.x + this.width) && // check within right edge
        y >= this.y && // check within top edge
        y <= (this.y + this.height); // check within bottom edge
    }
  
    keyPressed(){
      
    }
  
    mousePressed() {
  
    }
  
    mouseReleased() {
  
    }
  
    mouseDragged() {
  
    }
  
    mouseMoved() {
  
    }
  }