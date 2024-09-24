// Import the LineSegment class (assuming ES Modules)
import { Vector } from '../_library/vector.js';
import { LineSegment } from '../_library/line-segment.js';

const canvas = document.getElementById('myCanvas');
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext('2d');

ctx.fillStyle = "rgb(230, 230, 230)"; // Set the fill style to gray
ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with the gray color


// Create variables to store the first and second line segments
let lineSegment1, lineSegment2;

// Flag to indicate if the first line segment has been created
let firstLineSegmentCreated = false;
let firstClickPoint = null;

canvas.addEventListener('click', (event) => {
  const x = event.clientX;
  const y = event.clientY;

  if (!firstLineSegmentCreated) {
    // Store the first click point
    firstClickPoint = new Vector(x, y);

    // Draw a circle at the first click point
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fillStyle = 'blue'; // Change the color as needed
    ctx.fill();
  } else {
    // Create the first line segment with the stored first click point and the current click point
    lineSegment1 = new LineSegment(firstClickPoint.x, firstClickPoint.y, x, y);
    firstLineSegmentCreated = true;
  }

  draw();
});

canvas.addEventListener('mousemove', (event) => {
  if (lineSegment2) {
    // Update the endpoint of the second line segment to the mouse position
    lineSegment2.pt2.x = event.clientX;
    lineSegment2.pt2.y = event.clientY;

    draw();
  }
});

function draw() {
  ctx.fillStyle = "rgb(230, 230, 230)"; // Set the fill style to gray
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with the gray color

  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  if (lineSegment1) {
    lineSegment1.draw(ctx);
  }

  if (lineSegment2) {
    lineSegment2.draw(ctx);
  }

  if (lineSegment1 && lineSegment2) {
    LineSegment.drawAngleArcs(ctx, lineSegment1, lineSegment2);
  }
}