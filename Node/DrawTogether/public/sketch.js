// Based on the Coding Train node.js tutorial series:
// Part 1: Introduction to Node - WebSockets and p5.js Tutorial: https://youtu.be/bjULmG8fqc8
// Part 2: Using Express with Node - WebSockets and p5.js Tutorial: https://youtu.be/2hhEOGXcCvg
// Part 3: Connecting Client to Server with Socket.io - WebSockets and p5.js Tutorial: https://youtu.be/HZWmrt3Jy10
// Part 4: Shared Drawing Canvas - WebSockets and p5.js Tutorial: https://youtu.be/i6eP1Lw4gZk

// Connect to the Socket.io server and start listening for other clients' draws.
// We paint directly in the event/input handlers (not in draw()), so the canvas is
// never cleared and strokes accumulate.
function setup() {
  createCanvas(400, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A shared drawing canvas where dragging the mouse paints purple circles, while gray circles appear wherever other connected users are drawing.");

  // const socketURL = process.env.NODE_ENV === 'production'
  //     ? window.location.hostname
  //     : 'https://localhost:3000';

  // if no url is passed to connect, defaults to defaults to window.location
  socket = io.connect();

  socket.on('mouse', newMouseDataFromServer);

  background(30);
  noStroke();
}

// Another client drew somewhere: paint their stroke here in gray.
function newMouseDataFromServer(data) {
  console.log("Received data", data);
  fill(220, 220, 220, 200);
  ellipse(data.x, data.y, 30, 30);
}

// Local drag: paint our own stroke in purple, then send (x, y) to the server so
// every other client can mirror it.
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

// Intentionally empty: all drawing happens in the input/socket handlers above so
// the canvas isn't cleared each frame and strokes persist.
function draw() {
}
