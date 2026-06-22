// Demonstrates a basic real-time graph with serial input. See:
// https://makeabilitylab.github.io/physcomp/communication/p5js-serial
// 
// By Jon E. Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//

let serial; // the Serial object
let serialOptions = { baudRate: 115200  }; // must match the Arduino's Serial.begin() baud rate
let queue = [];  // buffer of incoming values waiting to be plotted (drained in draw)
let xPos = 0;    // current x pixel column; wraps back to 0 at the right edge

// Run once at startup: create the canvas and wire up Web Serial (make a Serial
// object, register connection/data/error handlers, try to reconnect to a
// previously approved port), add a status <p>, and paint the dark background
// once (draw() never clears it, so bars accumulate left-to-right).
function setup() {
  createCanvas(750, 420);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A real-time scrolling bar graph on a dark canvas that plots sensor values received over serial from a connected microcontroller, with bar color shifting based on each value.");

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

  background(50);
}

// Each frame: drain any queued serial values, drawing one vertical bar per
// value and advancing one pixel column each time. When we reach the right edge,
// wrap back to the left and repaint the background to start a fresh sweep.
function draw() {

  while(queue.length > 0){
    // Grab the least recent value of queue (first in first out)
    // JavaScript is not multithreaded, so we need not lock the queue
    // before reading/modifying.
    let val = queue.shift();
    let yPixelPos = height - val * height;

    // Spruce up the color a bit by dynamically setting the line
    // color based on the current sensor value
    let redColor = val * 255;
    stroke(redColor, 34, 255); //set the color
    line(xPos, height, xPos, yPixelPos);

    xPos++;
  }

  if(xPos >= width){
    xPos = 0;
    background(50);
  }
}

// Called by serial.js if anything goes wrong on the serial connection.
function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
}

// Called by serial.js once the port opens.
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
}

// Called by serial.js when the port closes.
function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
}

// Called by serial.js when data arrives: parse the value and push it onto the
// queue for draw() to plot. (Buffering here decouples the serial event rate
// from the frame rate.)
function onSerialDataReceived(eventSender, newData) {
  //console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);

  // JavaScript is not multithreaded, so we need not lock the queue
  // before pushing new elements
  queue.push(parseFloat(newData));
}

// Browsers require a user gesture to open a serial port, so we connect here on
// click. connectAndOpen() shows the port-picker dialog; wrap it in try/catch
// because the user can cancel or the port can fail to open.
function mouseClicked() {
  if (!serial.isOpen()) {
    try {
      serial.connectAndOpen(null, serialOptions);
    } catch (error) {
      console.error("Serial connection failed:", error);
    }
  }
}