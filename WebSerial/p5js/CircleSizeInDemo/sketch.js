
let newShapeFrac = 0;
function setup() {
  createCanvas(400, 400);
}

function draw() {
  background(100);
  
  noStroke(); // turn off outline
  fill(250); // white circle

  // Get x,y center of drawing Canvas
  let xCenter = width / 2;
  let yCenter = height / 2;

  // Set the diameter based on mouse x position
  const maxDiameter = min(width, height);
  let circleDiameter = maxDiameter * mouseX / width;
  circle(xCenter, yCenter, circleDiameter);
}


 function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
}

function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
}

function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
}

function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);

  let newShapeFrac = parseFloat(newData);
  // curShapeSize = MIN_SHAPE_SIZE + newShapeFrac * (maxShapeSize - MIN_SHAPE_SIZE);
}