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
}

void loop() {
  if(Serial.available() > 0){
    String s1 = Serial.readStringUntil('\n');// s1 is String type variable.
    Serial.println(s1);//display same received Data back in serial monitor.
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
