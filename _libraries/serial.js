// Class to handle serial communications. Currently, only supports text input/output rather than binary data
// Based on https://web.dev/serial/
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
// TODOs:
//  - Support binary in addition to text
//
// By Jon E. Froehlich
// http://makeabilitylab.io/


const SerialEvents = Object.freeze({
  CONNECTION_OPENED: Symbol("New connection opened"),
  CONNECTION_CLOSED: Symbol("Connection closed"),
  DATA_RECEIVED: Symbol("New data received"),
  ERROR_OCCURRED: Symbol("Error occurred"),
});

class Serial {

  constructor() {
    this.serialPort = null;

    this.serialWriter = null;
    this.serialReader = null;
    this.keepReading = false;

    this.readableStreamClosed = null;
    this.writableStreamClosed = null;

    // event handling https://stackoverflow.com/a/56612753
    this.events = new Map();

    this.knownEvents = new Set(
      [SerialEvents.CONNECTION_OPENED,
      SerialEvents.CONNECTION_CLOSED,
      SerialEvents.DATA_RECEIVED,
      SerialEvents.ERROR_OCCURRED]);

    if (navigator.serial) {
      navigator.serial.addEventListener("connect", (event) => {
        console.log("navigator.serial event: connected!");
      });

      navigator.serial.addEventListener("disconnect", (event) => {
        console.log("navigator.serial event: disconnected!");
        this.close();
      });
    }
  }

  on(label, callback) {
    if (this.knownEvents.has(label)) {
      if (!this.events.has(label)) {
        this.events.set(label, []);
      }
      this.events.get(label).push(callback);
    } else {
      console.log(`Could not create event subscription for ${label}. Event unknown.`);
    }
  }

  fireEvent(event, data = null) {
    if (this.events.has(event)) {
      for (let callback of this.events.get(event)) {
        callback(this, data);
      }
    }
  }

  /**
   * Automatically connects and opens the previously approved port
   * If there are more than one, it takes the top port in the approved port list
   */
  async autoConnectAndOpenPreviouslyApprovedPort(serialOptions = { baudRate: 9600 }) {
    if (navigator.serial) {
      const approvedPortList = await navigator.serial.getPorts();
      console.log("approvedPortList", approvedPortList);

      if (approvedPortList.length > 0) {
        console.log("Trying to auto-connect to:", approvedPortList[0].getInfo());
        await this.connect(approvedPortList[0]);

        console.log("Attempting to open port:")
        this.open(serialOptions);
      }
    }
  }

  /**
   * Returns true if open and active
   */
  isOpen() {
    return this.serialPort && this.serialReader && this.serialWriter;
  }

  /**
   * Writes out data as text with a '\n' appended at end
   * @param {*} data 
   */
  async writeLine(data) {
    this.write(data + "\n");
  }

  /**
   * Writes out data as text
   * @param {*} data 
   */
  async write(data) {
    this.serialWriter.write(data);
  }

  /**
   * Close and cleanup serial port
   * Code based on https://web.dev/serial/#close-port
   */
  async close() {
    //See https://reillyeon.github.io/serial/#close-method
    if (this.serialReader) {
      console.log("Closing this.serialReader");

      // from https://reillyeon.github.io/serial/#close-method
      this.keepReading = false;
      this.serialReader.cancel();

      await this.readableStreamClosed.catch(() => { /* Ignore the error */ });
      this.serialReader = null;
      this.readableStreamClosed = null;
    }

    if (this.serialWriter) {
      console.log("Closing this.serialWriter");
      //this.serialWriter.releaseLock();

      // try {
      //   await this.serialWriter.close();
      // } catch (error) {
      //   console.log("serialWriter.close() failed with", error);
      // }
      await this.serialWriter.close();
      await this.writableStreamClosed;

      this.serialWriter = null;
      this.writableStreamClosed = null;
    }

    if (this.serialPort) {
      console.log("Closing this.serialPort");

      await this.serialPort.close();
      this.serialPort = null;
    }

    this.fireEvent(SerialEvents.CONNECTION_CLOSED);
  }

  /**
   * Prompts user for approval to connect to a serial device and opens the port to
   * approved device 
   * 
   * @param {dictionary} portFilters 
   * @param {dictionary} serialOptions 
   */
  async connectAndOpen(portFilters = null, serialOptions = { baudRate: 9600 }) {
    await this.connect(null, portFilters);

    if(this.serialPort){
      this.open(serialOptions);
    }
  }

