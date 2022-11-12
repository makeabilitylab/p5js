class Cell {
  constructor(triangle1, triangle2) {
    this.tri1 = triangle1;
    this.tri2 = triangle2;
  }

  get x() {
    return this.tri1.x;
  }

  get y() {
    return this.tri1.y;
  }

  get size() {
    return this.tri1.size;
  }

  draw() {
    if (this.tri1.visible) {
      this.tri1.draw();
    }

    if (this.tri2.visible) {
      this.tri2.draw();
    }
  }

  static createEmptyCell(x, y, size) {
    let tri1 = new Triangle(x, y, size, TriangleDir.TopLeft);
    let tri2 = new Triangle(x, y, size, Triangle.getOppositeDirection(TriangleDir.TopLeft));
    tri1.visible = false;
    tri2.visible = false;
    return new Cell(tri1, tri2);
  }

  static createCellWithTopTriangleOnly(x, y, size, topTriangleDir) {
    let tri1 = new Triangle(x, y, size, topTriangleDir);
    let tri2 = new Triangle(x, y, size, Triangle.getOppositeDirection(topTriangleDir));
    tri2.visible = false;
    return new Cell(tri1, tri2);
  }

  static createCellWithBottomTriangleOnly(x, y, size, botTriangleDir) {
    let tri1 = new Triangle(x, y, size, Triangle.getOppositeDirection(botTriangleDir));
    let tri2 = new Triangle(x, y, size, botTriangleDir);
    tri1.visible = false;
    return new Cell(tri1, tri2);
  }

  static createCell(x, y, size, triangle1Dir, triangle2Dir) {
    let tri1 = new Triangle(x, y, size, triangle1Dir);

    if (!triangle2Dir) {
      triangle2Dir = Triangle.getOppositeDirection(triangle1Dir);
    }
    let tri2 = new Triangle(x, y, size, triangle2Dir);
    return new Cell(tri1, tri2);
  }
}