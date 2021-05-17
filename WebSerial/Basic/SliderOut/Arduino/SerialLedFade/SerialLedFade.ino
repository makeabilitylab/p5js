/**
 * This example receives an integer value (as a text string) delimited by a return character '\n',
 * converts the text into an integer, and uses this to set the analogWrite value on Pin 13.
 * On the Arduino Uno and Leonardo, Pin 13 is tied to the internal green LED (so this
 * internal LED will fade on/off depending on the serial data received).
 * 
 * While this example will work with any Serial program, I wrote it to demonstrate the
 * Serial API for web browsers (currently only works with Chrome). This new API allows 
 * developers to write JavaScript code in a web browser to read/write data over the serial
 * port, including to devices like Arduino.
 *
 * By Jon E. Froehlich
 * @jonfroehlich
 * http://makeabilitylab.io
 * 
 */

const int LED_PIN = 13;
const int BAUD_RATE = 9600;
const int DELAY_MS = 5; // set to 0 for no delay between loop calls

void setup() {
  Serial.begin(BAUD_RATE);
}

void loop() {
  
  // Check to see if there is any incoming serial data
  if(Serial.available() > 0){
    // If we're here, then serial data has been received
    // Read data off the serial port until we get to the endline delimeter ('\n')
    // Store all of this data into a string
    String rcvdSerialData = Serial.readStringUntil('\n'); 

    // Send this data right back out on the serial port for debugging purposes
    Serial.println(rcvdSerialData);

    // Convert the data into an integer
    int val = rcvdSerialData.toInt();
    val = constrain(val, 0, 255); // make sure we contrain to 0, 255
    analogWrite(LED_PIN, val);
  }

  delay(DELAY_MS);
}
