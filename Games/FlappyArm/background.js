class Background{
  constructor() {
    this.scrollSpeed = 0.8;
    this.mountains = [];
    this.clouds = [];
    this.sun = new Sun();
    
    let newMountainWidth = random(60, width/2);
    let mountain = this.createMountain(0, height, newMountainWidth);
    this.mountains.push(mountain);
    
    // create mountains
    while(this.mountains[this.mountains.length - 1].getRight() < width + width/2){
      let lastMountain = this.mountains[this.mountains.length - 1];
      newMountainWidth = random(60, width/2);
      let newMountainX = lastMountain.getRight() - random(lastMountain.width * 0.4, lastMountain.width * 0.8);
      let mountain = this.createMountain(newMountainX, height, newMountainWidth);
      this.mountains.push(mountain);
    }
    
    // create clouds
    let numClouds = 9;
    for(let i = 0; i < numClouds; i++){
      
      let xCloud = random(0, width + 10);
      let yCloud = random(0, height * 0.5);
      this.clouds.push(new Cloud(xCloud, yCloud)); 
    }
  }
  
  update(){    
    for(let i = this.mountains.length - 1; i >= 0; i--){
      this.mountains[i].shiftX(-this.scrollSpeed);

      // remove mountains that have gone off the screen
      if(this.mountains[i].getRight() < 0){
        this.mountains.splice(i, 1); 
      }
    }
    
    // check to add another mountain
    let lastMountain = this.mountains[this.mountains.length - 1];
    if(lastMountain.getRight() < width + width/2){
      let newMountainWidth = random(60, width/2);
      let newMountainX = lastMountain.getRight() - random(lastMountain.width * 0.4, lastMountain.width * 0.8);
      let mountain = this.createMountain(newMountainX, height, newMountainWidth); 
      this.mountains.push(mountain);
    }
    
    for(let i = this.clouds.length - 1; i >= 0; i--){
      this.clouds[i].update();

      // remove mountains that have gone off the screen
      if(this.clouds[i].getRight() < 0){
        this.clouds.splice(i, 1); 
        
        let xCloud = width + random(10, 20);
        let yCloud = random(0, height * 0.5);
        this.clouds.push(new Cloud(xCloud, yCloud));
      }
    }
  }
  
  draw(){
    
    this.sun.draw();
    
    // draw mountains
    for (let mountain of this.mountains){
      mountain.draw();
    }
    
    // draw clouds
    for (let cloud of this.clouds){
      cloud.draw();
    }
  }
  
  createMountain(x1, y1, mountainWidth){
    
    let mountainHeight = random(40, height * 0.75);
    
    let x2 = x1 + mountainWidth / 2;
    let x3 = x1 + mountainWidth;
    
    let y2 = y1 - mountainHeight;
    let y3 = y1;
    
    return new Mountain(x1, y1, x2, y2, x3, y3);
  }
}

class Sun extends Shape{
  constructor() { 
    let diameter = random(70, 130);
    let x = random(width / 2, width);
    let y = random(0, height / 4);
    super(x, y, diameter, diameter);
    this.fillColor = color(240);
  }
  
  draw(){
    push();
     fill(this.fillColor);
     noStroke();
     circle(this.x, this.y, this.width); 
    pop();
  }
}

class Cloud extends Shape{
  constructor(x, y){
    let cloudWidth = random(70, 150);
    let cloudHeight = random(50, cloudWidth);
    
    super(x, y, cloudWidth, cloudHeight);
    this.fillColor = color(227);
    this.alpha = 200;
    this.scrollSpeed = random(0.3, 0.4);
    
    //use off screen graphics to merge cloud shapes into single object to draw alpha
    //https://forum.processing.org/two/discussion/22040/how-to-merge-shapes-that-overlaps-another
    this.pg = createGraphics(this.width, this.height);
    this.pg.fill(this.fillColor);
    this.pg.noStroke();
    
    let centerPuffWidth = this.width / 2;
    let centerPuffX = this.width / 2;
    let centerPuffY = this.height / 2;
    this.pg.circle(centerPuffX, centerPuffY, centerPuffWidth, this.height); 
     
    let puffWidth = this.width / 3;
    let puffX = centerPuffX - puffWidth * 0.6;
    let puffY = centerPuffY + 10;
    this.pg.circle(puffX, puffY, puffWidth, this.height);
     
    puffX = centerPuffX + puffWidth * 0.7;
    this.pg.circle(puffX, puffY, puffWidth, this.height); 
    
    // draw bounding box
    // this.pg.stroke(0);
    // this.pg.noFill();
    // this.pg.rect(0, 0, this.width-1, this.height-1);
  }
  
  update(){
    this.x -= this.scrollSpeed;
  }
  
  draw(){
    push();
    tint(255, this.alpha); // this enables us to draw the clouds semi-transparently
    image(this.pg, this.x, this.y);
    pop();
  }
  
  draw_old(){
    //old way of drawing clouds but didn't handle transparency correctly
    //because you could see overlaps on the puffs
    push();
   
    fill(this.fillColor);
    noStroke();
    let centerPuffWidth = this.width / 2;
    let centerPuffX = this.x + this.width / 2;
    let centerPuffY = this.y + this.height / 2;
    circle(centerPuffX, centerPuffY, centerPuffWidth, this.height); 
     
    let puffWidth = this.width / 3;
    let puffX = centerPuffX - puffWidth * 0.6;
    let puffY = centerPuffY + 10;
    circle(puffX, puffY, puffWidth, this.height);
     
    puffX = centerPuffX + puffWidth * 0.7;
    circle(puffX, puffY, puffWidth, this.height); 
    
    pop();
  }
  
}

class Mountain extends Shape{
  constructor(x1, y1, x2, y2, x3, y3) {
    // these are the bounding box dimensions
    let x = min([x1, x2, x3]);
    let y = min([y1, y2, y3]);
    let width = max([x1, x2, x3]) - x;
    let height = max([y1, y2, y3]) - y;
    super(x, y, width, height);
    
    
    this.x1 = x1;
    this.y1 = y1;
    this.x2 = x2;
    this.y2 = y2;
    this.x3 = x3;
    this.y3 = y3;
    this.fillColor = color(205);
    this.outlineColor = color(230);
  }
  
  draw(){
    push();
     fill(this.fillColor);
     stroke(this.outlineColor);
     noStroke();
     triangle(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3); 
    pop();
  }
  
  shiftX(xShift){
    this.x1 += xShift;
    this.x2 += xShift;
    this.x3 += xShift;
    this.x += xShift;
  }
}