class MakeabilityLabLogo {

  constructor(x, y, triangleSize) {
    this.makeLabLogoArray = MakeabilityLabLogo.createMakeabilityLabLogo(x, y, triangleSize);

    this.visible = true;
    this.isMOutlineVisible = true;
    this.isLOutlineVisible = true;

    this.areLTrianglesVisible = false;

    for(const tri of this.getMShadowTriangles()){
      tri.fillColor = tri.strokeColor;
    }

    this.colorScheme = ColorScheme.BlackOnWhite;

    this._defaultColorsOn = true;
    this.setDefaultColoredTriangleVisibility(this._defaultColorsOn);
    //this.setColorScheme(ColorScheme.BlackOnWhite);
  }

  /**
   * The logo has 6 cols and 4 rows
   */
  static get numRows() { return 4; }

  /**
   * The logo has 6 cols and 4 rows
   */
  static get numCols() { return 6; }

  get x(){ return this.makeLabLogoArray[0][0].x }

  get y(){ return this.makeLabLogoArray[0][0].y }

  get cellSize(){ return this.makeLabLogoArray[0][0].size }

  get width(){ return MakeabilityLabLogo.numCols * this.makeLabLogoArray[0][0].size }

  get height(){ return MakeabilityLabLogo.numRows * this.makeLabLogoArray[0][0].size }

  get areDefaultColorsOn(){ return this._defaultColorsOn; }

  set areLTrianglesVisible(visible){ 
    for(const tri of this.getLTriangles()){
      tri.visible = visible;
    }
  }
  
  get areLTrianglesVisible(){
    let visible = true;
    for(const tri of this.getLTriangles()){
      visible &= tri.visible;
    }
    return visible;
  }

  get colorScheme() { return this._colorScheme; }

  set colorScheme(colorScheme){
    this._colorScheme = colorScheme;

    let fillColor = null;
    let strokeColor = null;
    switch(colorScheme){
      case ColorScheme.BlackOnWhite:
        fillColor = color(255);
        strokeColor = color(0);
        break;
      case ColorScheme.WhiteOnBlack:
      default:
        fillColor = color(0);
        strokeColor = color(255);
        break;
    }

    for (let row = 0; row < this.makeLabLogoArray.length; row++) {
      for (let col = 0; col < this.makeLabLogoArray[row].length; col++) {
        this.makeLabLogoArray[row][col].tri1.fillColor = fillColor;
        this.makeLabLogoArray[row][col].tri1.strokeColor = strokeColor;

        this.makeLabLogoArray[row][col].tri2.fillColor = fillColor;
        this.makeLabLogoArray[row][col].tri2.strokeColor = strokeColor;
      }
    }  

    for(const tri of this.getMShadowTriangles()){
      tri.fillColor = tri.strokeColor;
    }

    if(this.areDefaultColorsOn){
      this.setDefaultColoredTriangleVisibility(this.areDefaultColorsOn);
    }
  }

  /**
   * Gets the triangles that are black/darkened in the logo
   */
  getMShadowTriangles(){
    let mShadowTriangles = new Array();
    
    // left side
    mShadowTriangles.push(this.makeLabLogoArray[2][1].tri2);
    mShadowTriangles.push(this.makeLabLogoArray[3][1].tri1);
    
    // right side
    mShadowTriangles.push(this.makeLabLogoArray[2][4].tri2);
    mShadowTriangles.push(this.makeLabLogoArray[3][4].tri1);

    return mShadowTriangles;
  }

  /**
   * Gets the triangles that compose the L in the Makeability Lab logo
   */
  getLTriangles(){
    let lTriangles = new Array();
    lTriangles.push(this.makeLabLogoArray[0][0].tri2);
    lTriangles.push(this.makeLabLogoArray[0][1].tri2);
    lTriangles.push(this.makeLabLogoArray[1][0].tri1);
    lTriangles.push(this.makeLabLogoArray[1][1].tri1);
    lTriangles.push(this.makeLabLogoArray[1][1].tri2);
    lTriangles.push(this.makeLabLogoArray[1][2].tri2);
    lTriangles.push(this.makeLabLogoArray[2][1].tri1);
    lTriangles.push(this.makeLabLogoArray[2][2].tri1);
    lTriangles.push(this.makeLabLogoArray[2][2].tri2);
    lTriangles.push(this.makeLabLogoArray[3][2].tri1);
    lTriangles.push(this.makeLabLogoArray[3][3].tri1);

    lTriangles.push(this.makeLabLogoArray[2][3].tri1);
    lTriangles.push(this.makeLabLogoArray[2][3].tri2);

    lTriangles.push(this.makeLabLogoArray[1][3].tri2);
    lTriangles.push(this.makeLabLogoArray[2][4].tri1);
    lTriangles.push(this.makeLabLogoArray[1][4].tri2);
    return lTriangles;
  }

