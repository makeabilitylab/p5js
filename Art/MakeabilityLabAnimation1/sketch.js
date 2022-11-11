/**
 * TODO
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
const MAKELAB_GRID_ROWS = 4;
const MAKELAB_GRID_COLS = 6;

const DEBUG = true;

let makeLabLogo = new Array(MAKELAB_GRID_ROWS);
let makeLabGrid = null;

function setup() {
  createCanvas(800, 600);
  
  angleMode(DEGREES); 

  makeLabLogo = createMakeabilityLabLogo(5*TRIANGLE_SIZE, 4*TRIANGLE_SIZE);
  makeLabGrid = createMakeabilityLabGrid();
}

function createMakeabilityLabGrid(){
  const numGridRows = floor(width / TRIANGLE_SIZE);
  const numGridColumns = floor(width / TRIANGLE_SIZE);

  let grid = new Array(numGridRows);

  for(let row = 0; row < grid.length; row++){
    grid[row] = new Array(numGridColumns);
    for(let col = 0; col < grid[row].length; col++){
      let triDir = TriangleDir.TopLeft;
      if((row % 2 == 0 && col % 2 == 0) || (row % 2 != 0 && col % 2 != 0)){
        triDir = TriangleDir.TopRight;
      }
      let cell = Cell.createCell(col * TRIANGLE_SIZE, row * TRIANGLE_SIZE, TRIANGLE_SIZE, triDir);

      cell.tri1.strokeColor = color(100, 100, 100, 100);
      cell.tri2.strokeColor = color(100, 100, 100, 100);
      grid[row][col] = cell;
    }
  }
  return grid;
}

function createMakeabilityLabLogo(x, y){
  let mlLogo = new Array(MAKELAB_GRID_ROWS);

  // Initialize the make lab logo grid
  for(let row = 0; row < mlLogo.length; row++){
    mlLogo[row] = new Array(MAKELAB_GRID_COLS);
  }

  mlLogo[0] = createMakeabilityLabTopRow(x, y);

  y += TRIANGLE_SIZE;
  mlLogo[1] = createMakeabilityLab2ndRow(x, y);

  y += TRIANGLE_SIZE;
  mlLogo[2] = createMakeabilityLab3rdRow(x, y);

  y += TRIANGLE_SIZE;
  mlLogo[3] = createMakeabilityLabBottomRow(x, y);

  return mlLogo;
}

function createMakeabilityLabTopRow(x, y){
  let topRow = new Array(MAKELAB_GRID_COLS);
  let col = 0;
  topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, TRIANGLE_SIZE, TriangleDir.BottomRight);
  
  x += TRIANGLE_SIZE;
  topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, TRIANGLE_SIZE, TriangleDir.BottomLeft);
  
  x += TRIANGLE_SIZE;
  topRow[col++] = Cell.createEmptyCell(x, y, TRIANGLE_SIZE);

  x += TRIANGLE_SIZE;
  topRow[col++] = Cell.createEmptyCell(x, y, TRIANGLE_SIZE);

  x += TRIANGLE_SIZE;
  topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, TRIANGLE_SIZE, TriangleDir.BottomRight);

  x += TRIANGLE_SIZE;
  topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, TRIANGLE_SIZE, TriangleDir.BottomLeft);

  return topRow;
}

function createMakeabilityLab2ndRow(x, y){
  let row2 = new Array(MAKELAB_GRID_COLS);
  let col = 0;
  row2[col++] = Cell.createCell(x, y, TRIANGLE_SIZE, TriangleDir.BottomLeft, TriangleDir.TopRight);

  x += TRIANGLE_SIZE;
  row2[col++] = Cell.createCell(x, y, TRIANGLE_SIZE, TriangleDir.TopLeft, TriangleDir.BottomRight);

  x += TRIANGLE_SIZE;
  row2[col++] = Cell.createCellWithBottomTriangleOnly(x, y, TRIANGLE_SIZE, TriangleDir.BottomLeft);

  x += TRIANGLE_SIZE;
  row2[col++] = Cell.createCellWithBottomTriangleOnly(x, y, TRIANGLE_SIZE, TriangleDir.BottomRight);

  x += TRIANGLE_SIZE;
  row2[col++] = Cell.createCell(x, y, TRIANGLE_SIZE, TriangleDir.BottomLeft, TriangleDir.TopRight);

  x += TRIANGLE_SIZE;
  row2[col++] = Cell.createCell(x, y, TRIANGLE_SIZE, TriangleDir.TopLeft, TriangleDir.BottomRight);

  return row2;
}

function createMakeabilityLab3rdRow(x, y){
  let row3 = new Array(MAKELAB_GRID_COLS);
  for(let col = 0; col < row3.length; col++){
    let triDir = TriangleDir.TopLeft;
    if(col % 2 != 0){
      triDir = TriangleDir.TopRight;
    }
    row3[col] = Cell.createCell(x, y, TRIANGLE_SIZE, triDir);
    x += TRIANGLE_SIZE;
  }
  return row3;
}

function createMakeabilityLabBottomRow(x, y){
  let botRow = new Array(MAKELAB_GRID_COLS);
  for(let col = 0; col < botRow.length; col++){
    let triDir = TriangleDir.TopRight;
    if(col % 2 != 0){
      triDir = TriangleDir.TopLeft;
    }
    botRow[col] = Cell.createCellWithTopTriangleOnly(x, y, TRIANGLE_SIZE, triDir);
    x += TRIANGLE_SIZE;
  }
  return botRow;
}

function draw() {
  background(10);
  // makeLabGrid[0][0].draw();
  // makeLabGrid[0][1].draw();
  for(let row = 0; row < makeLabGrid.length; row++){
    for(let col = 0; col < makeLabGrid[row].length; col++){
      makeLabGrid[row][col].draw();
    }
  }

  for(let row = 0; row < makeLabLogo.length; row++){
    if(makeLabLogo[row]){
      for(let col = 0; col < makeLabLogo[row].length; col++){
        if(makeLabLogo[row][col]){
          makeLabLogo[row][col].draw();
        }
      }
    }
  }

  // let tri = new Triangle(150, 150, TRIANGLE_SIZE, TriangleDir.TopLeft);
  // tri.draw();

  // tri = new Triangle(200, 200, 50, TriangleDir.TopRight);
  // tri.draw();

  // tri = new Triangle(250, 250, 50, TriangleDir.BottomLeft);
  // tri.draw();

  // tri = new Triangle(300, 300, 50, TriangleDir.BottomRight);
  // tri.draw();
}

class Cell{
  constructor(triangle1, triangle2){
    this.tri1 = triangle1;
    this.tri2 = triangle2;
  }

  get x(){
    return this.tri1.x;
  }

  get y(){
    return this.tri1.y;
  }

  get size(){
    return this.tri1.size;
  }

  draw(){
    if(this.tri1.visible){
      this.tri1.draw();
    }

    if(this.tri2.visible){
      this.tri2.draw();
    }
  }

  static createEmptyCell(x, y, size){
    let tri1 = new Triangle(x, y, size, TriangleDir.TopLeft);
    let tri2 = new Triangle(x, y, size, Triangle.getOppositeDirection(TriangleDir.TopLeft));
    tri1.visible = false;
    tri2.visible = false;
    return new Cell(tri1, tri2);
  }

  static createCellWithTopTriangleOnly(x, y, size, topTriangleDir){
    let tri1 = new Triangle(x, y, size, topTriangleDir);
    let tri2 = new Triangle(x, y, size, Triangle.getOppositeDirection(topTriangleDir));
    tri2.visible = false;
    return new Cell(tri1, tri2);
  }

  static createCellWithBottomTriangleOnly(x, y, size, botTriangleDir){
    let tri1 = new Triangle(x, y, size, Triangle.getOppositeDirection(botTriangleDir));
    let tri2 = new Triangle(x, y, size, botTriangleDir);
    tri1.visible = false;
    return new Cell(tri1, tri2);
  }

  static createCell(x, y, size, triangle1Dir, triangle2Dir){
    let tri1 = new Triangle(x, y, size, triangle1Dir);

    if(!triangle2Dir){
      triangle2Dir = Triangle.getOppositeDirection(triangle1Dir);
    }
    let tri2 = new Triangle(x, y, size, triangle2Dir);
    return new Cell(tri1, tri2);
  }
}

class Triangle{
  constructor(x, y, size, direction, fillColor = null, 
    strokeColor = color(255), strokeWeight = 1, visible = true) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.direction = direction;

    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
    this.strokeWeight = strokeWeight;
    this.visible = visible;
  }

  draw(){
    push();
      if(this.fillColor){
        fill(this.fillColor);
      }else{
        noFill();
      }

      if(this.strokeColor){
        stroke(this.strokeColor);
      }else{
        noStroke();
      }
     
      translate(this.x, this.y);
      
      push();
      switch(this.direction){
        case TriangleDir.BottomLeft:
          triangle(0, 0, 0, this.size, this.size, this.size);
          break;
        case TriangleDir.BottomRight:
          triangle(0, this.size, this.size, this.size, this.size, 0);
          break;
        case TriangleDir.TopRight:
          triangle(0, 0, this.size, 0, this.size, this.size);
          break;
        case TriangleDir.TopLeft:
        default:
          triangle(0, this.size, 0, 0, this.size, 0);
          break;
      } 
      pop();
      

      if(DEBUG){
        stroke(128, 128, 128, 50);
        rect(0, 0, this.size, this.size);
      }
    pop();
  }

  static getOppositeDirection(triangleDir){
    switch(triangleDir){
      case TriangleDir.BottomLeft:
        return TriangleDir.TopRight;
      case TriangleDir.BottomRight:
        return TriangleDir.TopLeft;
      case TriangleDir.TopRight:
        return TriangleDir.BottomLeft;
      case TriangleDir.TopLeft:
      default:
        return TriangleDir.BottomRight;
    } 
  }
}