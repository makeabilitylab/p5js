// Based on the Coding Train node.js tutorial series:
// Part 1: Introduction to Node - WebSockets and p5.js Tutorial: https://youtu.be/bjULmG8fqc8
// Part 2: Using Express with Node - WebSockets and p5.js Tutorial: https://youtu.be/2hhEOGXcCvg
// Part 3: Connecting Client to Server with Socket.io - WebSockets and p5.js Tutorial: https://youtu.be/HZWmrt3Jy10
// Part 4: Shared Drawing Canvas - WebSockets and p5.js Tutorial: https://youtu.be/i6eP1Lw4gZk
function setup() {
  createCanvas(400, 400);

  // const socketURL = process.env.NODE_ENV === 'production'
  //     ? window.location.hostname
  //     : 'https://localhost:3000';

  // if no url is passed to connect, defaults to defaults to window.location
  socket = io.connect();

  socket.on('mouse', newMouseDataFromServer);

  background(30);
  noStroke();
}

function newMouseDataFromServer(data) {
  console.log("Received data", data);
  fill(220, 220, 220, 200);
  ellipse(data.x, data.y, 30, 30);
}

function mouseDragged() {
  fill(200, 0, 200, 100);
  ellipse(mouseX, mouseY, 30, 30);

  let data = {
    x: mouseX,
    y: mouseY
  }

  console.log("Sending data", data);
  socket.emit('mouse', data);
}

function draw() {
}
