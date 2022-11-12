/**
 * TODO
 * Some ideas:
 *  * all triangles in grid illuminate and fade before ML logo emerges
 *  * blank canvas and triangles rotate and move to final location
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/

const TriangleDir = {
  TopLeft: 'TopLeft',
  TopRight: 'TopRight',
  BottomLeft: 'BottomLeft',
  BottomRight: 'BottomRight'
};

const TRIANGLE_SIZE = 50;

let makeLabLogo = null;
let makeLabGrid = null;

function setup() {
  createCanvas(800, 600);
  
  angleMode(DEGREES); 

  makeLabLogo = new MakeabilityLabLogo(5*TRIANGLE_SIZE, 4*TRIANGLE_SIZE, TRIANGLE_SIZE);
  makeLabGrid = new Grid(TRIANGLE_SIZE);
}


function draw() {
  background(10);
  // makeLabGrid[0][0].draw();
  // makeLabGrid[0][1].draw();

  if(makeLabGrid.visible){
    makeLabGrid.draw();
  }

  if(makeLabLogo.visible){
    makeLabLogo.draw();
  }
  
}

function keyPressed() {
  if(key == 'g'){
    makeLabGrid.visible = !makeLabGrid.visible;
  }

  if(key == 'm'){
    makeLabLogo.isMOutlineVisible = !makeLabLogo.isMOutlineVisible;
  }

  if(key == 'l'){
    makeLabLogo.isLOutlineVisible = !makeLabLogo.isLOutlineVisible;
  }

  if(key == 'k'){
    makeLabLogo.areLTrianglesVisible = !makeLabLogo.areLTrianglesVisible;
  }
}