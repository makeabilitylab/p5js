// This code outputs a slider value over Web Serial and also receives serial input and prints to console. 
// The code is based on https://web.dev/serial/
//
// By Jon E. Froehlich
// http://makeabilitylab.io/

var serialPort;
var serialWriter;

async function onSliderValueChanged(src, event) {
  console.log("Writing to serial: ", src.value.toString());
  let rv = await serialWriter.write(src.value.toString() + "\n");
  console.log("Writing finished.");
}

function onConnectButtonClick() {
  if (navigator.serial) {
    connectSerial();
  } else {
    alert('Web Serial API not supported.');
  }
}

async function connectSerial() {
  const log = document.getElementById('target');

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

    document.getElementById("connect-button").style.visibility = "hidden";
    document.getElementById("interactive-controls").style.visibility = "visible";

    // Now that the serialWriter is established, send out the initial slider value
    onSliderValueChanged(document.getElementById("slider"), null);

    // And now wait for data from the serial port
    while (serialPort.readable) {
      // We are going to communicate with the Arduino using text for now
      const textDecoder = new TextDecoderStream();
      const readableStreamClosed = serialPort.readable.pipeTo(textDecoder.writable);
      const reader = textDecoder.readable
        .pipeThrough(new TransformStream(new LineBreakTransformer()))
        .getReader();

      try {
        while (true) {
          const { value, done } = await reader.read();
          if (done) {
            // Allow the serial port to be closed later.
            reader.releaseLock();
            break;
          }
          if (value) {
            console.log("Serial received:", value);
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
