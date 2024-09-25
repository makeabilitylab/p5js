// This library provides basic line segment functionality, including drawing
// and vector operations
//
// By Jon E. Froehlich
// UW CSE Professor
// http://makeabilitylab.io/
//
import { Vector } from './vector.js';
import { convertToRadians, convertToDegrees } from './math-utils.js';

export class LineSegment {
  /**
   * Creates an instance of a line segment.
   * 
   * @constructor
   * @param {number|object} x1 - The x-coordinate of the first point or a vector object.
   * @param {number|object} y1 - The y-coordinate of the first point or a vector object.
   * @param {number} [x2] - The x-coordinate of the second point (optional if x1 and y1 are vectors).
   * @param {number} [y2] - The y-coordinate of the second point (optional if x1 and y1 are vectors).
   */
  constructor(x1, y1, x2, y2) {
    //x1 and y1 can either be vectors or the points for p1
    if (arguments.length == 2 && typeof x1 === 'object' &&
      typeof y1 === 'object') {
      this.pt1 = x1;
      this.pt2 = y1;
    } else {
      this.pt1 = new Vector(x1, y1);
      this.pt2 = new Vector(x2, y2);
    }

    this.fontSize = 10;
    this.strokeColor = "black";
    this.isDashedLine = false;
    this.drawTextLabels = true;
    this.drawTextMagnitude = true;
    this.drawTextAngle = true;
    this.strokeWeight = 2;
  }

  /**
   * Returns x1
   */
  get x1() {
    return this.pt1.x;
  }

  /**
   * Set x1
   */
  set x1(val) {
    this.pt1.x = val;
  }

  /**
   * Returns y1
   */
  get y1() {
    return this.pt1.y;
  }

  /**
   * Set y1
   */
  set y1(val) {
    this.pt1.y = val;
  }

  /**
   * Returns x2
   */
  get x2() {
    return this.pt2.x;
  }

  /**
   * Set x2
   */
  set x2(val) {
    this.pt2.x = val;
  }

  /**
   * Returns y2
   */
  get y2() {
    return this.pt2.y;
  }

  /**
   * Set y2
   */
  set y2(val) {
    this.pt2.y = val;
  }

  /**
   * Returns the heading of the line segment in radians between 0 and 2*PI.
   */
  getHeading() {
    const diffVector = this.pt2.subtract(this.pt1);
    let heading = Math.atan2(diffVector.y, diffVector.x);

    if (heading < 0) {
      heading += 2 * Math.PI;
    }
    return heading;
  }

  /**
   * Returns the two normals for the line segment (one normal for each direction)
   */
  getNormals() {
    return calculateNormals(this.pt1, this.pt2);
  }

  /**
   * Returns one of the normals for this line segment. To get both
   * normals, call getNormals()
   */
  getNormal() {
    return this.getNormals()[0];
  }

  /**
   * Calculates the vector representing the line segment moved to the origin.
   *
   * @returns {Vector} The vector representing the line segment at the origin.
   */
  getVectorAtOrigin() {
    return this.pt2.subtract(this.pt1);
  }

  /**
   * Gets the angles between this line segment and the given vector or line segment.
   * Returns both the counterclockwise and clockwise angles in radians.
   *
   * @param {Vector|LineSegment} vectorOrLineSegment The other vector or line segment.
   * @returns {Object} An object containing both the counterclockwise and clockwise angles in radians.
   */
  getAnglesBetween(vectorOrLineSegment) {
    const v1 = this.getVectorAtOrigin();
    let v2;

    if (vectorOrLineSegment instanceof LineSegment) {
      v2 = vectorOrLineSegment.getVectorAtOrigin();
    } else {
      v2 = vectorOrLineSegment;
    }

    let angleBetweenRadians = v1.angleBetween(v2);
    console.log(`angleBetweenDegrees: ${convertToDegrees(angleBetweenRadians).toFixed(1)}`);

    // Ensure the angle is between 0 and 2*PI
    if (angleBetweenRadians < 0) {
      angleBetweenRadians += 2 * Math.PI;
    }

    // Calculate the counterclockwise and clockwise angles
    const clockwiseAngle = angleBetweenRadians;
    const counterclockwiseAngle = 2 * Math.PI - angleBetweenRadians;
    
    return {
      counterclockwiseAngle,
      clockwiseAngle
    };
  }

