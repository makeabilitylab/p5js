 /**
 * This example receives an integer value (as a text string) delimited by a return character '\n',
 * converts the text into an integer, and uses this to set the color of the Circuit Playground
 * Express (CPX) built-in NeoPixels.
 * 
 * While this example will work with any Serial program, I wrote it to demonstrate the
 * Serial API for web browsers (currently only works with Chrome). This new API allows 
 * developers to write JavaScript code in a web browser to read/write data over the serial
 * port, including to devices like Arduino.
 * 
 * You can read the CircuitPlayground color wheel source code here:
 * https://github.com/adafruit/Adafruit_CircuitPlayground/blob/336c4c1914fc13071d1c6248f0b00128888809af/Adafruit_CircuitPlayground.cpp
 *
 * By Jon E. Froehlich
 * @jonfroehlich
 * http://makeabilitylab.io
 * 
 */
#include <Adafruit_CircuitPlayground.h> // Library ref: https://caternuson.github.io/Adafruit_CircuitPlayground/

const int NUM_NEO_PIXELS = 10; // There are 10 built-in NeoPixels
const int BAUD_RATE = 9600;
const int DELAY_MS = 5; // set to 0 for no delay between loop calls

void setup() {
  CircuitPlayground.begin();
  Serial.begin(BAUD_RATE);

  // Set colors into a pretty state. This just lets us know that the program is running 
  // and we are waiting for serial data
  for(int i = 0; i < NUM_NEO_PIXELS; i++){
    // color wheel is a hue color wheel from 0 to 255
    int wheelPosition = map(i, 0, NUM_NEO_PIXELS, 0, 255);

    // convert to a 24-bit RGB color val
    // https://caternuson.github.io/Adafruit_CircuitPlayground/colorWheel.html
    int colorWheelVal = CircuitPlayground.colorWheel(wheelPosition);
    CircuitPlayground.setPixelColor(i, colorWheelVal);
  }
}

void loop() {
  if(Serial.available() > 0){
    String s1 = Serial.readStringUntil('\n');// s1 is String type variable.
    int val = s1.toInt();

    // We expect a value between 0 and 255 (just make sure)
    val = constrain(val, 0, 255); // make sure we contrain to 0, 255

    // Convert the val into a RGB color using the colorWheel function
    // See: https://caternuson.github.io/Adafruit_CircuitPlayground/colorWheel.html
    int colorWheelVal = CircuitPlayground.colorWheel(val);

    // Send data back out on serial port for debugging
    Serial.print(val);
    Serial.print(",");
    Serial.println(colorWheelVal);

    // Loop through all of the NeoPixels and set the color
    for(int i = 0; i < NUM_NEO_PIXELS; i++){
      CircuitPlayground.setPixelColor(i, colorWheelVal);
    }
  }

  delay(DELAY_MS);
}
