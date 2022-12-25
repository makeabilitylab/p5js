const COLOR_SANTA_FACE = "#fdf2d0";
const COLOR_SANTA_SUIT_RED = "#cc4133";
const COLOR_SANTA_SUIT_WHITE = "#ffffff";
const COLOR_SANTA_NOSE = "#f9da78";
const COLOR_SANTA_MOUTH = "#f3af56";
const COLOR_SANTA_BELT = "#272425";

class TriangleSanta {

    constructor(x, y, triangleSize) {
      this.santaArray = TriangleSanta.createTriangleSanta(x, y, triangleSize);
      this.visible = true;
    }
  
    /**
     * The logo has 10 cols and 9 rows
     */
    static get numRows() { return 9; }
  
    /**
     * The logo has 10 cols and 9 rows
     */
    static get numCols() { return 10; }
  
    get x(){ return this.santaArray[0][0].x }
  
    get y(){ return this.santaArray[0][0].y }
  
    get cellSize(){ return this.santaArray[0][0].size }
  
    get width(){ return TriangleSanta.numCols * this.santaArray[0][0].size }
  
    get height(){ return TriangleSanta.numRows * this.santaArray[0][0].size }
  
  
    setStrokeTransparent(isTransparent){
      for (const tri of this.getAllTriangles()) {
        tri.isStrokeVisible = !isTransparent;
      }
    }
  
    /**
     * Sets the internal triangles to transparent
     * @param {Boolean} isTransparent 
     * @param {Boolean} includeMShadowTriangles 
     */
    setFillTransparent(isTransparent){
      for (const tri of this.getAllTriangles()) {
        tri.isFillVisible = !isTransparent;
      }
    }
  
    /**
     * Convenience method to set fill and stroke colors
     * @param {*} fillColor 
     * @param {*} strokeColor 
     */
    setColors(fillColor, strokeColor){
      for (let row = 0; row < this.santaArray.length; row++) {
        for (let col = 0; col < this.santaArray[row].length; col++) {
          this.santaArray[row][col].setFillColor(fillColor);
          this.santaArray[row][col].setStrokeColor(strokeColor);
        }
      }  
    }

    setStrokeColors(strokeColor){
      for (let row = 0; row < this.santaArray.length; row++) {
        for (let col = 0; col < this.santaArray[row].length; col++) {
          this.santaArray[row][col].setStrokeColor(strokeColor);
        }
      } 
    }
  
    getAllTriangles(){
      let allTriangles = new Array();
      for (let row = 0; row < this.santaArray.length; row++) {
        for (let col = 0; col < this.santaArray[row].length; col++) {         
          allTriangles.push(this.santaArray[row][col].tri1);
          allTriangles.push(this.santaArray[row][col].tri2);
        }
      }  
      return allTriangles;
    }
  
    draw() {
      if(!this.visible){ return; }
  
      for (let row = 0; row < this.santaArray.length; row++) {
        for (let col = 0; col < this.santaArray[row].length; col++) {
          this.santaArray[row][col].draw();
        }
      }
    }
  
    static setRandomColors(triangles, isFillVisible=true, isStrokeVisible=true){
      for(const tri of triangles){
        const fillColor = Colorer.getRandomOriginalColor();
        tri.fillColor = fillColor;
        tri.startFillColor = fillColor;
        tri.endFillColor = fillColor;
        tri.strokeColor = fillColor;
        tri.isFillVisible = isFillVisible;
        tri.isStrokeVisible = isStrokeVisible;
      }
    }
  
    static setColors(triangles, fillColor, strokeColor, isFillVisible=true, isStrokeVisible=true){
      for(const tri of triangles){
        tri.fillColor = fillColor;
        tri.startFillColor = fillColor;
        tri.endFillColor = fillColor;
        tri.strokeColor = strokeColor;
        tri.isFillVisible = isFillVisible;
        tri.isStrokeVisible = isStrokeVisible;
      }
    }
  
