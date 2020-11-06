// An example of reading analog values sent via Arduino's Keyboard.println()
// The values are sent in a comma separated value (CSV) format
// 
// This sketch is intended to work with the Arduino program entitled 'AnalogKeyboardPrint.ino'
// found here: https://github.com/jonfroehlich/arduino/blob/master/GameController/AnalogKeyboardPrint/AnalogKeyboardPrint.ino
//
// By Jon Froehlich
// @jonfroehlich
// http://makeabilitylab.io
// 

let csvString = "";
let values;

function setup() {
  createCanvas(800, 400);
}

function draw() {
  background(230);

  if (values) {
    let maxCircleSize = min(height, width);
    let xCircle1 = width * 0.33;
    let y = height / 2;

    let circle1Size = map(values[0], 0, 1023, 0, maxCircleSize);
    fill(200, 0, 0, 150);
    circle(xCircle1, y, circle1Size);
    drawValue(values[0], xCircle1, y);



    let xCircle2 = width * 0.66;
    let circle2Size = map(values[1], 0, 1023, 0, maxCircleSize);
    fill(0, 0, 200, 150);
    circle(xCircle2, y, circle2Size);
    drawValue(values[1], xCircle2, y);
  } else {
    let noInputStr = "No input received yet!";
    textSize(50);
    let strX = width / 2 - textWidth(noInputStr) / 2;
    let strY = height / 2 + 20;
    noStroke();
    textStyle(BOLD);
    fill(128, 128, 128, 128);
    text(noInputStr, strX, strY);
  }
}

function drawValue(val, xCircle, yCircle) {
  let lblSize = 20;
  textSize(lblSize);
  fill(15);
  let circleLbl = "" + val;
  let xCircleLbl = xCircle - textWidth(circleLbl) / 2;
  let yCircleLbl = yCircle + lblSize / 2;
  text(circleLbl, xCircleLbl, yCircleLbl);
}


function keyPressed() {
  print(key);

  if (keyCode == ENTER) {

    let rowsOfData = CSVToArray(csvString);
    if (rowsOfData.length > 0) {
      values = rowsOfData[0];
    }

    csvString = "";
  } else {
    csvString += key;
  }

}

// This CSVToArray code from : https://stackoverflow.com/a/1293163
//
// ref: http://stackoverflow.com/a/1293163/2343
// This will parse a delimited string into an array of
// arrays. The default delimiter is the comma, but this
// can be overriden in the second argument.
function CSVToArray(strData, strDelimiter) {
  // Check to see if the delimiter is defined. If not,
  // then default to comma.
  strDelimiter = (strDelimiter || ",");

  // Create a regular expression to parse the CSV values.
  var objPattern = new RegExp(
    (
      // Delimiters.
      "(\\" + strDelimiter + "|\\r?\\n|\\r|^)" +

      // Quoted fields.
      "(?:\"([^\"]*(?:\"\"[^\"]*)*)\"|" +

      // Standard fields.
      "([^\\" + strDelimiter + "\\r\\n]*))"
    ),
    "gi"
  );


  // Create an array to hold our data. Give the array
  // a default empty first row.
  var arrData = [
    []
  ];

  // Create an array to hold our individual pattern
  // matching groups.
  var arrMatches = null;


  // Keep looping over the regular expression matches
  // until we can no longer find a match.
  while (arrMatches = objPattern.exec(strData)) {

    // Get the delimiter that was found.
    var strMatchedDelimiter = arrMatches[1];

    // Check to see if the given delimiter has a length
    // (is not the start of string) and if it matches
    // field delimiter. If id does not, then we know
    // that this delimiter is a row delimiter.
    if (
      strMatchedDelimiter.length &&
      strMatchedDelimiter !== strDelimiter
    ) {

      // Since we have reached a new row of data,
      // add an empty row to our data array.
      arrData.push([]);

    }

    var strMatchedValue;

    // Now that we have our delimiter out of the way,
    // let's check to see which kind of value we
    // captured (quoted or unquoted).
    if (arrMatches[2]) {

      // We found a quoted value. When we capture
      // this value, unescape any double quotes.
      strMatchedValue = arrMatches[2].replace(
        new RegExp("\"\"", "g"),
        "\""
      );

    } else {

      // We found a non-quoted value.
      strMatchedValue = arrMatches[3];

    }


    // Now that we have our value string, let's add
    // it to the data array.
    arrData[arrData.length - 1].push(strMatchedValue);
  }

  // Return the parsed data.
  return (arrData);
}