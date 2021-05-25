// This sketch demonstrates how to 
// 
// TODO:
//
// By Jon E. Froehlich
// http://makeabilitylab.io/

let pHtmlMsg;

let mapBrushTypeToShapeName = {
  0: "Circle",
  1: "Square",
  2: "Triangle"
};

let mapBrushFillMode = {
  0: "Fill",
  1: "Outline",
};

let brushType = 0; // Circle as default
let brushFillMode = 0; // Fill as default
let brushSize = 10;
let brushX = 0;
let brushY = 0;
let brushColor;

let hideCrosshair = false;
let crossHairSize = 10;

let offscreenGfxBuffer;

const MAX_BRUSH_SIZE = 100;

let serialOptions = { baudRate: 115200 };

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

  brushColor = color(250, 250, 250, 50);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("Click anywhere on this page to open the serial connection dialog");

  offscreenGfxBuffer = createGraphics(width, height);
  offscreenGfxBuffer.background(100);

  background(100);
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
  //console.log("onSerialDataReceived", newData);
  //pHtmlMsg.html("onSerialDataReceived: " + newData);

  if(!newData.startsWith("#")){
    if(newData.toLowerCase().startsWith("cls")){
      offscreenGfxBuffer.background(100);
    }else{
      parseBrushData(newData);
    }
  }
}

function parseBrushData(newData){
  // Parse the data
  // The format is xPosFrac, yPosFrac, sizeFrac, brushType, brushFillMode
  let startIndex = 0;
  let endIndex = newData.indexOf(",");
  if(endIndex != -1){
    let strBrushXFraction = newData.substring(startIndex, endIndex).trim();
    let xFraction = parseFloat(strBrushXFraction);

    startIndex = endIndex + 1;
    endIndex = newData.indexOf(",", startIndex);
    let strBrushYFraction = newData.substring(startIndex, endIndex).trim();
    let yFraction = parseFloat(strBrushYFraction);

    startIndex = endIndex + 1;
    endIndex = newData.indexOf(",", startIndex);
    let strBrushSizeFraction = newData.substring(startIndex, endIndex).trim();
    let brushSizeFraction = parseFloat(strBrushSizeFraction);

    startIndex = endIndex + 1;
    endIndex = newData.indexOf(",", startIndex);
    let strBrushType = newData.substring(startIndex, endIndex).trim();
    let newBrushType = parseInt(strBrushType);

    startIndex = endIndex + 1;
    //endIndex = newData.indexOf(",", startIndex);
    endIndex = newData.length;
    let strBrushDrawMode = newData.substring(startIndex, endIndex).trim();
    let newBrushDrawMode = parseInt(strBrushDrawMode);

    // If data valid, set new shape type
    if (newBrushType in mapBrushTypeToShapeName) {
      brushType = newBrushType;
    }

    // if shape draw mode valid, set new draw mode
    if (newBrushDrawMode in mapBrushFillMode) {
      brushFillMode = newBrushDrawMode;
    }

    brushX = xFraction * width;
    brushY = yFraction * height;
    
    brushSize = MAX_BRUSH_SIZE * brushSizeFraction;

    pHtmlMsg.html("(" + brushX + ", " + brushY + ")" + " " + brushSize);
  }
}

async function serialWriteShapeData(shapeType, shapeDrawMode) {

  if (serial.isOpen()) {

    // Format the text string to send over serial. nf simply formats the floating point
    // See: https://p5js.org/reference/#/p5/nf
    let strData = shapeType + "," + shapeDrawMode;

    serial.writeLine(strData);
  }
}

/**
 * Called automatically by p5js. Call frameRate(<num>) to change how often this
 * function is called
 */
function draw() {

  //background(100);

  if(brushSize > 0){
    if (brushFillMode == 0) {
      offscreenGfxBuffer.fill(brushColor);
      offscreenGfxBuffer.noStroke();
    } else {
      offscreenGfxBuffer.stroke(brushColor);
      offscreenGfxBuffer.noFill();
    }

    let xCenter = brushX;
    let yCenter = brushY;
    let halfShapeSize = brushSize / 2;
    switch (brushType) {
      case 0:
        offscreenGfxBuffer.circle(xCenter, yCenter, brushSize);
        break;
      case 1:
        offscreenGfxBuffer.rectMode(CENTER);
        offscreenGfxBuffer.square(xCenter, yCenter, brushSize);
        break;
      case 2:
        let x1 = xCenter - halfShapeSize;
        let y1 = yCenter + halfShapeSize;

        let x2 = xCenter;
        let y2 = yCenter - halfShapeSize;

        let x3 = xCenter + halfShapeSize;
        let y3 = y1;

        offscreenGfxBuffer.triangle(x1, y1, x2, y2, x3, y3)
    }
  }

  image(offscreenGfxBuffer, 0, 0);

  // draw the paint cursor
  if(!hideCrosshair && brushSize <= 0){

    // Change color of crosshair dependent on background color
    let bgColorAtCrossHair = offscreenGfxBuffer.get(brushX, brushY);
    if(red(bgColorAtCrossHair) > 150){
      stroke(0, 0, 0, 127); // background is light, make crosshair dark
    }else{
      stroke(255, 255, 255, 127);
    }
     
    const halfCrosshair = crossHairSize / 2.0;
    line(brushX - halfCrosshair, brushY, brushX + halfCrosshair, brushY);
    line(brushX, brushY - halfCrosshair, brushX, brushY + halfCrosshair);
  }

  // Some instructions to the user
  noStroke();
  fill(255);
  const tSize = 14;
  let strInstructions = "";
  if (serial.isOpen()) {
    strInstructions = "Left click to change the shape. Right click to change fill/outline";
  } else {
    strInstructions = "Click anywhere to connect with serial"
  }
  textSize(tSize);
  let tWidth = textWidth(strInstructions);
  const xText = width / 2 - tWidth / 2;
  text(strInstructions, xText, height - tSize + 6);
}

function mousePressed() {
  // Only update states if we're connected to serial
  if (serial.isOpen()) {
    if (mouseButton == RIGHT) {
      // Switch between fill and outline mode based on right click
      brushFillMode++;
      if (brushFillMode >= Object.keys(mapBrushFillMode).length) {
        brushFillMode = 0;
      }
      console.log("Right click!");
    } else {
      brushType++;
      if (brushType >= Object.keys(mapBrushTypeToShapeName).length) {
        brushType = 0;
      }
    }
    serialWriteShapeData(brushType, brushFillMode);
  }
}

/**
 * Called automatically when the mouse button has been pressed and then released
 * According to the p5.js docs, this function is only guaranteed to be called when
 * the left mouse button is clicked.
 * 
 * See: https://p5js.org/reference/#/p5/mouseClicked
 */
function mouseClicked() {
  if (!serial.isOpen()) {
    serial.connectAndOpen(null, serialOptions);
  }
}