  /**
   * Gets the triangles that are colored in the ML logo by default
   */
  getDefaultColoredTriangles(){
    let cTriangles = new Array();
    cTriangles.push(this.makeLabLogoArray[0][4].tri2);
    cTriangles.push(this.makeLabLogoArray[0][5].tri2);
    cTriangles.push(this.makeLabLogoArray[1][0].tri2);
    cTriangles.push(this.makeLabLogoArray[1][4].tri1);
    cTriangles.push(this.makeLabLogoArray[1][5].tri1);
    cTriangles.push(this.makeLabLogoArray[1][5].tri2);
    cTriangles.push(this.makeLabLogoArray[2][0].tri1);
    cTriangles.push(this.makeLabLogoArray[2][0].tri2);
    cTriangles.push(this.makeLabLogoArray[2][5].tri1);
    cTriangles.push(this.makeLabLogoArray[2][5].tri2);
    cTriangles.push(this.makeLabLogoArray[3][0].tri1);
    cTriangles.push(this.makeLabLogoArray[3][5].tri1);
    return cTriangles;
  }

  setDefaultColoredTriangleVisibility(visible){
    this._defaultColorsOn = visible;
    if(visible){
      this.makeLabLogoArray[0][4].tri2.fillColor = OriginalColorPaletteRGB.Blue; 
      this.makeLabLogoArray[0][5].tri2.fillColor = OriginalColorPaletteRGB.BlueGray
      this.makeLabLogoArray[1][0].tri2.fillColor = OriginalColorPaletteRGB.YellowGreen;
      this.makeLabLogoArray[1][4].tri1.fillColor = OriginalColorPaletteRGB.Purple;
      this.makeLabLogoArray[1][5].tri1.fillColor = OriginalColorPaletteRGB.Green;
      this.makeLabLogoArray[1][5].tri2.fillColor = OriginalColorPaletteRGB.Orange;
      this.makeLabLogoArray[2][0].tri1.fillColor = OriginalColorPaletteRGB.YellowGreen;
      this.makeLabLogoArray[2][0].tri2.fillColor = OriginalColorPaletteRGB.LightGreen;
      this.makeLabLogoArray[2][5].tri1.fillColor = OriginalColorPaletteRGB.Orange;
      this.makeLabLogoArray[2][5].tri2.fillColor = OriginalColorPaletteRGB.RedPurple;
      this.makeLabLogoArray[3][0].tri1.fillColor = OriginalColorPaletteRGB.BlueGreen;
      this.makeLabLogoArray[3][5].tri1.fillColor = OriginalColorPaletteRGB.Pink;
    }else{
      this.colorScheme = this.colorScheme;
    }
  }

  draw() {
    if(!this.visible){ return; }

    for (let row = 0; row < this.makeLabLogoArray.length; row++) {
      for (let col = 0; col < this.makeLabLogoArray[row].length; col++) {
          this.makeLabLogoArray[row][col].draw();
      }
    }

    if(this.isMOutlineVisible){
      push();
      noFill();
      stroke(this.makeLabLogoArray[0][0].tri1.strokeColor);
      strokeWeight(4);
      beginShape();
      let mPoints = this.getMOutlinePoints();
      for (const [x, y] of mPoints) { 
        vertex(x, y);
      }
      endShape();
      pop();
    }

    if(this.isLOutlineVisible){
      push();
      noFill();
      stroke(this.makeLabLogoArray[0][0].tri1.strokeColor);
      strokeWeight(4);
      beginShape();
      let lPoints = this.getLOutlinePoints();
      for (const [x, y] of lPoints) { 
        vertex(x, y);
      }
      endShape();
      pop();
    }
  }

  getLOutlinePoints(){
    let lPoints = new Array();

    // Top part
    lPoints.push([this.x, this.y + this.cellSize]);
    lPoints.push([this.x + this.cellSize, this.y]);
    lPoints.push([this.x + 2 * this.cellSize, this.y + this.cellSize]);
    lPoints.push([this.x + 3 * this.cellSize, this.y + 2 * this.cellSize]);
    lPoints.push([this.x + 4 * this.cellSize, this.y + this.cellSize]);

    // Right side
    lPoints.push([this.x + 5 * this.cellSize, this.y + 2 * this.cellSize]);
    lPoints.push([this.x + 4 * this.cellSize, this.y + 3 * this.cellSize]);
    lPoints.push([this.x + 3 * this.cellSize, this.y + 4 * this.cellSize]);

    // Bottom part
    lPoints.push([this.x + 2 * this.cellSize, this.y + 3 * this.cellSize]);
    lPoints.push([this.x + 1 * this.cellSize, this.y + 2 * this.cellSize]);
    lPoints.push([this.x + 0 * this.cellSize, this.y + 1 * this.cellSize]);

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
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopRight, TriangleDir.BottomLeft);

    x += triangleSize;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopLeft, TriangleDir.BottomRight);

    x += triangleSize;
    row2[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);

    x += triangleSize;
    row2[col++] = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);

    x += triangleSize;
    row2[col++] = Cell.createCell(x, y, triangleSize, TriangleDir.TopRight, TriangleDir.BottomLeft);

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