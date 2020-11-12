function setup() {
  createCanvas(400, 400);

  socket = io.connect('http://localhost:3000');

  socket.on('mouse', newMouseDataFromServer);

  background(30);
  noStroke();
}

function newMouseDataFromServer(data){
  console.log("Received data", data);
  fill(220, 220, 220, 200);
  ellipse(data.x, data.y, 30, 30);
}

function mouseDragged(){
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
