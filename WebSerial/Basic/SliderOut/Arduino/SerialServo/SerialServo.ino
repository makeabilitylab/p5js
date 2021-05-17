/**
 * This example receives an integer value (as a text string) delimited by a return character '\n',
 * converts the text into an integer, and uses this to control a servo motor on pin 9.
 * 
 * To learn more about servo motors and Arduino in general, see:
 * https://learn.adafruit.com/adafruit-arduino-lesson-14-servo-motors/overview
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

#include <Servo.h> 

const int LED_PIN = 13; // just use LED pin for helping provide feedback about servo value
const int SERVO_PIN = 9;
const int BAUD_RATE = 9600;
const int DELAY_MS = 5; // set to 0 for no delay between loop calls
Servo _servo; 

void setup() {
  Serial.begin(BAUD_RATE);
  _servo.attach(SERVO_PIN);
}

void loop() {
  
  // Check to see if there is any incoming serial data
  if(Serial.available() > 0){
    // If we're here, then serial data has been received
    // Read data off the serial port until we get to the endline delimeter ('\n')
    // Store all of this data into a string
    String rcvdSerialData = Serial.readStringUntil('\n'); 

    // Convert the data into an integer
    int val = rcvdSerialData.toInt();
    val = constrain(val, 0, 255); // make sure we contrain to 0, 255
    analogWrite(LED_PIN, val);
    
    // now map val to servo angle (which is contrained from 0 to 170 degrees)
    int angle = map(val, 0, 255, 0, 170);

    // Set the angle on the servo motor
    _servo.write(angle); 

    // Send some data (for debugging purposes) back on serial
    Serial.print(rcvdSerialData);
    Serial.print(", ");
    Serial.print(val);
    Serial.print(", angle=");
    Serial.println(angle);
  }

  delay(DELAY_MS);
}
