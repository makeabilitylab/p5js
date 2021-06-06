// A simple web serial test program that outputs the normalized x mouse position
// 
// By Jon E. Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//


let pHtmlMsg;
let serialOptions = { baudRate: 115200  };
let serial;

let xMouseConstrained = 0;
let xMouseNormalized = 0;

function setup() {
  createCanvas(640, 480);

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
  
  // draw vertical line at x position
  noFill();
  stroke(150);
  line(xMouseConstrained, 0, xMouseConstrained, height);
  
  // draw normalized x value
  textSize(80);
  fill(255);
  noStroke();
  
  textAlign(CENTER, CENTER);
  text(nf(xMouseNormalized, 0, 4), width / 2, height / 2);
}

/**
 * The mouseMoved() function is called every time the mouse moves and a 
 * use button is not pressed.
 */ 
function mouseMoved(){
  xMouseConstrained = constrain(mouseX, 0, width);
  xMouseNormalized = xMouseConstrained / width;
  
  if(serial.isOpen()){
    serial.writeLine(nf(xMouseNormalized, 0, 4)); 
  }
}

/**
 * Callback function by serial.js when there is an error on web serial
 * 
 * @param {} eventSender 
 */
 function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

/**
 * Callback function by serial.js when web serial connection is opened
 * 
 * @param {} eventSender 
 */
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("Serial connection opened successfully");
}

/**
 * Callback function by serial.js when web serial connection is closed
 * 
 * @param {} eventSender 
 */
function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
}

/**
 * Callback function serial.js when new web serial data is received
 * 
 * @param {*} eventSender 
 * @param {String} newData new data received over serial
 */
function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);
}

/**
 * Called automatically by the browser through p5.js when mouse clicked
 */
function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}