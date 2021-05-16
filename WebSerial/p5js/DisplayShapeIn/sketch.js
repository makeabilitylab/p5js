// This sketch demonstrates how to 
// 
// TODO:
//
// By Jon E. Froehlich
// http://makeabilitylab.io/

let pHtmlMsg;

let mapShapeTypeToShapeName = {
  0: "Circle",
  1: "Square",
  2: "Triangle"
};

let curShapeType = 0;
let curShapeSize = 10;

const MIN_SHAPE_SIZE = 10;
const MAX_SHAPE_MARGIN = 10;
let MAX_SHAPE_SIZE = -1;

let serialOptions = { baudRate: 115200  };

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

  // Grab link to #html-messages in DOM, so we can update it with messages
  pHtmlMsg = select('#html-messages');

  MAX_SHAPE_SIZE = min(width, height) - MAX_SHAPE_MARGIN;

  // Move connect button down
  let mainTag = document.getElementsByTagName("main")[0];
  mainTag.appendChild(
    document.getElementById('connect-button')
  );

  // Move the lil html message output to main tag so the messages are below the canvas 
  // https://stackoverflow.com/a/6329160/388117
  mainTag.appendChild(
    document.getElementById('html-messages')
  );
}

/**
 * Callback function for when the connect button is pressed
 */
async function onButtonConnectToSerialDevice(){
  if (!serial.isOpen()) {
    await serial.connectAndOpen(null, serialOptions);
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

  let canvas = document.getElementsByClassName('p5Canvas')[0];
  canvas.style.display = "block";

  document.getElementById("connect-button").style.display = "none";
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

  // Check if data received starts with '#'. If so, ignore it
  // Otherwise, parse it! We ignore lines that start with '#' 
  if(!newData.startsWith("#")){
    // Parse the data
    let newShapeFrac = parseFloat(newData);
    curShapeSize = MIN_SHAPE_SIZE + newShapeFrac * (MAX_SHAPE_SIZE - MIN_SHAPE_SIZE);
  }
}

/**
 * Called automatically by p5js. Call frameRate(<num>) to change how often this
 * function is called
 */
function draw() {
  background(100);
  fill(250);
  noStroke();
  let xCenter = width / 2;
  let yCenter = height / 2;
  circle(xCenter, yCenter, curShapeSize);
}