    //TODO: in future read in like a .csv or json pixel grid with this info so can create any shape
    //      but maybe that's just an SVG? Don't want to recreate existing format
    static createTriangleSanta(x, y, triangleSize) {
      let triSanta = new Array(TriangleSanta.numRows);
  
      // Initialize the make lab logo grid
      for (let row = 0; row < triSanta.length; row++) {
        triSanta[row] = new Array(TriangleSanta.numCols);
      }
  
      triSanta[0] = TriangleSanta.createSantaTopRow(x, y, triangleSize);

      y += triangleSize;
      triSanta[1] = TriangleSanta.createSanta2ndRow(x, y, triangleSize);
  
      y += triangleSize;
      triSanta[2] = TriangleSanta.createSanta3rdRow(x, y, triangleSize);
  
      y += triangleSize;
      triSanta[3] = TriangleSanta.createSanta4thRow(x, y, triangleSize);

      y += triangleSize;
      triSanta[4] = TriangleSanta.createSanta5thRow(x, y, triangleSize);

      y += triangleSize;
      triSanta[5] = TriangleSanta.createSanta6thRow(x, y, triangleSize);

      y += triangleSize;
      triSanta[6] = TriangleSanta.createSanta7thRow(x, y, triangleSize);

      y += triangleSize;
      triSanta[7] = TriangleSanta.createSanta8thRow(x, y, triangleSize);

      y += triangleSize;
      triSanta[8] = TriangleSanta.createSanta9thRow(x, y, triangleSize);
  
      // y += triangleSize;
      // triSanta[3] = TriangleSanta.createSanta4thRow(x, y, triangleSize);
  
      return triSanta;
    }

    static getSantaSuitColor(){
      const brightnessAmt = random(75, 100);
      const newRed = ColorUtils.changeColorBrightness(color(COLOR_SANTA_SUIT_RED), brightnessAmt);
      return newRed;
    }

    static getSantaBeltColor(){
      const brightnessAmt = random(8, 22);
      const newBelt = ColorUtils.changeColorBrightness(color(COLOR_SANTA_BELT), brightnessAmt);
      return newBelt;
    }

    static getSantaWhiteColor(){
      const brightnessAmt = randomGaussian(99, 2);
      const newWhite = ColorUtils.changeColorBrightness(color(COLOR_SANTA_SUIT_WHITE), brightnessAmt);
      return newWhite;
    }

    static getSantaNoseColor(){
      const brightnessAmt = random(97, 100);
      const newWhite = ColorUtils.changeColorBrightness(color(COLOR_SANTA_NOSE), brightnessAmt);
      return newWhite;
    }

    static getSantaMouthColor(){
      const brightnessAmt = random(94, 100);
      const newWhite = ColorUtils.changeColorBrightness(color(COLOR_SANTA_MOUTH), brightnessAmt);
      return newWhite;
    }

    static getSantaFaceColor(){
      const brightnessAmt = randomGaussian(99, 1);
      const saturationAmt = random(20, 30);
      const newFaceColor = ColorUtils.changeColorSaturationAndBrightness(
        color(COLOR_SANTA_FACE), saturationAmt, brightnessAmt);
      return newFaceColor;
    }
  
