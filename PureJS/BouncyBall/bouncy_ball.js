const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

// Ball properties
const ballRadius = canvas.width * 0.1;
const ballColor = 'red';
const bgColor = 'rgb(220,220,220)';
let ballX = canvas.width / 2;
let ballY = canvas.height / 2;
let maxSpeed = Math.max(3, canvas.height * 0.01);
let initialDir = Math.random() <= 0.5 ? -1 : 1;
let xSpeed = Math.random() * maxSpeed * initialDir; // Random x velocity
let ySpeed = Math.random() * maxSpeed * initialDir; // Random y velocity

// Draw the ball
function drawBall() {
  ctx.beginPath();
  ctx.arc(ballX, ballY, ballRadius, 0, 2 * Math.PI);
  ctx.fillStyle = ballColor;
  ctx.fill();
  ctx.closePath();
}

// Move the ball and check for collisions
function moveBall() {
  ballX += xSpeed;
  ballY += ySpeed;

  if (ballX + ballRadius > canvas.width || ballX - ballRadius < 0) {
    xSpeed = -xSpeed; // Reverse x direction
  }
  if (ballY + ballRadius > canvas.height || ballY - ballRadius < 0) {
    ySpeed = -ySpeed; // Reverse y direction
  }
}

// Main animation loop
function animate() {
  // ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = bgColor; // Set the fill style to gray
  ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with the gray color

  drawBall();
  moveBall();
  requestAnimationFrame(animate);
}

function resizeCanvas() {
  const container = document.querySelector('.container');
  const canvas = document.getElementById('myCanvas');

  canvas.width = container.clientWidth;
  canvas.height = container.clientHeight;
  console.log(container.clientWidth, container.clientHeight);

  // Reset ball position and speed
  ballX = canvas.width / 2;
  ballY = canvas.height / 2;

  maxSpeed = Math.max(3, canvas.height * 0.01);
  xSpeed = Math.random() * maxSpeed * initialDir; // Random x velocity
  ySpeed = Math.random() * maxSpeed * initialDir; // Random y velocity
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();
animate();
