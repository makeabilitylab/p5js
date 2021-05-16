// This sketch demonstrates how to use a slider to send a value over
// WebUSB's serial connection. It transmits a value between 0 and 255.
//
// This p5.js sketch is intended to run with the following Circuit
// Playground Express programs. Your CPX must be connected and running
// this Arduino code to work with this website. You can either use:
//
// SerialColorNeoPixels
// Changes the color of the NeoPixels depending on the slider's position:
// https://github.com/makeabilitylab/p5js/tree/master/WebSerial/Basic-NoP5js/AdafruitCpx/SerialColorNeoPixels
//
// SerialFadeNeoPixels
// Changes the brightness of the NeoPixels depending on the slider's position:
// https://github.com/makeabilitylab/p5js/tree/master/WebSerial/Basic-NoP5js/AdafruitCpx/SerialFadeNeoPixels
//
// By Jon E. Froehlich
// http://makeabilitylab.io/

let slider;
let serial;
let pHtmlMsg;

function setup() {
  createCanvas(400, 400);

  serial = new Serial();
  serial.on(SerialEvents.CONNECTION_OPENED, onSerialConnectionOpened);
  serial.on(SerialEvents.CONNECTION_CLOSED, onSerialConnectionClosed);
  serial.on(SerialEvents.DATA_RECEIVED, onSerialDataReceived);
  serial.on(SerialEvents.ERROR_OCCURRED, onSerialErrorOccurred);
  serial.autoConnectAndOpenPreviouslyApprovedPort();

  pHtmlMsg = createP('message');

  slider = createSlider(0, 255, 100);
  slider.position(10, 10);
  slider.style('width', '80px');
  slider.input(onSliderValueChanged);
  slider.style('visibility', 'hidden');
}

function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("onSerialConnectionOpened");
  slider.style('visibility', 'visible');
}

function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
  slider.style('visibility', 'hidden');
}

function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);
}

function onSliderValueChanged() {
  console.log("Slider:", slider.value());

  // If the serial connection is open, send the slider value
  if (serial.isOpen()) {
    serial.writeLine(slider.value());
  }
}

function draw() {
  background(220);

  if (serial.isOpen()) {
    text(slider.value(), 100, 24);
  } else {
    text("Click anywhere to setup serial connection", 50, height / 2);
  }
}

function mousePressed() {
  if (!serial.isOpen()) {
    serial.connectAndOpen();
  }
}
