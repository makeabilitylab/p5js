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

let makeLabLogo = null;
let makeLabGrid = null;

function setup() {
  createCanvas(800, 600);
  
  angleMode(DEGREES); 

  makeLabLogo = new MakeabilityLabLogo(5*TRIANGLE_SIZE, 4*TRIANGLE_SIZE, TRIANGLE_SIZE);
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





function draw() {
  background(10);
  // makeLabGrid[0][0].draw();
  // makeLabGrid[0][1].draw();
  for(let row = 0; row < makeLabGrid.length; row++){
    for(let col = 0; col < makeLabGrid[row].length; col++){
      makeLabGrid[row][col].draw();
    }
  }

  makeLabLogo.draw();
  
}