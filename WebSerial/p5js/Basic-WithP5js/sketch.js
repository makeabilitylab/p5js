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

// Run once at startup: create the canvas, wire up Web Serial (make a Serial
// object, register connection/data/error handlers, try to reconnect to a
// previously approved port), and build a hidden slider that becomes visible
// once a connection opens. The actual connect happens on click (mousePressed).
function setup() {
  createCanvas(400, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A gray canvas that displays the current value (0 to 255) of a slider that is sent out over serial to control a connected microcontroller's LEDs.");

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

// Called by serial.js if anything goes wrong on the serial connection.
function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

// Called by serial.js once the port opens: reveal the slider so the user can
// start sending values.
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("onSerialConnectionOpened");
  slider.style('visibility', 'visible');
}

// Called by serial.js when the port closes: hide the slider again.
function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
  slider.style('visibility', 'hidden');
}

// Called by serial.js when data arrives from the microcontroller. This sketch
// is output-only, so we just echo whatever comes back to the status <p>.
function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);
}

// Fires whenever the slider moves: send its value (0-255) out over serial as a
// line of text for the Arduino to read.
function onSliderValueChanged() {
  console.log("Slider:", slider.value());

  // If the serial connection is open, send the slider value
  if (serial.isOpen()) {
    serial.writeLine(slider.value());
  }
}

// Each frame: show the current slider value once connected, otherwise prompt
// the user to click to set up the serial connection.
function draw() {
  background(220);

  if (serial.isOpen()) {
    text(slider.value(), 100, 24);
  } else {
    text("Click anywhere to setup serial connection", 50, height / 2);
  }
}

// Browsers require a user gesture to open a serial port, so the connection is
// triggered here on click. connectAndOpen() shows the port-picker dialog.
function mousePressed() {
  if (!serial.isOpen()) {
    serial.connectAndOpen();
  }
}
