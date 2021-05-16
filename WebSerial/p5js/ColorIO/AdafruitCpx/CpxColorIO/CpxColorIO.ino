/**
  This example receives an integer value (as a text string) delimited by a return character '\n',
  converts the text into an integer, and uses this to set the color of the Circuit Playground
  Express (CPX) built-in NeoPixels.

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
const boolean SERIAL_ECHO = true; // if true, echos data received from serial back out on serial
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
    String s1 = Serial.readStringUntil('\n');// s1 is String type variable.

    if(SERIAL_ECHO){
      // Send data back out on serial port for debugging
      Serial.print("#ECHO: ");
      Serial.println(s1);
    }
    
    int serialInputVal = s1.toInt();

    // We expect a value between 0 and 255 (just make sure)
    serialInputVal = constrain(serialInputVal, 0, 255); // make sure we contrain to 0, 255

    // Convert the val into a RGB color using the colorWheel function
    // See: https://caternuson.github.io/Adafruit_CircuitPlayground/colorWheel.html
    int colorWheelVal = CircuitPlayground.colorWheel(serialInputVal);

    // Loop through the first 5 (of 10) neopixels and set them
    // to the value read in from serial input
    for (int i = 0; i < 5; i++) {
      CircuitPlayground.setPixelColor(i, colorWheelVal);
    }
  }

  // Read the analog input
  int analogVal = analogRead(ANALOG_INPUT_PIN);
  int wheelPosition = map(analogVal, 0, 1023, 0, 255);
  int colorVal24BitRgb = CircuitPlayground.colorWheel(wheelPosition);
  // Loop through the last 5 (of 10) neopixels and set them
  // to the value read in from serial input
  for (int i = 5; i < 10; i++) {
    CircuitPlayground.setPixelColor(i, colorVal24BitRgb);
  }
  Serial.println(colorVal24BitRgb);

  // Send values once per secon
  delay(1000);
}
