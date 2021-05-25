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

let lastBrushX = 0;
let lastBrushY = 0;

let mapColorMode = {
  0: "Brush speed",
  1: "Brush location",
  2: "Mouse location",
};

let brushColorMode = 0;

let hideCrosshair = false;
let crossHairSize = 10;

let offscreenGfxBuffer;

let treatMouseAsPaintBrush = true;
let serialBrushOn = true;
let showInstructions = true;

const MAX_BRUSH_SIZE = 150;

let serialOptions = { baudRate: 115200 };

let p5Canvas;

function setup() {
  p5Canvas = createCanvas(640, 480);

  // Setup Web Serial using serial.js
  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // If we have previously approved ports, attempt to connect with them
  //serial.autoConnectAndOpenPreviouslyApprovedPort(serialOptions);

  // Set the color mode to HSB with max values of 1
  // See: https://p5js.org/reference/#/p5/colorMode
  colorMode(HSB, 1, 1, 1, 1)

  //brushColor = color(250, 250, 250, 50);
  brushColor = color(1, 0, 1, 0.18);

  // Add in a lil <p> element to provide messages. This is optional
  pHtmlMsg = createP("Press 'o' key to open the serial connection dialog");

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
  pHtmlMsg.html("onSerialDataReceived: " + newData);

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

    lastBrushX = brushX;
    lastBrushY = brushY;

    brushX = xFraction * width;
    brushY = yFraction * height;
    
    brushSize = MAX_BRUSH_SIZE * brushSizeFraction;

    //pHtmlMsg.html("(" + brushX + ", " + brushY + ")" + " " + brushSize);
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
  let hue = 0;
  if(brushColorMode == 0){
    let brushMovementDist = dist(lastBrushX, lastBrushY, brushX, brushY);
    hue = map(brushMovementDist, 0, 50, 0, 1);
  }else if(brushColorMode == 1){
    hue = map(brushX, 0, width, 0, 1);
  }else if(brushColorMode == 2){
    hue = map(mouseX, 0, width, 0, 1);
  }
  
  //print(brushMovementDist);
  brushColor = color(hue, 0.7, 1, 0.2);

  if(treatMouseAsPaintBrush && mouseIsPressed){
    drawBrushStroke(mouseX, mouseY);
  }

  if(serialBrushOn && serial.isOpen()){
    drawBrushStroke(brushX, brushY);
  }

  image(offscreenGfxBuffer, 0, 0);

  // draw the paint cursor
  if(!hideCrosshair && brushSize <= 0 || !serialBrushOn){

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

  if(showInstructions){
    drawInstructions();
  }
}

function drawInstructions(){
  // Some instructions to the user
  noStroke();
  fill(255);
  let tSize = 10;

  textSize(tSize);
  let yText = 2;
  let yBuffer = 1;
  let xText = 3;
  text("KEYBOARD COMMANDS", xText, yText + tSize);
  yText += tSize + yBuffer;
  text("'i' : Show/hide instructions", xText, yText + tSize);
  
  yText += tSize + yBuffer;
  let strConnectToSerial = "'o' : Open serial (";
  if(serial.isOpen()){
    strConnectToSerial += "connected";
  }else{
    strConnectToSerial += "not connected";
  }
  strConnectToSerial += ")";
  text(strConnectToSerial, xText, yText + tSize);

  yText += tSize + yBuffer;
  let strMouseAsBrush = "'m' : Toggle mouse as brush (";
  if(treatMouseAsPaintBrush){
    strMouseAsBrush += "on";
  }else{
    strMouseAsBrush += "off";
  }
  strMouseAsBrush += ")";
  text(strMouseAsBrush, xText, yText + tSize);

  yText += tSize + yBuffer;
  let strSerialBrushOn = "'s' : Toggle serial brush (";
  if(serialBrushOn){
    strSerialBrushOn += "on";
  }else{
    strSerialBrushOn += "off";
  }
  strSerialBrushOn += ")";
  text(strSerialBrushOn, xText, yText + tSize);

  yText += tSize + yBuffer;
  let strBrushType = "'b' : Set brush type (" + mapBrushTypeToShapeName[brushType].toLowerCase() + ")";
  text(strBrushType, xText, yText + tSize);
  
  yText += tSize + yBuffer;
  let strToggleFillMode = "'f' : Toggle fill mode (" + mapBrushFillMode[brushFillMode].toLowerCase() + ")";
  text(strToggleFillMode, xText, yText + tSize);

  yText += tSize + yBuffer;
  let strColorMode = "'c' : Color mode (" + mapColorMode[brushColorMode].toLowerCase() + ")";
  text(strColorMode, xText, yText + tSize);
}

/**
 * Draws the brush stroke with the current global settings at the x,y position
 * 
 * @param {Number} xBrush x brush position
 * @param {Number} yBrush y brush position
 */
function drawBrushStroke(xBrush, yBrush){
  if(brushSize > 0){
    if (brushFillMode == 0) {
      offscreenGfxBuffer.fill(brushColor);
      offscreenGfxBuffer.noStroke();
    } else {
      offscreenGfxBuffer.stroke(brushColor);
      offscreenGfxBuffer.noFill();
    }

    let xCenter = xBrush;
    let yCenter = yBrush;
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
}

/**
 * The keyPressed() function is called once every time a key is pressed.
 * See: https://p5js.org/reference/#/p5/keyPressed
 */
function keyPressed() {
  let lastFillMode = brushFillMode;
  let lastBrushType = brushType;
  print("keyPressed", key);
  if(key == 'f'){
    brushFillMode++;
    if (brushFillMode >= Object.keys(mapBrushFillMode).length) {
      brushFillMode = 0;
    }
  }else if(key == 'b'){
    brushType++;
    if (brushType >= Object.keys(mapBrushTypeToShapeName).length) {
      brushType = 0;
    }
  }else if(key == 'c'){
    brushColorMode++;
    if(brushColorMode >= Objects.keys(mapColorMode).length){
      brushColorMode = 0;
    }
  }
  else if(key == 's'){
    serialBrushOn = !serialBrushOn;
  }else if(key == 'm'){
    treatMouseAsPaintBrush = !treatMouseAsPaintBrush;
  }else if(key == 'i'){
    showInstructions = !showInstructions;
    print("showInstructions", showInstructions);
  }else if(key == 'o'){
    if (!serial.isOpen()) {
      serial.connectAndOpen(null, serialOptions);
    }
  }

  if(lastFillMode != brushFillMode || lastBrushType != brushType){
    serialWriteShapeData(brushType, brushFillMode);
  }
}