    static createSantaTopRow(x, y, triangleSize) {
      let topRow = new Array(TriangleSanta.numCols);
      let col = 0;

      for (let col = 0; col < topRow.length; col++) {
        let cell;
        const santaSuitColor = TriangleSanta.getSantaSuitColor();
        if(col === 4){
          cell = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);
          cell.setColors(santaSuitColor);
        }else if(col === 5){
          cell = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);
          cell.setColors(santaSuitColor);
        }else{
          cell = Cell.createEmptyCell(x, y, triangleSize);
        }
        topRow[col] = cell;
        x += triangleSize;
      }
  
      return topRow;
    }

    static createSanta2ndRow(x, y, triangleSize) {
      let row2 = new Array(TriangleSanta.numCols);
      let col = 0;

      for (let col = 0; col < row2.length; col++) {
        let cell;
        const santaSuitColor1 = TriangleSanta.getSantaSuitColor();
        const santaSuitColor2 = TriangleSanta.getSantaSuitColor();
        if(col === 4){
          cell = Cell.createCell(x, y, triangleSize, TriangleDir.BottomLeft);
          cell.tri1.setColors(santaSuitColor1);
          cell.tri2.setColors(santaSuitColor2);
        }else if(col === 5){
          cell = Cell.createCell(x, y, triangleSize, TriangleDir.BottomRight);
          cell.tri1.setColors(santaSuitColor1);
          cell.tri2.setColors(santaSuitColor2);
        }else if(col === 3){
          cell = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomRight);
          cell.tri1.setColors(santaSuitColor1);
          cell.tri2.setColors(santaSuitColor2);
        }else if(col === 6){
          cell = Cell.createCellWithBottomTriangleOnly(x, y, triangleSize, TriangleDir.BottomLeft);
          cell.tri1.setColors(santaSuitColor1);
          cell.tri2.setColors(santaSuitColor2);
        }else{
          cell = Cell.createEmptyCell(x, y, triangleSize);
        }
        row2[col] = cell;
        x += triangleSize;
      }
  
      return row2;
    }

    static createSanta3rdRow(x, y, triangleSize) {
      let row3 = new Array(TriangleSanta.numCols);
      let col = 0;

      for (let col = 0; col < row3.length; col++) {
        let triDir = TriangleDir.TopLeft;
        if (col % 2 != 0) {
          triDir = TriangleDir.TopRight;
        }
        
        row3[col] = Cell.createCell(x, y, triangleSize, triDir);

        if(col < 2 || col > 7){
          row3[col].setVisibility(false);
        }else if(col === 2){
          row3[col].tri1.visible = false;
        }else if(col === 7){
          row3[col].tri1.visible = false;
        }
        
        const santaWhiteColor1 = TriangleSanta.getSantaWhiteColor();
        const santaWhiteColor2 = TriangleSanta.getSantaWhiteColor();
        row3[col].tri1.setColors(santaWhiteColor1);
        row3[col].tri2.setColors(santaWhiteColor2);
        x += triangleSize;
      }
  
      return row3;
    }

    static createSanta4thRow(x, y, triangleSize) {
      let row4 = new Array(TriangleSanta.numCols);
      let col = 0;

      for (let col = 0; col < row4.length; col++) {
        let triDir = TriangleDir.TopRight;
        if (col % 2 != 0) {
          triDir = TriangleDir.TopLeft;
        }
        
        row4[col] = Cell.createCell(x, y, triangleSize, triDir);
        
        const santaWhiteColor1 = TriangleSanta.getSantaWhiteColor();
        const santaWhiteColor2 = TriangleSanta.getSantaWhiteColor();
        if(col === 1 || col == 8){
          row4[col].tri1.visible = false;
          row4[col].tri1.setColors(santaWhiteColor1);
          row4[col].tri2.setColors(santaWhiteColor2);
        }else if(col < 1 || col > 8){
          row4[col].setVisibility(false);
          row4[col].tri1.setColors(santaWhiteColor1);
          row4[col].tri2.setColors(santaWhiteColor2);
        }else{
          const santaFaceColor1 = TriangleSanta.getSantaFaceColor();
          const santaFaceColor2 = TriangleSanta.getSantaFaceColor();

          row4[col].tri1.setColors(santaFaceColor1);
          row4[col].tri2.setColors(santaFaceColor2);

          if(col === 4 || col === 5){
            const santaNoseColor = TriangleSanta.getSantaNoseColor();
            row4[col].tri1.setColors(santaNoseColor);
          }
        }
        
        
        x += triangleSize;
      }
      
      return row4;
    }

    static createSanta5thRow(x, y, triangleSize) {
      let row5 = new Array(TriangleSanta.numCols);
      let col = 0;

      for (let col = 0; col < row5.length; col++) {
        let triDir = TriangleDir.TopLeft;
        if (col % 2 != 0) {
          triDir = TriangleDir.TopRight;
        }
        
        row5[col] = Cell.createCell(x, y, triangleSize, triDir);

        const santaWhiteColor1 = TriangleSanta.getSantaWhiteColor();
        const santaWhiteColor2 = TriangleSanta.getSantaWhiteColor();

        row5[col].tri1.setColors(santaWhiteColor1);
        row5[col].tri2.setColors(santaWhiteColor2);

        const santaSuitColor1 = TriangleSanta.getSantaSuitColor();
        const santaSuitColor2 = TriangleSanta.getSantaSuitColor();
        
        if(col === 0 || col === 9){
          row5[col].tri1.visible = false;
          row5[col].tri1.setColors(santaSuitColor1);
          row5[col].tri2.setColors(santaSuitColor2);
        }else if(col === 1 || col === 8){
        
          row5[col].tri1.setColors(santaWhiteColor1);
          row5[col].tri2.setColors(santaSuitColor2);
        }
        
        x += triangleSize;
      }
      
      return row5;
    }

    static createSanta6thRow(x, y, triangleSize) {
      let row6 = new Array(TriangleSanta.numCols);
      let col = 0;

      for (let col = 0; col < row6.length; col++) {
        let triDir = TriangleDir.TopRight;
        if (col % 2 != 0) {
          triDir = TriangleDir.TopLeft;
        }
        
        row6[col] = Cell.createCell(x, y, triangleSize, triDir);

        const santaWhiteColor1 = TriangleSanta.getSantaWhiteColor();
        const santaWhiteColor2 = TriangleSanta.getSantaWhiteColor();

        const santaSuitColor1 = TriangleSanta.getSantaSuitColor();
        const santaSuitColor2 = TriangleSanta.getSantaSuitColor();
        
        if(col < 2 || col > 7){
          row6[col].tri1.setColors(santaSuitColor1);
          row6[col].tri2.setColors(santaSuitColor2);
        }else{
          row6[col].tri1.setColors(santaWhiteColor1);
          row6[col].tri2.setColors(santaWhiteColor2);
        }

        if(col === 4 || col === 5){
          const santaMouthColor = TriangleSanta.getSantaMouthColor();
          row6[col].tri1.setColors(santaMouthColor);
        }else if(col === 2 || col === 7){
          row6[col].tri2.setColors(santaSuitColor2);
        }
        
        x += triangleSize;
      }
      
      return row6;
    }

    static createSanta7thRow(x, y, triangleSize) {
      let row7 = new Array(TriangleSanta.numCols);
      let col = 0;

      for (let col = 0; col < row7.length; col++) {
        let triDir = TriangleDir.TopLeft;
        if (col % 2 != 0) {
          triDir = TriangleDir.TopRight;
        }
        
        row7[col] = Cell.createCell(x, y, triangleSize, triDir);

        const santaWhiteColor1 = TriangleSanta.getSantaWhiteColor();
        const santaWhiteColor2 = TriangleSanta.getSantaWhiteColor();

        const santaBeltColor1 = TriangleSanta.getSantaBeltColor();
        const santaBeltColor2 = TriangleSanta.getSantaBeltColor();

        if(col < 3 || col > 6){
          row7[col].tri1.setColors(santaBeltColor1);
          row7[col].tri2.setColors(santaBeltColor2);
        }else{
          row7[col].tri1.setColors(santaWhiteColor1);
          row7[col].tri2.setColors(santaWhiteColor2);
        }

        if(col === 3 || col === 6){
          row7[col].tri2.setColors(santaBeltColor2);
        }
        
        x += triangleSize;
      }
      
      return row7;
    }

    static createSanta8thRow(x, y, triangleSize) {
      let row8 = new Array(TriangleSanta.numCols);
      let col = 0;

      for (let col = 0; col < row8.length; col++) {
        let triDir = TriangleDir.TopRight;
        if (col % 2 != 0) {
          triDir = TriangleDir.TopLeft;
        }
        
        row8[col] = Cell.createCell(x, y, triangleSize, triDir);

        const santaWhiteColor1 = TriangleSanta.getSantaWhiteColor();
        const santaWhiteColor2 = TriangleSanta.getSantaWhiteColor();

        const santaBeltColor1 = TriangleSanta.getSantaBeltColor();
        const santaBeltColor2 = TriangleSanta.getSantaBeltColor();

        if(col < 4 || col > 5){
          row8[col].tri1.setColors(santaBeltColor1);
          row8[col].tri2.setColors(santaBeltColor2);
        }else{
          row8[col].tri1.setColors(santaWhiteColor1);
          row8[col].tri2.setColors(santaWhiteColor2);
        }

        if(col === 0 || col === 9){
          row8[col].tri2.visible = false;
        }else if(col === 4 || col === 5){
          row8[col].tri2.setColors(santaBeltColor2);
        }
        
        x += triangleSize;
      }
      
      return row8;
    }

    static createSanta9thRow(x, y, triangleSize) {
      let row9 = new Array(TriangleSanta.numCols);
      let col = 0;

      for (let col = 0; col < row9.length; col++) {
        let triDir = TriangleDir.TopLeft;
        if (col % 2 != 0) {
          triDir = TriangleDir.TopRight;
        }
        
        row9[col] = Cell.createCell(x, y, triangleSize, triDir);

        const santaSuitColor1 = TriangleSanta.getSantaSuitColor();
        const santaSuitColor2 = TriangleSanta.getSantaSuitColor();

        if(col > 0 && col < 9){
          row9[col].tri1.setColors(santaSuitColor1);
          row9[col].tri2.setColors(santaSuitColor2);

          if(col === 1 || col === 8){
            row9[col].tri2.visible = false;
          }
        }else{
          row9[col].setVisibility(false);
        }
        
        x += triangleSize;
      }
      
      return row9;
    }
  }