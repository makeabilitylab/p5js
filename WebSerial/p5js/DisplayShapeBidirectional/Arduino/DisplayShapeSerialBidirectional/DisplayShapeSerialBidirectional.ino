/**
 * TODO
 * 
 * By Jon E. Froehlich
 * @jonfroehlich
 * http://makeabilitylab.io
 * 
 */

// #include <SPI.h> // Comment out when using i2c
#include <Wire.h>
#include <Adafruit_GFX.h>
#include <Adafruit_SSD1306.h>

const int DELAY_MS = 5;

#define SCREEN_WIDTH 128 // OLED display width, in pixels
#define SCREEN_HEIGHT 64 // OLED display height, in pixels

// Declaration for an SSD1306 display connected to I2C (SDA, SCL pins)
#define OLED_RESET     4 // Reset pin # (or -1 if sharing Arduino reset pin)
Adafruit_SSD1306 _display(SCREEN_WIDTH, SCREEN_HEIGHT, &Wire, OLED_RESET);

enum ShapeType {
  CIRCLE,
  SQUARE,
  TRIANGLE,
  NUM_SHAPE_TYPES
};

ShapeType _curShapeType = CIRCLE;

enum DrawMode{
  FILL,
  OUTLINE,
  NUM_DRAW_MODES
};

DrawMode _curDrawMode = FILL;

float _curShapeSizeFraction = -1;

const int MIN_SHAPE_SIZE = 4;
int MAX_SHAPE_SIZE;

const int SHAPE_SELECTION_BUTTON_PIN = 4;
const int SHAPE_DRAWMODE_BUTTON_PIN = 5;

int _lastShapeSelectionButtonVal = HIGH;
int _lastDrawModeButtonVal = HIGH;

void setup() {
  Serial.begin(115200);

  pinMode(SHAPE_SELECTION_BUTTON_PIN, INPUT_PULLUP);
  pinMode(SHAPE_DRAWMODE_BUTTON_PIN, INPUT_PULLUP);

  // SSD1306_SWITCHCAPVCC = generate display voltage from 3.3V internally
  if(!_display.begin(SSD1306_SWITCHCAPVCC, 0x3D)) { // Address 0x3D for 128x64
    Serial.println(F("SSD1306 allocation failed"));
    for(;;); // Don't proceed, loop forever
  }

  MAX_SHAPE_SIZE = min(_display.width(), _display.height());

  _display.clearDisplay();
  _display.setTextSize(1);      // Normal 1:1 pixel scale
  _display.setTextColor(SSD1306_WHITE); // Draw white text
  _display.setCursor(0, 0);     // Start at top-left corner
  _display.print("Waiting to receive\ndata from serial...");
  _display.display();
}

void loop() {
  // Check to see if there is any incoming serial data
  if(Serial.available() > 0){
    // If we're here, then serial data has been received
    // Read data off the serial port until we get to the endline delimeter ('\n')
    // Store all of this data into a string
    String rcvdSerialData = Serial.readStringUntil('\n'); 

    // Parse out the comma separated string
    int startIndex = 0;
    int endIndex = rcvdSerialData.indexOf(',');
    if(endIndex != -1){
      String strShapeType = rcvdSerialData.substring(startIndex, endIndex);
      int shapeType = strShapeType.toInt();
      _curShapeType = (ShapeType)shapeType;

      startIndex = endIndex + 1;
      endIndex = rcvdSerialData.indexOf(',', startIndex);
      String strShapeSize = rcvdSerialData.substring(startIndex, endIndex);
      _curShapeSizeFraction = strShapeSize.toFloat();

      startIndex = endIndex + 1;
      endIndex = rcvdSerialData.length();
      String strDrawMode = rcvdSerialData.substring(startIndex, endIndex);

      int drawMode = strDrawMode.toInt();
      _curDrawMode = (DrawMode)drawMode;
    } 
    
    // Echo the data back on serial (for debugging purposes)
    // This is not necessary but helpful. Then the webpage can
    // display this debug output (if necessary)
    // Prefix debug output with '#' as a convention
    Serial.print("# Arduino Received: '");
    Serial.print(rcvdSerialData);
    Serial.println("'");
  }

  checkButtonPresses();

  // If we've received data from serial, then _curShapeSizeFraction will
  // no longer be -1
  if(_curShapeSizeFraction >= 0){
    drawShape(_curShapeType, _curShapeSizeFraction);
  }
  
  delay(DELAY_MS);
}

void checkButtonPresses(){
  int shapeSelectionButtonVal = digitalRead(SHAPE_SELECTION_BUTTON_PIN);
  int lastShapeType = _curShapeType;
  if(shapeSelectionButtonVal == LOW && shapeSelectionButtonVal != _lastShapeSelectionButtonVal){
    _curShapeType = (ShapeType)((int)_curShapeType + 1);

    if(_curShapeType >= NUM_SHAPE_TYPES){
      _curShapeType = CIRCLE;
    }
  }

  int shapeDrawModeButtonVal = digitalRead(SHAPE_DRAWMODE_BUTTON_PIN);
  int lastDrawMode = _curDrawMode;
  if(shapeDrawModeButtonVal == LOW && shapeDrawModeButtonVal != _lastDrawModeButtonVal){
    _curDrawMode = (DrawMode)((int)_curDrawMode + 1);

    if(_curDrawMode >= NUM_DRAW_MODES){
      _curDrawMode = FILL;
    }
  }

  // Send new shape type and shape draw mode back over serial
  if(lastShapeType != _curShapeType || lastDrawMode != _curDrawMode){
    Serial.print(_curShapeType);
    Serial.print(", ");
    Serial.println(_curDrawMode);
  }

  _lastShapeSelectionButtonVal = shapeSelectionButtonVal;
  _lastDrawModeButtonVal = shapeDrawModeButtonVal;
}

void drawShape(ShapeType shapeType, float fractionSize){
  _display.clearDisplay();

  int shapeSize = MIN_SHAPE_SIZE + fractionSize * (MAX_SHAPE_SIZE - MIN_SHAPE_SIZE);
  int halfShapeSize = shapeSize / 2;
  int xCenter = _display.width() / 2;
  int yCenter = _display.height() / 2; 
  int xLeft =  xCenter - halfShapeSize;
  int yTop =  yCenter - halfShapeSize;
  
  if(shapeType == CIRCLE){
    if(_curDrawMode == FILL){
      _display.fillRoundRect(xLeft, yTop, shapeSize, shapeSize, halfShapeSize, SSD1306_WHITE);
    }else{
      _display.drawRoundRect(xLeft, yTop, shapeSize, shapeSize, halfShapeSize, SSD1306_WHITE);
    }
  }else if(shapeType == SQUARE){
    if(_curDrawMode == FILL){
      _display.fillRect(xLeft, yTop, shapeSize, shapeSize, SSD1306_WHITE);
    }else{
      _display.drawRect(xLeft, yTop, shapeSize, shapeSize, SSD1306_WHITE);
    }
  }else if(shapeType == TRIANGLE){
    int x1 = xCenter - halfShapeSize;
    int y1 = yCenter + halfShapeSize;

    int x2 = xCenter;
    int y2 = yCenter - halfShapeSize;

    int x3 = xCenter + halfShapeSize;
    int y3 = y1;

    if(_curDrawMode == FILL){
      _display.fillTriangle(x1, y1, x2, y2, x3, y3, SSD1306_WHITE);
    }else{
      _display.drawTriangle(x1, y1, x2, y2, x3, y3, SSD1306_WHITE);
    }
  }

  _display.display();
}
