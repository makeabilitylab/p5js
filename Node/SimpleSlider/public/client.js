socket = io.connect(); // if no url is passed to connect, defaults to defaults to window.location
socket.on("slider", onNewSliderValueFromServer);

/**
 * Called automatically when the slider value changes
 * 
 * @param {*} src 
 * @param {*} event 
 */
async function onSliderValueChanged(src, event) {

  serialWriteValue(src.value);

  // Update the slider value text
  document.getElementById('slider-value-text').innerHTML = src.value;

  if (socket) {
    console.log("Sending data to server", src.value);
    socket.emit("slider", src.value);
  }
}

/**
 * Called by socket.io when new data is received
 */
function onNewSliderValueFromServer(data) {
  console.log("Received from server:", data);
  serialWriteValue(data);
  document.getElementById('slider-widget').value = data;
  document.getElementById('slider-value-text').innerHTML = data;
}

/**
 * If the serial port is active, writes out the given value
 * 
 * @param {*} sliderVal 
 */
async function serialWriteValue(val) {
  if (serialWriter) {
    console.log("Writing to serial: ", val.toString());
    // Write out the value as a string with a line break '\n' delimeter
    let rv = await serialWriter.write(val.toString() + "\n");
    console.log("Serial write finished.");
  }
}
