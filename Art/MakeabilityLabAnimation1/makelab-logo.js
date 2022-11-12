class MakeabilityLabLogo {

  constructor(x, y, triangleSize) {
    this.makeLabLogo = MakeabilityLabLogo.createMakeabilityLabLogo(x, y, triangleSize);
    this.visible = true;

    this.isMOutlineVisible = true;
    this.isLOutlineVisible = true;
  }

  /**
   * The logo has 6 cols and 4 rows
   */
  static get numRows() { return 4; }

  /**
   * The logo has 6 cols and 4 rows
   */
  static get numCols() { return 6; }

  get x(){ return this.makeLabLogo[0][0].x }

  get y(){ return this.makeLabLogo[0][0].y }

  get cellSize(){ return this.makeLabLogo[0][0].size }

  get width(){ return MakeabilityLabLogo.numCols * this.makeLabLogo[0][0].size }

  get height(){ return MakeabilityLabLogo.numRows * this.makeLabLogo[0][0].size }

  draw() {
    for (let row = 0; row < this.makeLabLogo.length; row++) {
      if (this.makeLabLogo[row]) {
        for (let col = 0; col < this.makeLabLogo[row].length; col++) {
          if (this.makeLabLogo[row][col]) {
            this.makeLabLogo[row][col].draw();
          }
        }
      }
    }

    if(this.isMOutlineVisible){
      push();
      noFill();
      stroke(255);
      strokeWeight(4);
      beginShape();
      let mPoints = this.getMOutlinePoints();
      for (const [x, y] of mPoints) { 
        vertex(x, y);
      }
      endShape();
      pop();
    }
  }

  getLOutlinePoints(){
    let lPoints = new Array();

    lPoints.push([this.x, this.y + this.cellSize]);
    lPoints.push([this.x + this.cellSize, this.y]);
    lPoints.push([this.x + 2 * this.cellSize, this.y + this.cellSize]);
    lPoints.push([this.x + 3 * this.cellSize, this.y + 2 * this.cellSize]);
    lPoints.push([this.x + 4 * this.cellSize, this.y + this.cellSize]);
    lPoints.push([this.x + 5 * this.cellSize, this.y + 2 * this.cellSize]);


    return lPoints
  }

  getMOutlinePoints(){
    let mPoints = new Array();

    // Top part
    mPoints.push([this.x, this.y + this.cellSize]);
    mPoints.push([this.x + this.cellSize, this.y]);
    mPoints.push([this.x + 2 * this.cellSize, this.y + this.cellSize]);
    mPoints.push([this.x + 3 * this.cellSize, this.y + 2 * this.cellSize]);
    mPoints.push([this.x + 4 * this.cellSize, this.y + this.cellSize]);
    mPoints.push([this.x + 5 * this.cellSize, this.y]);
    mPoints.push([this.x + 6 * this.cellSize, this.y + this.cellSize]);

    // Right part
    mPoints.push([this.x + 6 * this.cellSize, this.y + 2 * this.cellSize]);
    mPoints.push([this.x + 6 * this.cellSize, this.y + 3 * this.cellSize]);
    mPoints.push([this.x + 5 * this.cellSize, this.y + 4 * this.cellSize]);

    // Bottom part
    mPoints.push([this.x + 4 * this.cellSize, this.y + 3 * this.cellSize]);
    mPoints.push([this.x + 3 * this.cellSize, this.y + 4 * this.cellSize]);
    mPoints.push([this.x + 2 * this.cellSize, this.y + 3 * this.cellSize]);
    mPoints.push([this.x + 1 * this.cellSize, this.y + 4 * this.cellSize]);
    mPoints.push([this.x + 0 * this.cellSize, this.y + 3 * this.cellSize]);

    // Left part
    mPoints.push([this.x + 0 * this.cellSize, this.y + 2 * this.cellSize]);
    mPoints.push([this.x + 0 * this.cellSize, this.y + 1 * this.cellSize]);
   
    return mPoints;
  }

  static createMakeabilityLabLogo(x, y, triangleSize) {
    let mlLogo = new Array(MakeabilityLabLogo.numRows);

    // Initialize the make lab logo grid
    for (let row = 0; row < mlLogo.length; row++) {
      mlLogo[row] = new Array(MakeabilityLabLogo.numCols);
    }

    mlLogo[0] = MakeabilityLabLogo.createMakeabilityLabTopRow(x, y, triangleSize);

    y += triangleSize;
    mlLogo[1] = MakeabilityLabLogo.createMakeabilityLab2ndRow(x, y, triangleSize);

    y += triangleSize;
    mlLogo[2] = MakeabilityLabLogo.createMakeabilityLab3rdRow(x, y, triangleSize);

    y += triangleSize;
    mlLogo[3] = MakeabilityLabLogo.createMakeabilityLabBottomRow(x, y, triangleSize);

    return mlLogo;
  }

  static createMakeabilityLabTopRow(x, y, triangleSize) {
    let topRow = new Array(MakeabilityLabLogo.numCols);
    let col = 0;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);

    x += triangleSize;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);

    x += triangleSize;
    topRow[col++] = Cell.createEmptyCell(x, y, triangleSize);

    x += triangleSize;
    topRow[col++] = Cell.createEmptyCell(x, y, triangleSize);

    x += triangleSize;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);

    x += triangleSize;
    topRow[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);

    return topRow;
  }

  static createMakeabilityLab2ndRow(x, y, triangleSize) {
    let row2 = new Array(MakeabilityLabLogo.numCols);
    let col = 0;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.BottomLeft, TriangleDir.TopRight);

    x += triangleSize;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopLeft, TriangleDir.BottomRight);

    x += triangleSize;
    row2[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);

    x += triangleSize;
    row2[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);

    x += triangleSize;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.BottomLeft, TriangleDir.TopRight);

    x += triangleSize;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopLeft, TriangleDir.BottomRight);

    return row2;
  }

  static createMakeabilityLab3rdRow(x, y, triangleSize) {
    let row3 = new Array(MakeabilityLabLogo.numCols);
    for (let col = 0; col < row3.length; col++) {
      let triDir = TriangleDir.TopLeft;
      if (col % 2 != 0) {
        triDir = TriangleDir.TopRight;
      }
      row3[col] = Cell.createCell(x, y, triangleSize, triDir);
      x += triangleSize;
    }
    return row3;
  }

  static createMakeabilityLabBottomRow(x, y, triangleSize) {
    let botRow = new Array(MakeabilityLabLogo.numCols);
    for (let col = 0; col < botRow.length; col++) {
      let triDir = TriangleDir.TopRight;
      if (col % 2 != 0) {
        triDir = TriangleDir.TopLeft;
      }
      botRow[col] = Cell.createCellWithTopTriangleOnly(x, y, triangleSize, triDir);
      x += triangleSize;
    }
    return botRow;
  }
}