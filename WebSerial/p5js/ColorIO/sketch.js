// This sketch demonstrates how to send and receive data over WebUSB's serial.
//
// This p5.js sketch is intended to run with the following Circuit
// Playground Express program. Your CPX must be connected and running
// this Arduino code to work with this website:
// https://github.com/makeabilitylab/p5js/tree/master/WebSerial/ColorIO/AdafruitCpx/CpxColorIO
//
// By Jon E. Froehlich
// http://makeabilitylab.io/

let sliderInFromSerial;
let sliderOutToSerial;

let serial;
let pHtmlMsg;
let button;

let serialInputRgb;

function setup() {
  createCanvas(400, 400);

  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);

  // Hide this p5 Canvas until we connect
  let canvas = document.getElementsByClassName('p5Canvas')[0];
  canvas.style.display = "none";

  // https://p5js.org/reference/#/p5/createButton
  button = createButton('Connect to Serial Device');
  button.position(10, 10);
  button.id("serial-connect-button");
  button.mousePressed(onButtonConnectToSerialDevice);

  pHtmlMsg = createP('');
  pHtmlMsg.id("html-output");
  pHtmlMsg.position(10, 20);

  sliderOutToSerial = createSlider(0, 255, 100);
  sliderOutToSerial.id("output-slider");
  sliderOutToSerial.position(10, 20);
  sliderOutToSerial.style('width', '80px');
  sliderOutToSerial.input(onSliderOutToSerialValueChanged);
  sliderOutToSerial.style('visibility', 'hidden');

  sliderInFromSerial = createSlider(0, 255, 100);
  sliderInFromSerial.id("input-slider");
  sliderInFromSerial.position(width / 2 + 10, 20);
  sliderInFromSerial.style('width', '80px');
  sliderInFromSerial.style('visibility', 'hidden');
  document.getElementById("input-slider").disabled = true;

  // Try to auto-connect to pre-existing approved ports
  // serial.autoConnectAndOpenPreviouslyApprovedPort();
}

async function onButtonConnectToSerialDevice(){
  if (!serial.isOpen()) {
    await serial.connectAndOpen();
  }
}

function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("Serial connection opened successfully");

  let canvas = document.getElementsByClassName('p5Canvas')[0];
  canvas.style.display = "block";

  sliderOutToSerial.style('visibility', 'visible');
  sliderInFromSerial.style('visibility', 'visible');
  button.style('visibility', 'hidden');
  pHtmlMsg.position(10, height);

  onSliderOutToSerialValueChanged();
}

function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
  slider.style('visibility', 'hidden');
}

function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);

  // Check if data received starts with '#'. If so, ignore it
  // Otherwise, parse it! We ignore lines that start with '#' 
  if(!newData.startsWith("#")){
    serialInputRgb = ColorUtils.rgbToRgb(newData);

    let hsv = ColorUtils.rgbToHsv(serialInputRgb);
    sliderInFromSerial.value(Math.round(hsv.h * 255));
  }
}

/**
 * Called automatically when the slider value changes
 * Sends data out on serial
 */
function onSliderOutToSerialValueChanged() {
  console.log("Slider:", sliderOutToSerial.value());

  if (serial.isOpen()) {
    serial.writeLine(sliderOutToSerial.value());
  }
}

function draw() {
  background(220);

  // Split the canvas into two: 
  //  - left side is for serial output
  //  - right side is for serial input
  let panelWidth = width / 2;
 
  // Draw the left side (for serial output)
  noStroke();
  let rgb = ColorUtils.hsvToRgb(sliderOutToSerial.value() / 255, 1, 1);
  fill(rgb.r, rgb.g, rgb.b);
  rect(0, 0, panelWidth, height);

  // If we've received data, update the right side of canvas
  if(serialInputRgb){
    fill(serialInputRgb.r, serialInputRgb.g, serialInputRgb.b);
    rect(panelWidth, 0, width, height);
  }

  // If the serial port is active, update the slider text output
  if (serial.isOpen()) {
    fill(0);
    let xPos = sliderOutToSerial.x + sliderOutToSerial.width + 5;
    let yPos = sliderOutToSerial.y + textSize() + 2;
    text("Writing to serial:", sliderOutToSerial.x + 2, textSize() + 2);
    text(sliderOutToSerial.value(), xPos, yPos);
    
    xPos = sliderInFromSerial.x + sliderInFromSerial.width + 5;
    yPos = sliderInFromSerial.y + textSize() + 2;
    text("Receiving from serial:", sliderInFromSerial.x + 2, textSize() + 2);
    text(sliderInFromSerial.value(), xPos, yPos);
  }
}