  /**
   * Calculates the orthogonal projection of vector p onto this line segment.
   * 
   * @param {Vector} p The vector to project onto the line segment.
   * @returns {Vector} The orthogonal projection of p onto the line segment.
   */
  getOrthogonalProjection(p) {
    // http://mathonline.wikidot.com/orthogonal-projections

    const d1 = this.pt2.subtract(this.pt1); // Direction vector of the line segment
    const d2 = p.subtract(this.pt1); // Vector from point p to the first point of the line segment

    const l1 = d1.magnitude(); // Length of the line segment

    const dotProduct = Math.min(Math.max(d2.dotProduct(d1.normalize()), 0), l1); // Constrain dot product between 0 and l1

    return this.pt1.add(d1.multiply(dotProduct)); // Project p onto the line segment
  }

  /**
   * Returns the minimum distance between this line segment and the given point p.
   * 
   * @param {Vector} p The point to calculate the distance to.
   * @returns {number} The minimum distance between the line segment and the point.
   */
  getDistance(p) {
    const op = this.getOrthogonalProjection(p);
    return p.subtract(op).magnitude();
  }

  /**
   * Returns the magnitude of this vector as a floating point number.
   * 
   * @returns {number} The magnitude of the line segment.
   */
  getMagnitude() {
    return this.pt2.subtract(this.pt1).magnitude();
  }

  /**
   * Sets the magnitude of the line segment to the given number.
   * 
   * @param {number} len The desired magnitude of the line segment.
   */
  setMagnitude(len) {
    const diffVector = this.pt2.subtract(this.pt1).normalize().multiply(len);
    this.pt2 = this.pt1.add(diffVector);
  }

  /**
   * Draws the line segment on the provided canvas context.
   * 
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context to draw on.
   */
  draw(ctx) {
    ctx.strokeStyle = this.strokeColor;
    ctx.lineWidth = this.strokeWeight;
  
    if (this.isDashedLine) {
      ctx.setLineDash([5, 15]);
    }
  
    this.drawArrow(ctx, this.pt1, this.pt2.subtract(this.pt1), this.strokeColor); 
  
    // Draw text labels (optional)
    if (this.drawTextLabels) {
      ctx.font = `${this.fontSize}px Arial`; // Replace with your desired font and size
      ctx.textAlign = "left";
      ctx.textBaseline = "top";
      ctx.fillStyle = this.strokeColor; // Or any other desired color
  
      const label = this.generateLabel();
      const labelWidth = ctx.measureText(label).width;
      ctx.fillText(label, -labelWidth - 3, 12);
    }
  }

