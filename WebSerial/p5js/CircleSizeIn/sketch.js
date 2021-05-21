// Demonstrates basic web serial input with p5js. 
// This is a slightly more complicated version than CircleSizeInDemo
// because we intermix some HTML defined elements with p5.js
//
// I ended up teaching CircleSizeInDemo to keep things simple
//
// See:
// https://makeabilitylab.github.io/physcomp/communication/p5js-serial
// 
// By Jon E. Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//

let pHtmlMsg;

let curShapeSize = 10;

const MIN_SHAPE_SIZE = 10;
const MAX_SHAPE_MARGIN = 10;
let maxShapeSize = -1;

const serialOptions = { baudRate: 115200  };

function setup() {
  createCanvas(640, 480);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  //serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Grab link to #html-messages in DOM, so we can update it with messages
  // pHtmlMsg = select('#html-messages');
  pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");

  maxShapeSize = min(width, height) - MAX_SHAPE_MARGIN;
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

  let newShapeFrac = parseFloat(newData);
  curShapeSize = MIN_SHAPE_SIZE + newShapeFrac * (maxShapeSize - MIN_SHAPE_SIZE);
}

/**
 * Called automatically by p5js. Call frameRate(<num>) to change how often this
 * function is called
 */
function draw() {
  background(100);
  fill(250);
  noStroke();

  if(!serial.isOpen()){
    const tSize = 32;
    const connectStr = "Click on here to connect to serial";
    textSize(tSize);
    let strWidth = textWidth(connectStr);
    let xText = width / 2 - strWidth / 2;
    let yText = height / 2 - tSize / 2;
    text(connectStr, xText, yText);

    // don't draw anything else until we setup serial
    return; 
  }

  // Get x,y center of drawing Canvas
  let xCenter = width / 2;
  let yCenter = height / 2;

  // Draw the circle
  circle(xCenter, yCenter, curShapeSize);
}

function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}
