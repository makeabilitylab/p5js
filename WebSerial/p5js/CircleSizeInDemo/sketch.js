// Demonstrates basic web serial input with p5js. See:
// https://makeabilitylab.github.io/physcomp/communication/p5js-serial
// 
// By Jon E. Froehlich
// @jonfroehlich
// http://makeabilitylab.io/
//

let shapeFraction = 0; // tracks the new shape fraction off serial
let serial; // the Serial object
let serialOptions = { baudRate: 115200  }; // must match the Arduino's Serial.begin() baud rate

// Run once at startup: create the canvas and wire up Web Serial (make a Serial
// object, register connection/data/error handlers, try to reconnect to a
// previously approved port) and add a status <p>. Connect happens on click.
function setup() {
  createCanvas(400, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A white circle centered on a dark gray canvas whose diameter is set by a value received over serial from a connected microcontroller.");

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
}

// Each frame: draw a centered white circle whose diameter scales with the
// latest 0.0-1.0 fraction received over serial.
function draw() {
  background(100);

  noStroke(); // turn off outline
  fill(250); // white circle

  // Get x,y center of drawing Canvas
  let xCenter = width / 2;
  let yCenter = height / 2;

  // Set the diameter based on mouse x position
  const maxDiameter = min(width, height);
  // let shapeFraction = mouseX / width;
  let circleDiameter = maxDiameter * shapeFraction;
  circle(xCenter, yCenter, circleDiameter);
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

// Called by serial.js when data arrives: parse the incoming 0.0-1.0 fraction
// and store it so draw() can resize the circle.
function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);

  shapeFraction = parseFloat(newData);
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