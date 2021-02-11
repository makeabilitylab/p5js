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
