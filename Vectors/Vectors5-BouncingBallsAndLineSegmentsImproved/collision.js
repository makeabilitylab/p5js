// from: https://gamedev.stackexchange.com/a/110233
// http://geomalgorithms.com/a01-_area.html
function isLeft(p0, p1, p2) {
  return ((p1.x - p0.x) * (p2.y - p0.y) - (p2.x - p0.x) * (p1.y - p0.y));
}

// from: https://gamedev.stackexchange.com/a/110233
// http://geomalgorithms.com/a01-_area.html
function isPointInRectangle(p, x, y, z, w) {
  return (isLeft(x, y, p) > 0 &&
    isLeft(y, z, p) > 0 &&
    isLeft(z, w, p) > 0 &&
    isLeft(w, x, p) > 0);
}

// based on https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js
function checkLineRectCollision(x1, y1, x2, y2, rx1, ry1, rx2, ry2, rx3, ry3, rx4, ry4) {
  let left = checkLineLineCollision(x1, y1, x2, y2, rx1, ry1, rx2, ry2);
  let right = checkLineLineCollision(x1, y1, x2, y2, rx2, ry2, rx3, ry3);
  let top = checkLineLineCollision(x1, y1, x2, y2, rx3, ry3, rx4, ry4);
  let bottom = checkLineLineCollision(x1, y1, x2, y2, rx4, ry4, rx1, ry1);

  // if ANY of the above are true, the line has hit the rectangle
  if (left) {
    return left;
  } else if (right) {
    return right;
  } else if (top) {
    return top;
  } else if (bottom) {
    return bottom;
  }
  return false;
}

// based on https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js
function checkLineLineCollision(x1, y1, x2, y2, x3, y3, x4, y4) {
  let intersection;

  // calculate the distance to intersection point
  let uA = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));
  let uB = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1));

  // if uA and uB are between 0-1, lines are colliding
  if (uA >= 0 && uA <= 1 && uB >= 0 && uB <= 1) {

    // calc the point where the lines meet
    let intersectionX = x1 + (uA * (x2 - x1));
    let intersectionY = y1 + (uA * (y2 - y1));

    return new Collision(true, createVector(intersectionX, intersectionY));
  }

  return false;
}

// Based on: https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js
function checkCollisionPointCircle(x, y, cx, cy, d) {
  return dist(x, y, cx, cy) <= d / 2;
}

// Based on: https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js
function checkCollisionPointLine(px, py, x1, y1, x2, y2, buffer) {
  // get distance from the point to the two ends of the line
  let d1 = dist(px, py, x1, y1);
  let d2 = dist(px, py, x2, y2);

  // get the length of the line
  var lineLen = dist(x1, y1, x2, y2);

  // since floats are so minutely accurate, add a little buffer zone that will give collision
  if (buffer === undefined) {
    buffer = 0.1;
  } // higher # = less accurate

  // if the two distances are equal to the line's length, the point is on the line!
  // note we use the buffer here to give a range, rather than one #
  if (d1 + d2 >= lineLen - buffer && d1 + d2 <= lineLen + buffer) {
    return true;
  }
  return false;
}

// function based on https://github.com/bmoren/p5.collide2D#collidelinecircle
// see: https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js
function checkCollisionLineCircle(x1, y1, x2, y2, cx, cy, diameter){

    let inside1 = checkCollisionPointCircle(x1, y1, cx, cy, diameter);
    if (inside1) {
      return new Collision(true, createVector(x1, y1));
    }

    let inside2 = checkCollisionPointCircle(x2, y2, cx, cy, diameter);
    if (inside2) {
      return new Collision(true, createVector(x2, y2));
    }

    // get length of the line
    let len = dist(x1, y1, x2, y2);

    // get dot product of the line and circle
    let dot = (((cx - x1) * (x2 - x1)) + ((cy - y1) * (y2 - y1))) / pow(len, 2);

    // find the closest point on the line
    let closestX = x1 + (dot * (x2 - x1));
    let closestY = y1 + (dot * (y2 - y1));

    // is this point actually on the line segment?
    // if so keep going, but if not, return false
    let onSegment = checkCollisionPointLine(closestX, closestY, x1, y1, x2, y2);
    if (!onSegment) return false;

    // get distance to closest point
    let distX = closestX - cx;
    let distY = closestY - cy;
    let distance = sqrt((distX * distX) + (distY * distY));

    if (distance <= diameter / 2) {
      return new Collision(true, createVector(closestX, closestY));
    }
    return false;
}

class Collision {
  constructor(hit, colPt) {
    this.hit = hit;
    this.pt = colPt;
  }

  get x() {
    return this.pt.x;
  }

  get y() {
    return this.pt.y;
  }

}