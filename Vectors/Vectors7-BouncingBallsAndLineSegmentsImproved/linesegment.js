function drawLineWithArrow(base, vec, myColor, drawLabels, drawArrow) {
  push();
  stroke(myColor);
  strokeWeight(1);
  fill(myColor);

  translate(base);

  push();
  if (this.isDashedLine) {
    drawingContext.setLineDash([5, 15]);
  }
  line(0, 0, vec.x, vec.y);
  pop();

  if (drawArrow) {
    rotate(vec.heading());
    let arrowSize = 7;
    translate(vec.mag() - arrowSize, 0);
    triangle(0, arrowSize / 2, 0, -arrowSize / 2, arrowSize, 0);
  }

  if (drawLabels) {
    noStroke();
    //rotate(-vec.heading());
    textSize(8);
    let lbl = nfc(degrees(vec.heading()), 1) + "°" +
      ", " + nfc(vec.mag(), 1);
    let lblWidth = textWidth(lbl);
    text(lbl, -lblWidth, 12);
  }

  pop();
}

/**
 * Returns the two normals for the line segment (one normal for each direction)
 *
 * @param {p5.Vector} pt1 the first point in the line segment
 * @param {p5.Vector} pt2 the second point in the line segment
 */
function calculateNormals(pt1, pt2) {
  // From: https://stackoverflow.com/a/1243676  
  // https://www.mathworks.com/matlabcentral/answers/85686-how-to-calculate-normal-to-a-line
  //  V = B - A;
  //  normal1 = [ V(2), -V(1)];
  //  normal2 = [-V(2),  V(1)];

  let v = p5.Vector.sub(pt2, pt1);
  return [createVector(v.y, -v.x), createVector(-v.y, v.x)];
}

class LineSegment {
  constructor(x1, y1, x2, y2) {
    //x1 and y1 can either be vectors or the points for p1
    if (arguments.length == 2 && typeof x1 === 'object' &&
      typeof y1 === 'object') {
      this.pt1 = x1;
      this.pt2 = y1;
    } else {
      this.pt1 = createVector(x1, y1);
      this.pt2 = createVector(x2, y2);
    }
    this.strokeColor = color(0);
    this.isDashedLine = false;
    this.turnOnTextLabels = false;
    this.turnOnArrow = false;
    this.strokeWeight = 2;

    this.isHighlighted = false;
    this.highlightColor = color(0, 100, 255);

    this.shouldDrawNormal = true;
  }

  get x1() {
    return this.pt1.x;
  }

  get y1() {
    return this.pt1.y;
  }

  get x2() {
    return this.pt2.x;
  }

  get y2() {
    return this.pt2.y;
  }

  get length() {
    return dist(this.x1, this.y1, this.x2, this.y2);
  }

  /**
   * Returns the heading of the line segment in radians
   */
  get heading() {
    let diffVector = p5.Vector.sub(this.pt2, this.pt1);
    return diffVector.heading();
  }

  /**
   * Returns one of the normals for this line segment. To get both
   * normals, call getNormals()
   */
  getNormal() {
    return this.getNormals()[0];
  }

  /**
   * Returns the two normals for the line segment (one normal for each direction)
   */
  getNormals() {
    return calculateNormals(this.pt1, this.pt2);
  }

  /**
   * Calculates p5.Vector.sub(this.pt2, this.pt1) and returns the resulting
   * vector (which is this line segment moved to the origin).
   */
  getVectorAtOrigin() {
    return createVector(this.x2 - this.x1, this.y2 - this.y1);
  }

