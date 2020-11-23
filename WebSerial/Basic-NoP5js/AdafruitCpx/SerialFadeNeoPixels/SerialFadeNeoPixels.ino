/**
 * This example receives an integer value (as a text string) delimited by a return character '\n',
 * converts the text into an integer, and uses this to set the "brightness" of the red LEDs
 * on the NeoPixels.
 * 
 * While this example will work with any Serial program, I wrote it to demonstrate the
 * Serial API for web browsers (currently only works with Chrome). This new API allows 
 * developers to write JavaScript code in a web browser to read/write data over the serial
 * port, including to devices like Arduino.
 * 
 * Circuit Playground API reference: 
 * https://caternuson.github.io/Adafruit_CircuitPlayground/
 * 
 * Web Serial API:
 * https://web.dev/serial/
 * 
 * By Jon E. Froehlich
 * @jonfroehlich
 * http://makeabilitylab.io
 * 
 */
#include <Adafruit_CircuitPlayground.h>

const int NUM_NEO_PIXELS = 10;
const int BAUD_RATE = 9600;
const int DELAY_MS = 5; // set to 0 for no delay between loop calls

void setup() {
  CircuitPlayground.begin();
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

    // We expect a value between 0 and 255 (just make sure)
    val = constrain(val, 0, 255); // make sure we contrain to 0, 255

    // Iterate through all NeoPixel LEDs and set the red brightness level
    for(int i = 0; i < NUM_NEO_PIXELS; i++){
      CircuitPlayground.setPixelColor(i, val, 0, 0);
    }
  }

  delay(10);
}
