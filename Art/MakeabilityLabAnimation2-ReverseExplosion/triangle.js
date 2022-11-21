class Triangle {
  constructor(x, y, size, direction, fillColor = color(255),
    strokeColor = color(0), strokeWeight = 1, visible = true) {
    this.x = x;
    this.y = y;
    this.size = size;
    this.direction = direction;
    this.angle = 0;

    this.strokeColor = strokeColor;
    this.fillColor = fillColor;
    this.strokeWeight = strokeWeight;
    this.visible = visible;

    this.isFillVisible = true;
    this.isStrokeVisible = true;

    this.drawCellOutline = false; // for debugging
  }

  draw() {
    if(!this.visible){ return; }

    push();
    if (this.fillColor && this.isFillVisible) {
      fill(this.fillColor);
    } else {
      noFill();
    }

    if (this.strokeColor && this.isStrokeVisible) {
      stroke(this.strokeColor);
    } else {
      noStroke();
    }

    translate(this.x, this.y);

    // draw the triangle
    push();
    rotate(this.angle);
    switch (this.direction) {
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

    // useful for debugging
    if (this.drawCellOutline) {
      stroke(128, 128, 128, 50);
      rect(0, 0, this.size, this.size);
    }
    pop();
  }

  static getOppositeDirection(triangleDir) {
    switch (triangleDir) {
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