  calculateExpectedCollisionPoint(ball) {
    // TODO: warning: this function correctly works to determine
    // if there *will* be a collision but does not correctly
    // compute the eventual collision point! Need to still work on this.
    // Here are some potential relevant references to help:
    //  - https://seblee.me/2010/01/predicting-circle-line-collisions/
    //  - https://www.gamedev.net/forums/topic/667808-predicting-collision-time-of-circle-line-segment/
    //  - https://www.gamedev.net/forums/topic/667808-predicting-collision-time-of-circle-line-segment/

    // Here, we simply create a linesegment between
    // current ball position and a "infinite" line segment
    // based on its direction
    let ballDirectionVector = ball.direction.copy();
    ballDirectionVector.setMag(max(width, height) * 4);

    let ballEndPt = p5.Vector.add(ball.position, ballDirectionVector);
    let collision = checkLineLineCollision(this.x1, this.y1,
      this.x2, this.y2,
      ball.x, ball.y,
      ballEndPt.x, ballEndPt.y);

    if (collision) {
      let tmpLs = new LineSegment(ball.position, collision.pt);
      let tractorBeamColor = color(50, 50, 50, 150);
      tmpLs.turnOnArrow = true;
      tmpLs.shouldDrawNormal = false;
      tmpLs.draw();
      tmpLs.strokecolor = tractorBeamColor;
    }

    //let ballDirectionVector = ball.direction.copy();
    ballDirectionVector.normalize();
    ballDirectionVector.setMag(ball.radius);
    let normal1 = createVector(ballDirectionVector.y, -ballDirectionVector.x);
    let normal2 = createVector(-ballDirectionVector.y, ballDirectionVector.x);

    let tractorBeamVector = ball.direction.copy();

    let dist1 = dist(ball.x, ball.y, this.x1, this.y1);
    let dist2 = dist(ball.x, ball.y, this.x2, this.y2);
    let maxDist = max(dist1, dist2);
    //let tractorBeamLength
    tractorBeamVector.setMag(maxDist + 200);

    let intersectionPt1 = p5.Vector.add(ball.position, normal1);
    let intersectionPt2 = p5.Vector.add(ball.position, normal2);

    let ballStartPt1 = intersectionPt1;
    let ballEndPt1 = p5.Vector.add(intersectionPt1, tractorBeamVector);
    if (!collision) {
      collision = checkLineLineCollision(this.x1, this.y1,
        this.x2, this.y2,
        ballStartPt1.x, ballStartPt1.y,
        ballEndPt1.x, ballEndPt1.y);

      if (collision) {
        let ls1 = new LineSegment(ballStartPt1, collision.pt);
        let tractorBeamColor = color(50, 50, 50, 150);
        ls1.turnOnArrow = true;
        ls1.shouldDrawNormal = false;
        ls1.draw();
        ls1.strokecolor = tractorBeamColor;
      }
    }

    let ballStartPt2 = intersectionPt2;
    let ballEndPt2 = p5.Vector.add(intersectionPt2, tractorBeamVector);
    if (!collision) {
      collision = checkLineLineCollision(this.x1, this.y1,
        this.x2, this.y2,
        ballStartPt2.x, ballStartPt2.y,
        ballEndPt2.x, ballEndPt2.y);

      if (collision) {
        let ls2 = new LineSegment(ballStartPt2, collision.pt);
        let tractorBeamColor = color(50, 50, 50, 150);
        ls2.turnOnArrow = true;
        ls2.shouldDrawNormal = false;
        ls2.draw();
        ls2.strokecolor = tractorBeamColor;
      }
    }

    if (!collision) {
      // now treat tractor beams like a forming a rectangle 
      let r1 = ballStartPt1;
      let r2 = ballEndPt1;
      let r3 = ballEndPt2;
      let r4 = ballStartPt2;

      //collision = checkLineRectCollision(this.x1, this.y1,
      //  this.x2, this.y2, r1.x, r1.y, r2.x, r2.y, r3.x, r3.y, r4.x, r4.y);
      let isPt1InsideRect = isPointInRectangle(this.pt1, r1, r2, r3, r4);
      let isPt2InsideRect = isPointInRectangle(this.pt2, r1, r2, r3, r4);
      if (isPt1InsideRect && isPt2InsideRect) {
        if (dist1 < dist2) {
          collision = new Collision(true, this.pt1);
        } else {
          collision = new Collision(true, this.pt2);
        }
      } else if (isPt1InsideRect) {
        collision = new Collision(true, this.pt1);
      } else if (isPt1InsideRect) {
        collision = new Collision(true, this.pt2);
      }

      //TMP
      //if(collision){
      //print("collision in rectangle part", collision);
      push();
      fill(0, 100, 200, 80);
      beginShape();
      vertex(r1.x, r1.y);
      vertex(r2.x, r2.y);
      vertex(r3.x, r3.y);
      vertex(r4.x, r4.y);
      endShape(CLOSE);
      pop();
      //}
      //checkLineRectCollision
      //END TMP
    }
    
    if(collision){
      push();
      drawingContext.setLineDash([3, 5]); 
      stroke(50, 50, 50, 50);
      
      tractorBeamVector.setMag(2 * max(width, height));
      //ballStartPt1 = intersectionPt1;
      let ballEndPt0 = p5.Vector.add(ball.position, tractorBeamVector);
      ballEndPt1 = p5.Vector.add(ballStartPt1, tractorBeamVector);
      ballEndPt2 = p5.Vector.add(ballStartPt2, tractorBeamVector);
      line(ball.x, ball.y, ballEndPt0.x, ballEndPt0.y);
      line(ballStartPt1.x, ballStartPt1.y, ballEndPt1.x, ballEndPt1.y);
      line(ballStartPt2.x, ballStartPt2.y, ballEndPt2.x, ballEndPt2.y);
      
      // FOR WHEN COLLISION WITH EITHER END SEGMENT PT
      // TODO: the actual collision point is the end segment
      // pt with a line back to the ball at same angle as the
      // ball direction vector
      
      // FOR WHEN COLLISION IS LINE (NOT END POINTS)
      // To find expected collision point on ball, take normal of line segment
      // draw that vector out from center of ball (that vector with mag radius
      // is the point on the ball that gets hit)
      
      
      //TODO ALSO FIX DRAWING RECTANGLE WHEN LINE SEGMENT FULLY CONTAINED
      
      pop();
    
    }

    return collision;
  }


