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

let mapShapeDrawMode = {
  0: "Fill",
  1: "Outline",
};

let curShapeType = 0; // Circle as default
let curShapeDrawMode = 0; // Fill as default
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
  //console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);

  // Check if data received starts with '#'. If so, ignore it
  // Otherwise, parse it! We ignore lines that start with '#' 
  if(!newData.startsWith("#")){
     // Data format is ShapeType, ShapeDrawMode
     const indexOfComma = newData.indexOf(",");
     if(indexOfComma != -1){
       let strShapeType = newData.substring(0, indexOfComma).trim();
       let strShapeDrawMode = newData.substring(indexOfComma + 1, newData.length).trim();
       let newShapeType = parseInt(strShapeType);
       let newShapeDrawMode = parseInt(strShapeDrawMode);
       
       if(newShapeType in mapShapeTypeToShapeName){
         curShapeType = newShapeType;
       }

       if(newShapeDrawMode in mapShapeDrawMode){
        curShapeDrawMode = newShapeDrawMode;
      }

       // console.log(strShapeType, tmpShapeType, strShapeDrawMode, tmpShapeDrawMode);
     }
  }
}

async function serialWriteShapeData(shapeType, shapeSize, shapeDrawMode) {

  if (serial.isOpen()) {
    //console.log("serialWriteShapeData ", shapeType, shapeSize);

    let shapeSizeFraction = (shapeSize - MIN_SHAPE_SIZE) / (MAX_SHAPE_SIZE - MIN_SHAPE_SIZE);

    // Format the text string to send over serial. nf simply formats the floating point
    // See: https://p5js.org/reference/#/p5/nf
    let strData = shapeType + ", " + nf(shapeSizeFraction, 1, 2) + ", " + shapeDrawMode;

    //console.log("Writing to serial: ", strData);
    serial.writeLine(strData);
  }
}

/**
 * Called automatically by p5js. Call frameRate(<num>) to change how often this
 * function is called
 */
function draw() {

  background(100);

  if(curShapeDrawMode == 0){
    fill(250);
    noStroke();
  }else{
    stroke(250);
    noFill();
  }

  let xCenter = width / 2;
  let yCenter = height / 2;
  let halfShapeSize = curShapeSize / 2;
  switch(curShapeType){
    case 0:
      circle(xCenter, yCenter, curShapeSize);
      break;
    case 1:
      rectMode(CENTER);
      square(xCenter, yCenter, curShapeSize);
      break;
    case 2:
      let x1 = xCenter - halfShapeSize;
      let y1 = yCenter + halfShapeSize;

      let x2 = xCenter;
      let y2 = yCenter - halfShapeSize;

      let x3 = xCenter + halfShapeSize;
      let y3 = y1;
     
      triangle(x1, y1, x2, y2, x3, y3)
  }
}

function mousePressed(mouseEvent){
  
  if(mouseButton == RIGHT){
    curShapeDrawMode++;
    if(curShapeDrawMode >= Object.keys(mapShapeDrawMode).length){
      curShapeDrawMode = 0;
    }
  }else{
    curShapeType++;
    if(curShapeType >= Object.keys(mapShapeTypeToShapeName).length){
      curShapeType = 0;
    }
  }

  serialWriteShapeData(curShapeType, curShapeSize, curShapeDrawMode);
}

function mouseMoved(){
  let lastShapeSize = curShapeSize;
  curShapeSize = map(mouseX, 0, width, MIN_SHAPE_SIZE, MAX_SHAPE_SIZE);
  curShapeSize = constrain(curShapeSize, MIN_SHAPE_SIZE, MAX_SHAPE_SIZE);

  if(lastShapeSize != curShapeSize){
    serialWriteShapeData(curShapeType, curShapeSize, curShapeDrawMode);
  }
  //console.log(mouseX, width, curShapeSize, MAX_SHAPE_SIZE);
}