  /**
   * Attempts to connect to the existing port (if provided). Otherwise prompts the user
   * to connect to a new serial device (with the portFilters, if provided)
   * 
   * @param {port} existingPort 
   * @param {dictionary} portFilters https://reillyeon.github.io/serial/#serialportfilter-dictionary
   */
  async connect(existingPort = null, portFilters = null) {
    try {
      // Prompt user to select any serial port.
      // The navigator.serial.requestPort() function takes an optional object literal that defines filters. 
      // Those are used to match any serial device connected over USB with a mandatory USB vendor (usbVendorId) 
      // and optional USB product identifiers (usbProductId). So, for example:
      //
      //   // start example code
      //   // Filter on devices with the Arduino Uno USB Vendor/Product IDs.
      //   const filters = [
      //     { usbVendorId: 0x2341, usbProductId: 0x0043 },
      //     { usbVendorId: 0x2341, usbProductId: 0x0001 }
      //   ];
      //
      //   // Prompt user to select an Arduino Uno device.
      //   const port = await navigator.serial.requestPort({ filters });
      //
      //   const { usbProductId, usbVendorId } = port.getInfo();
      //   // end example code
      //

      // Get all serial ports the user has previously granted the website access to.
      const oldApprovedPortList = await navigator.serial.getPorts();

      if (!existingPort) {
        // if the user does not pass in an existing port 
        this.serialPort = await navigator.serial.requestPort(portFilters);
      } else if (!oldApprovedPortList.includes(existingPort)) {
        // if the passed in port is not actually in the approved list
        console.log("The port", existingPort.getInfo(), " was not previously approved, prompting user");
        this.serialPort = await navigator.serial.requestPort(portFilters);
      } else {
        console.log("Attempting connection to pre-approved port: ", existingPort.getInfo());
        this.serialPort = existingPort;
      }

      const newApprovedPortList = await navigator.serial.getPorts();

      console.log("Approved ports:");
      newApprovedPortList.forEach((port, index) => console.log(index, ":", port.getInfo()));

      console.log("Selected port:");
      console.log(this.serialPort.getInfo());
      console.log(this.serialPort);
    } catch (error) {
      this.fireEvent(SerialEvents.ERROR_OCCURRED, error);
    }
  }

  /**
   * Connects to the Web Serial port and starts listening to serial input.
   * Defaults to a baud rate of 9600
   * 
   * @param {dictionary} serialOptions See https://reillyeon.github.io/serial/#dom-serialoptions
   */
  async open(serialOptions = { baudRate: 9600 }) {

    try {

      // Open the serial port
      // This function takes in a SerialOptions dictionary where baudRate is the only required member
      // https://reillyeon.github.io/serial/#dom-serialoptions
      await this.serialPort.open(serialOptions);
      console.log("Opened serial port with settings:", serialOptions);

      // Setup serial output stream as text
      const textEncoder = new TextEncoderStream();
      this.writableStreamClosed = textEncoder.readable.pipeTo(this.serialPort.writable);
      this.serialWriter = textEncoder.writable.getWriter();
      console.log("Serial writer set up as:", this.serialWriter);

      // We communicate with the Arduino using text for now
      // TODO: in future could improve this serial.js class to support binary
      const textDecoder = new TextDecoderStream();
      this.keepReading = true;
      this.readableStreamClosed = this.serialPort.readable.pipeTo(textDecoder.writable);
      this.serialReader = textDecoder.readable
        .pipeThrough(new TransformStream(new LineBreakTransformer()))
        .getReader();

      this.fireEvent(SerialEvents.CONNECTION_OPENED);

      // And now wait for data from the serial port
      while (this.serialPort.readable && this.keepReading) {
        try {
          while (true) {
            const { value, done } = await this.serialReader.read();

            if (done) {
              // Allow the serial port to be closed later.
              this.serialReader.releaseLock();
              break;
            }

            if (value) {
              // console.log("Serial received:", value);
              this.fireEvent(SerialEvents.DATA_RECEIVED, value);
            }
          }

        } catch (error) {
          // handle non-fatal error
          //this.fireNewErrorEvent(error);
          this.fireEvent(SerialEvents.ERROR_OCCURRED, error);
        }
        finally {
          // see https://reillyeon.github.io/serial/#close-method
          this.serialReader.releaseLock();
        }
      }

    } catch (error) {
      // handle non-fatal error
      //this.fireNewErrorEvent(error);
      this.fireEvent(SerialEvents.ERROR_OCCURRED, error);
    }
  }
}

// Class from: https://web.dev/serial/#transforming-streams
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
