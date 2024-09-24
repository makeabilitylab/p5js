const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');

function resizeCanvas() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  draw();
}

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'rgb(255, 0, 0)';
  ctx.fillRect(0, 0, canvas.width / 2, canvas.height / 2);

  ctx.fillStyle = 'rgb(0, 0, 255)';
  ctx.beginPath();
  ctx.ellipse(canvas.width / 2, canvas.height / 2, 100, 150, 0, 0, Math.PI * 2);
  ctx.fill();
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();