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

// Create the canvas, wire up the Serial event handlers, and try to silently
// reconnect to a port the user already approved this session.
function setup() {
  createCanvas(600, 400);

  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A horizontal rainbow hue gradient with a vertical line at the mouse position; clicking sends the selected color's red, green, and blue values out over serial to a connected microcontroller.");

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

// Button handler: a user gesture is required to open the serial port, so this
// kicks off connectAndOpen() on the first click and hides the button afterward.
function onSerialConnectButtonClicked(){
  if (!serial.isOpen()) {
    serial.connectAndOpen();
  }else{
    serialConnectButton.style("display", "none");
  }
}

// Serial event handler: a serial error occurred; show it on the page.
function onSerialErrorOccurred(eventSender, error) {
  console.log("onSerialErrorOccurred", error);
  pHtmlMsg.html(error);
}

// Serial event handler: connection opened; hide the connect button.
function onSerialConnectionOpened(eventSender) {
  console.log("onSerialConnectionOpened");
  pHtmlMsg.html("onSerialConnectionOpened");
  serialConnectButton.style("display", "none");
}

// Serial event handler: connection closed; re-show the connect button.
function onSerialConnectionClosed(eventSender) {
  console.log("onSerialConnectionClosed");
  pHtmlMsg.html("onSerialConnectionClosed");
  serialConnectButton.style("display", "block");
}

// Serial event handler: data arrived from the device (this sketch is output-only,
// so we just echo it to the page). Triggered per line received, not per frame.
function onSerialDataReceived(eventSender, newData) {
  console.log("onSerialDataReceived", newData);
  pHtmlMsg.html("onSerialDataReceived: " + newData);
}

// Each frame: draw the hue gradient, a line at the live mouse x, and (if a color
// has been clicked) a marker line plus its RGB text.
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

// On click: sample the hue under the mouse, save it, and write "R,G,B" out to
// the device (only if the port is open).
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


