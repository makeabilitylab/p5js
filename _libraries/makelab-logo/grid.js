class Grid{
  constructor(gridWidth, triangleSize, strokeColor = color(100, 100, 100, 50), fillColor = null){
    this.gridArray = Grid.createGrid(gridWidth, triangleSize, strokeColor, fillColor);
    this.visible = true;
  }

  draw(){
    for(let row = 0; row < this.gridArray.length; row++){
      for(let col = 0; col < this.gridArray[row].length; col++){
        this.gridArray[row][col].draw();
      }
    }
  }

  setStrokeColor(strokeColor){
    for(let row = 0; row < this.gridArray.length; row++){
      for(let col = 0; col < this.gridArray[row].length; col++){
        this.gridArray[row][col].tri1.strokeColor = strokeColor;
        this.gridArray[row][col].tri2.strokeColor = strokeColor;
      }
    }
  }
  
  setFillColor(fillColor){
    for(let row = 0; row < this.gridArray.length; row++){
      for(let col = 0; col < this.gridArray[row].length; col++){
        this.gridArray[row][col].tri1.fillColor = fillColor;
        this.gridArray[row][col].tri2.fillColor = fillColor;
      }
    }
  }


  static createGrid(gridWidth, triangleSize, strokeColor, fillColor){

    const numGridRows = floor(gridWidth / triangleSize);
    const numGridColumns = floor(gridWidth / triangleSize);
  
    let grid = new Array(numGridRows);
  
    for(let row = 0; row < grid.length; row++){
      grid[row] = new Array(numGridColumns);
      for(let col = 0; col < grid[row].length; col++){
        let triDir = TriangleDir.TopLeft;
        if((row % 2 == 0 && col % 2 == 0) || (row % 2 != 0 && col % 2 != 0)){
          triDir = TriangleDir.TopRight;
        }
        let cell = Cell.createCell(col * triangleSize, row * triangleSize, triangleSize, triDir);
  
        cell.tri1.strokeColor = strokeColor;
        cell.tri2.strokeColor = strokeColor;

        if(fillColor){
          cell.tri1.fillColor = fillColor;
          cell.tri2.fillColor = fillColor;
        }

        grid[row][col] = cell;
      }
    }
    return grid;
  }
}