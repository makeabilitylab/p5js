// Import the LineSegment class (assuming ES Modules)
import { Vector } from '../_library/vector.js';
import { LineSegment } from '../_library/line-segment.js';

const canvas = document.getElementById('myCanvas');
canvas.width = 400;
canvas.height = 400;
const ctx = canvas.getContext('2d');

console.log(canvas.width, canvas.height);

// ctx.fillStyle = rgb(200, 200, 200); // Set the fill style to gray
// ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with the gray color

// Create two LineSegment objects
const lineSegment1 = new LineSegment(100, 100, 200, 150);
lineSegment1.draw(ctx);
const lineSegment2 = new LineSegment(100, 100, 200, 250);
lineSegment2.draw(ctx);

// // Draw angle arcs between the line segments
LineSegment.drawAngleArcs(ctx, lineSegment1, lineSegment2);