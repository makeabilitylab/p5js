// This sketch demonstrates how to send three comma separated values over 
// WebUSB using serial. On a mouse click, it will transmit a comma separated
// value string of R, G, B where each value corresponds to red, green, blue
// of 0 to 255 intensity
//
// This p5.js sketch is intended to run with the following Circuit
// Playground Express program. Your CPX must be connected and running
// this Arduino code to work with this website:
// https://github.com/makeabilitylab/p5js/tree/master/WebSerial/ColorSerialOut/AdafruitCpx/CpxColorSerialIn
//
// By Jon E. Froehlich
// http://makeabilitylab.io/

let serial;
let pHtmlMsg;
let serialConnectButton;

let mouseXSaved = null;
let rgbSaved = null;

function setup() {
  createCanvas(600, 400);

  serialConnectButton = createButton("Connect to Serial Device");
  serialConnectButton.mousePressed(onSerialConnectButtonClicked);

  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);
  serial.autoConnectAndOpenPreviouslyApprovedPort();

  pHtmlMsg = createP('Connect to your serial device to begin!');
}

function onSerialConnectButtonClicked(){
  if (!serial.isOpen()) {
    serial.connectAndOpen();
  }else{
    serialConnectButton.style("display", "none");
  }
}

function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("onSerialConnectionOpened");
  serialConnectButton.style("display", "none");
}

function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
  serialConnectButton.style("display", "block");
}

function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);
}

function draw() {
  background(220);

  // Draw the pretty hue gradient with max saturation and brightness
  for(x = 0; x < width; x++){
    let hue = x / width;
    let rgb = ColorUtils.hsvToRgb(hue, 1, 1);
    noFill();
    stroke(rgb.r, rgb.g, rgb.b);
    line(x, 0, x, height);
  }

  // Draw current mouse position as a vertical line
  stroke(255);
  line(mouseX, 0, mouseX, height);
  
  // If the mouse has been pressed and an RGB value saved
  // then draw that to the screen
  if(mouseXSaved && rgbSaved){
    stroke(0);
    line(mouseXSaved, 0, mouseXSaved, height);

    noStroke();
    fill(0);
    let rgbText = "(" + rgbSaved.r + "," + rgbSaved.g + "," + rgbSaved.b + ")";
    text(rgbText, mouseXSaved + 2, 20);
  }
}

function mousePressed(){
  // When the mouse is pressed, check to see if the serial device is open and connected
  // And, if so, save the mouse position and convert it to a color
  if(serial.isOpen()){
    mouseXSaved = mouseX;
    let hue = mouseXSaved / width;
    rgbSaved = ColorUtils.hsvToRgb(hue, 1, 1);

    console.log("Sending: " + rgbSaved.r + "," + rgbSaved.g + "," + rgbSaved.b);
    serial.writeLine(rgbSaved.r + "," + rgbSaved.g + "," + rgbSaved.b);
  }
}


