// From: https://editor.p5js.org/solub/sketches/JkjZA2ZOS

function setup() {
  createCanvas(640, 400);
  
  a = createVector(220, 270);
  b = createVector(420, 170);
}

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


function orthogonalProjection1(a, b, p) {
  
  // find nearest point along a LINE
  
  d1 = p5.Vector.sub(b, a).normalize()
  d2 = p5.Vector.sub(p, a)
  
  d1.mult(d2.dot(d1))
    
  return p5.Vector.add(a, d1)
  
}
  
  
function orthogonalProjection2(a, b, p) {
  
  // find nearest point alont a SEGMENT 
  
  d1 = p5.Vector.sub(b, a);
  d2 = p5.Vector.sub(p, a);
  l1 = d1.mag();
  
  dotp = constrain(d2.dot(d1.normalize()), 0, l1);
      
  return p5.Vector.add(a, d1.mult(dotp))
  
}