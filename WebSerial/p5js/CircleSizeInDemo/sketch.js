// Demonstrates basic web serial input with p5js. See:
// https://makeabilitylab.github.io/physcomp/communication/p5js-serial
// 
// By Jon E. Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//

let shapeFraction = 0; // tracks the new shape fraction off serial
let serial; // the Serial object
let serialOptions = { baudRate: 115200  };

function setup() {
  createCanvas(400, 400);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");
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
  // let shapeFraction = mouseX / width;
  let circleDiameter = maxDiameter * shapeFraction;
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

  shapeFraction = parseFloat(newData);
}

function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}