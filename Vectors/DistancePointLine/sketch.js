// Point-to-line-segment distance via orthogonal (perpendicular) projection.
// Move the mouse: the sketch projects the mouse point onto the fixed segment
// a–b, marks the closest point on the segment, draws a line to it, and shows
// the distance as text.
//
// Adapted from: https://editor.p5js.org/solub/sketches/JkjZA2ZOS

function setup() {
  createCanvas(640, 400);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A fixed line segment on a gray canvas with a small circle marking the closest point on the segment to the mouse; a line connects the mouse to that point and the distance is shown as text, demonstrating point-to-line-segment distance via orthogonal projection.");

  a = createVector(220, 270);
  b = createVector(420, 170);
}

// Each frame: project the mouse onto segment a-b, mark the closest point, draw
// a line from the mouse to it, and print the distance.
function draw() {
  background(220);

  let p = createVector(mouseX, mouseY);
  let op = orthogonalProjection2(a, b, p);
  let d = p5.Vector.dist(p, op);
  
  line(a.x, a.y, b.x, b.y);
  ellipse(op.x, op.y, 8, 8);
  text(d, p.x + 5, p.y - 5);
  line(op.x, op.y, mouseX, mouseY);
}


/**
 * Nearest point on the INFINITE line through a and b. Not used by this sketch
 * (draw() calls orthogonalProjection2 instead); kept here to contrast with the
 * segment version below.
 * @param {p5.Vector} a a point on the line
 * @param {p5.Vector} b another point on the line
 * @param {p5.Vector} p the point to project onto the line
 * @return {p5.Vector} the closest point on the line to p
 */
function orthogonalProjection1(a, b, p) {
  d1 = p5.Vector.sub(b, a).normalize()
  d2 = p5.Vector.sub(p, a)
  
  d1.mult(d2.dot(d1))
    
  return p5.Vector.add(a, d1)
  
}
  
  
/**
 * Nearest point on the line SEGMENT a-b: project p onto the segment, then clamp
 * (constrain) the projected distance to the segment's length so the result
 * can't slide past either endpoint.
 * @param {p5.Vector} a the segment start
 * @param {p5.Vector} b the segment end
 * @param {p5.Vector} p the point to project onto the segment
 * @return {p5.Vector} the closest point on the segment to p
 */
function orthogonalProjection2(a, b, p) {
  d1 = p5.Vector.sub(b, a);
  d2 = p5.Vector.sub(p, a);
  l1 = d1.mag();
  
  dotp = constrain(d2.dot(d1.normalize()), 0, l1);
      
  return p5.Vector.add(a, d1.mult(dotp))
  
}