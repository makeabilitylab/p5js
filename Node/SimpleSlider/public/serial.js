// This code outputs a slider value over Web Serial and also receives serial input and prints to console. 
// The code is based on https://web.dev/serial/
//
// Currently, this code only works on Chrome and *only* if you enable an experimental flag:
// 1. First, type chrome://flags in the address bar
// 2. Then, in the search box, type "experimental-web-platform-features"
// 3. This flag should be set to "Enabled"
// 4. Restart your browser
// 
// To test that this worked
// 1. Open Chrome to any webpage
// 2. Open the dev console (cmd-option-i on Mac or ctrl-shift-i on Windows) and type: > navigator.serial
// 3. If you see something like "Serial {onconnect:null, ondisconnect: null}" then it worked!
//    If, instead, it says "undefined" then it didn't work. Try restarting your computer and then Chrome.
//
// By Jon E. Froehlich
// http://makeabilitylab.io/

var serialPort;
var serialWriter;

/**
 * By default, we don't show the connect button for web serial (as it's only relevant to certain clients)
 * @param {boolean} shouldShowButton 
 */
function showConnectButton(shouldShowButton){
  if(shouldShowButton){
    document.getElementById("connect-button").style.display = "";
  }else{
    document.getElementById("connect-button").style.display = "none";
  }
}

/**
 * Automatically called when the connect button has been clicked
 */
function onConnectButtonClick() {
  if (navigator.serial) {
    connectSerial();
  } else {
    alert('Web Serial API not supported.');
  }
}

/**
 * Called when the serial connection is established
 */
function onSerialConnectionEstablished() {
  document.getElementById('connect-button').style.display = "none";
  document.getElementById('error-message').innerHTML = "";
}

/**
 * Called when new data has been received
 * @param {String} data a text string received on serial port (full line of text with '\n' stripped off)
 */
function onNewSerialDataReceived(data){
  console.log("Serial received:", data);
}

/**
 * Connects to the Web Serial port and starts listening to serial input
 */
async function connectSerial() {
  const log = document.getElementById('error-message');

  try {
    // Prompt user to select any serial port.
    serialPort = await navigator.serial.requestPort();

    // Get all serial ports the user has previously granted the website access to.
    const ports = await navigator.serial.getPorts();

    console.log("Approved ports:");
    console.log(ports);

    console.log("Selected port:");
    console.log(serialPort);

    await serialPort.open({ baudRate: 9600 });
    console.log("Opened serial port with baud rate of 9600");

    // Setup serial output stream
    const textEncoder = new TextEncoderStream();
    const writableStreamClosed = textEncoder.readable.pipeTo(serialPort.writable);
    serialWriter = textEncoder.writable.getWriter();

    // We communicate with the Arduino using text for now
    const textDecoder = new TextDecoderStream();
    const readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
    const serialReader = textDecoder.readable
      .pipeThrough(new TransformStream(new LineBreakTransformer()))
      .getReader();

    onSerialConnectionEstablished();

    // And now wait for data from the serial port
    while (serialPort.readable) {
      try {
        while (true) {
          const { value, done } = await serialReader.read();
          if (done) {
            // Allow the serial port to be closed later.
            serialReader.releaseLock();
            break;
          }
          if (value) {
            onNewSerialDataReceived(value);
          }
        }
      } catch (error) {
        // TODO: Handle non-fatal read error.
        console.error(error);
      }
    }
  } catch (error) {
    log.innerHTML = error;
  }
}

class LineBreakTransformer {
  constructor() {
    // A container for holding stream data until a new line.
    this.chunks = "";
  }

  transform(chunk, controller) {
    // Append new chunks to existing chunks.
    this.chunks += chunk;
    // For each line breaks in chunks, send the parsed lines out.
    const lines = this.chunks.split("\r\n");
    this.chunks = lines.pop();
    lines.forEach((line) => controller.enqueue(line));
  }

  flush(controller) {
    // When the stream is closed, flush any remaining chunks out.
    controller.enqueue(this.chunks);
  }
}
