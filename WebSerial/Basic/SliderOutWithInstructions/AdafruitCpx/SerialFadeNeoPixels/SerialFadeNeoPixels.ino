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
#include <Adafruit_CircuitPlayground.h> // Library ref: https://caternuson.github.io/Adafruit_CircuitPlayground/

const int NUM_NEO_PIXELS = 10;
const int BAUD_RATE = 9600;
const int DELAY_MS = 5; // set to 0 for no delay between loop calls

void setup() {
  CircuitPlayground.begin();
  Serial.begin(BAUD_RATE);

  // Set CPX colors into a pretty state. This just lets us know that the program is running 
  // and we are waiting for serial data
  for(int i = 0; i < NUM_NEO_PIXELS; i++){
    // color wheel is a hue color wheel from 0 to 255
    int wheelPosition = map(i, 0, NUM_NEO_PIXELS, 0, 128);

    // convert to a 24-bit RGB color val
    // https://caternuson.github.io/Adafruit_CircuitPlayground/colorWheel.html
    int colorWheelVal = CircuitPlayground.colorWheel(wheelPosition);
    CircuitPlayground.setPixelColor(i, colorWheelVal);
  }
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
      
      // Sets a NeoPixel to the specified color
      // setPixelColor(p, r, g, b) where p = the NeoPixel index
      // and r, g, b are 0-255 values for red, green, and blue
      CircuitPlayground.setPixelColor(i, val, 0, 0);
    }
  }
  
  delay(10);
}