  // function based on https://github.com/bmoren/p5.collide2D#collidelinecircle
  // see: https://github.com/bmoren/p5.collide2D/blob/master/p5.collide2d.js
  checkCollisionWithCircle(ballOrCx, cy, diameter) {
    let cx;
    if (arguments.length == 1) {
      cx = ballOrCx.x;
      cy = ballOrCx.y;
      diameter = ballOrCx.diameter;
    } else {
      cx = ballOrCx;
    }
    return checkCollisionLineCircle(this.x1, this.y1, this.x2,
      this.y2, cx, cy, diameter);
  }

  draw() {
    push();
    stroke(this.strokeColor);
    //line(this.pt1.x, this.pt1.y, this.pt2.x, this.pt2.y);
    let diffVector = p5.Vector.sub(this.pt2, this.pt1);
    if (this.isHighlighted) {
      drawLineWithArrow(this.pt1, diffVector, this.highlightColor, this.turnOnTextLabels, this.turnOnArrow);
    } else {
      drawLineWithArrow(this.pt1, diffVector, this.strokeColor, this.turnOnTextLabels, this.turnOnArrow);
    }

    if (this.shouldDrawNormal) {

      push();
      let normals = this.getNormals();
      let normal1 = normals[0];
      let normal2 = normals[1];
      let normalsLength = 20;

      let v = this.getVectorAtOrigin();
      let midV = p5.Vector.add(this.pt1, p5.Vector.mult(v, 0.5));
      normal1.setMag(normalsLength);
      normal2.setMag(normalsLength);

      drawLineWithArrow(midV, normal1, color(255, 0, 0, 30), false, true);
      drawLineWithArrow(midV, normal2, color(30, 0, 255, 30), false, true);
      pop();
    }
    pop();
  }


}