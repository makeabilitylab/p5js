// Demonstrates a basic real-time graph with serial input. See:
// https://makeabilitylab.github.io/physcomp/communication/p5js-serial
// 
// By Jon E. Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//

let serial; // the Serial object
let serialOptions = { baudRate: 115200  };
let queue = []
let xPos = 0;

function setup() {
  createCanvas(750, 420);

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

  background(50);
}

function draw() {
  
  while(queue.length > 0){
    // Grab the least recent value of queue (first in first out)
    // JavaScript is not multithreaded, so we need not lock the queue
    // before reading/modifying.
    let val = queue.shift();
    let yPixelPos = height - val * height;

    // Spruce up the color a bit by dynamically setting the line
    // color based on the current sensor value
    let redColor = val * 255;
    stroke(redColor, 34, 255); //set the color
    line(xPos, height, xPos, yPixelPos);

    xPos++;
  }

  if(xPos >= width){
    xPos = 0;
    background(50);
  }
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
  //console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);

  // JavaScript is not multithreaded, so we need not lock the queue
  // before pushing new elements
  queue.push(parseFloat(newData));
}

function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}