  drawArrow(ctx, p1, p2, color) {
    const headLength = 10; // Length of the arrow head
    const angle = Math.atan2(p2.y, p2.x);

    ctx.save();
    ctx.strokeStyle = color;
    ctx.fillStyle = color;

    // Draw the line
    ctx.beginPath();
    ctx.moveTo(p1.x, p1.y);
    ctx.lineTo(p1.x + p2.x, p1.y + p2.y);
    ctx.stroke();

    // Draw the arrow head
    ctx.beginPath();
    ctx.moveTo(p1.x + p2.x, p1.y + p2.y);
    ctx.lineTo(p1.x + p2.x - headLength * Math.cos(angle - Math.PI / 6), p1.y + p2.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.lineTo(p1.x + p2.x - headLength * Math.cos(angle + Math.PI / 6), p1.y + p2.y - headLength * Math.sin(angle + Math.PI / 6));
    ctx.lineTo(p1.x + p2.x, p1.y + p2.y);
    ctx.lineTo(p1.x + p2.x - headLength * Math.cos(angle - Math.PI / 6), p1.y + p2.y - headLength * Math.sin(angle - Math.PI / 6));
    ctx.stroke();
    ctx.fill();
    ctx.restore();
  }
  
  /**
   * Generates the label to be displayed on the line segment.
   *
   * @returns {string} The label text.
   */
  generateLabel() {
    let label = "";
    if (this.drawTextAngle) {
      const angleDegrees = Math.round(Math.atan2(this.pt2.y - this.pt1.y, this.pt2.x - this.pt1.x) * 180 / Math.PI);
      label += `${angleDegrees}°`;
    }
  
    if (this.drawTextAngle && this.drawTextMagnitude) {
      label += " ";
    }
  
    if (this.drawTextMagnitude) {
      label += `|${this.getMagnitude().toFixed(1)}|`;
    }
  
    return label;
  }

  /**
   * Draws positive and negative angle arcs between two line segments on a canvas context.
   *
   * @param {CanvasRenderingContext2D} ctx - The canvas rendering context.
   * @param {Object} lineSegment1 - The first line segment.
   * @param {Object} lineSegment2 - The second line segment.
   * @param {string} clockwiseArcColor - The color of arc1
   * @param {string} counterclockwiseArcColor - The color of arc2
   * @param {number} [clockwiseArcRadius=50] - The size of the positive angle arc.
   * @param {number} [counterclockwiseArcRadius=30] - The size of the negative angle arc.
   */
  static drawAngleArcs(ctx, lineSegment1, lineSegment2, clockwiseArcColor='blue', 
    counterclockwiseArcColor='red', clockwiseArcRadius = 50, counterclockwiseArcRadius = 30) {
    
    const lineSeg1AngleRadians = lineSegment1.getHeading();
    const angles = lineSegment1.getAnglesBetween(lineSegment2);

    console.log(`CW angle ${convertToDegrees(angles.clockwiseAngle).toFixed(1)} CCW angle ${convertToDegrees(angles.counterclockwiseAngle).toFixed(1)}`);
    //console.log(`Counterclockwise Angle: ${angles.counterclockwiseAngle} radians (${convertToDegrees(angles.counterclockwiseAngle).toFixed(1)}°)`);
    //console.log(`Clockwise Angle: ${angles.clockwiseAngle} radians (${convertToDegrees(angles.clockwiseAngle).toFixed(1)}°)`);
    // console.log(`Old angle Between: ${angleBetweenLineSegmentsInRadians} radians (${convertToDegrees(angleBetweenLineSegmentsInRadians).toFixed(1)}°)`);
    
    ctx.save();

    // Draw the clockwise arc
    // arc(x, y, radius, startAngle, endAngle, counterclockwise)
    ctx.beginPath();
    ctx.arc(lineSegment1.pt1.x, lineSegment1.pt1.y, clockwiseArcRadius, 
      lineSeg1AngleRadians, lineSeg1AngleRadians + angles.clockwiseAngle, false);
    ctx.strokeStyle = clockwiseArcColor;
    //ctx.setLineDash([2, 5]);
    ctx.stroke();

    // Draw the clockwise angle text
    const clockwiseArcMiddleVector = new Vector(
      lineSegment1.pt1.x + clockwiseArcRadius * 1.35 * Math.cos(lineSeg1AngleRadians + angles.clockwiseAngle / 2),
      lineSegment1.pt1.y + clockwiseArcRadius * 1.35 * Math.sin(lineSeg1AngleRadians + angles.clockwiseAngle / 2)
    );
  
    ctx.font = "12px Arial"; // Replace with your desired font and size
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = clockwiseArcColor;
  
    const clockwiseAngleDegrees = convertToDegrees(angles.clockwiseAngle);
    const clockwiseAngleDegreesLabel = `${clockwiseAngleDegrees.toFixed(1)}°`;
    ctx.fillText(clockwiseAngleDegreesLabel, clockwiseArcMiddleVector.x, clockwiseArcMiddleVector.y);

    // Draw the counterclockwise arc
    ctx.beginPath();
    ctx.arc(lineSegment1.pt1.x, lineSegment1.pt1.y, counterclockwiseArcRadius,
      lineSeg1AngleRadians, lineSeg1AngleRadians - angles.counterclockwiseAngle, true);
    ctx.strokeStyle = counterclockwiseArcColor;
    ctx.stroke();

    // Draw the counterclockwise angle text
    const counterclockwiseArcMiddleVector = new Vector(
      lineSegment1.pt1.x + counterclockwiseArcRadius * 1.5 * Math.cos(lineSeg1AngleRadians - angles.counterclockwiseAngle / 2),
      lineSegment1.pt1.y + counterclockwiseArcRadius * 1.5 * Math.sin(lineSeg1AngleRadians - angles.counterclockwiseAngle / 2)
    );

    const counterclockwiseAngleDegrees = convertToDegrees(angles.counterclockwiseAngle);
    const counterclockwiseAngleDegreesLabel = `${counterclockwiseAngleDegrees.toFixed(1)}°`;
    ctx.fillStyle = counterclockwiseArcColor;
    ctx.fillText(counterclockwiseAngleDegreesLabel, counterclockwiseArcMiddleVector.x, counterclockwiseArcMiddleVector.y);
  
    ctx.restore();
  }
}

/**
 * Calculates the two normals for the line segment (one normal for each direction).
 * 
 * @param {Vector} pt1 The first point in the line segment.
 * @param {Vector} pt2 The second point in the line segment.
 * @returns {Vector[]} An array containing two Vector objects representing the normals.
 */
function calculateNormals(pt1, pt2) {
  // From: https://stackoverflow.com/a/1243676  
  // https://www.mathworks.com/matlabcentral/answers/85686-how-to-calculate-normal-to-a-line
  //  V = B - A;
  //  normal1 = [ V(2), -V(1)];
  //  normal2 = [-V(2), V(1)];

  const v = pt2.subtract(pt1);
  return [new Vector(v.y, -v.x), new Vector(-v.y, v.x)];
}