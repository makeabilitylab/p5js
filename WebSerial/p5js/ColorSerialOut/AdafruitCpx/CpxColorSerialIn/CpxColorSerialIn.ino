/**
  This example receives a comma separated string of R, G, B values delimited by a return character '\n'.
  Then parses and converts those values to integers and appropriately sets the color of the Circuit 
  Playground Express (CPX) built-in NeoPixels.

  While this example will work with any Serial program, I wrote it to demonstrate the
  Serial API for web browsers (currently only works with Chrome). This new API allows
  developers to write JavaScript code in a web browser to read/write data over the serial
  port, including to devices like Arduino.

  By Jon E. Froehlich
  @jonfroehlich
  http://makeabilitylab.io

*/
#include <Adafruit_CircuitPlayground.h> // Library ref: https://caternuson.github.io/Adafruit_CircuitPlayground/

const int NUM_NEO_PIXELS = 10;
const int BAUD_RATE = 9600;
const int ANALOG_INPUT_PIN = A1;

void setup() {
  CircuitPlayground.begin();
  Serial.begin(BAUD_RATE);

  // Set colors into a pretty state. This just lets us know that the program is running
  // and we are waiting for serial data
  for (int i = 0; i < NUM_NEO_PIXELS; i++) {
    // color wheel is a hue color wheel from 0 to 255
    int wheelPosition = map(i, 0, NUM_NEO_PIXELS, 0, 255);

    // convert to a 24-bit RGB color val
    // https://caternuson.github.io/Adafruit_CircuitPlayground/colorWheel.html
    int colorWheelVal = CircuitPlayground.colorWheel(wheelPosition);
    CircuitPlayground.setPixelColor(i, colorWheelVal);
  }
}

void loop() {
  // Read the serial data
  if (Serial.available() > 0) {
    String serialInputStr = Serial.readStringUntil('\n');// s1 is String type variable.
    //String serialInputStr = "255, 128, 60";
    
    // Parse the RGB data
    int firstTokenIndex = 0;
    int lastTokenIndex = serialInputStr.indexOf(',');
    String redStr = serialInputStr.substring(firstTokenIndex, lastTokenIndex);
    
    firstTokenIndex = lastTokenIndex + 1;
    lastTokenIndex = serialInputStr.indexOf(',', firstTokenIndex);
    String greenStr = serialInputStr.substring(firstTokenIndex, lastTokenIndex);
    
    firstTokenIndex = lastTokenIndex + 1;
    lastTokenIndex = serialInputStr.indexOf(',', firstTokenIndex);
    String blueStr = serialInputStr.substring(firstTokenIndex, lastTokenIndex);

    // Print it back out for debugging
    Serial.println(serialInputStr);
    Serial.print(redStr);
    Serial.print(", ");
    Serial.print(greenStr);
    Serial.print(", ");
    Serial.println(blueStr);

    // Convert to integers
    int red = redStr.toInt();
    int green = greenStr.toInt();
    int blue = blueStr.toInt();

    // We expect a value between 0 and 255 (just make sure)
    red = constrain(red, 0, 255); // make sure we contrain to 0, 255
    green = constrain(green, 0, 255); // make sure we contrain to 0, 255
    blue = constrain(blue, 0, 255); // make sure we contrain to 0, 255

    // Loop through the first 5 (of 10) neopixels and set them
    // to the value read in from serial input
    for (int i = 0; i < NUM_NEO_PIXELS; i++) {
      CircuitPlayground.setPixelColor(i, red, green, blue);
    }
  }

  // We don't expect the signal to change much, so delay 50-100ms should be fine
  delay(50);
}
