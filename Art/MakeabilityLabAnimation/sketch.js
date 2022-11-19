/**
 * TODO
 * Some ideas:
 *  * all triangles in grid illuminate at slightly different times and fade before ML logo emerges
 *  * blank canvas and triangles rotate and move to final location
 * 
 * See:
 *  - https://sighack.com/post/easing-functions-in-processing
 *  - https://www.youtube.com/watch?v=1lW-NLel1G8&list=PLsGCUnpinsDnejs6Jx8cF2qauZaj3JMxu&index=8&t=8s
 *  - https://stackoverflow.com/a/38498793
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/



const TRIANGLE_SIZE = 50;

let makeLabLogo = null;
let makeLabGrid = null;
let colorScheme = null;
let defaultColorsOn = true;
let transparent = false;

function setup() {
  createCanvas(800, 600);

  angleMode(DEGREES);

  makeLabLogo = new MakeabilityLabLogo(5 * TRIANGLE_SIZE, 4 * TRIANGLE_SIZE, TRIANGLE_SIZE);
  makeLabLogo.visible = false;
  makeLabGrid = new Grid(TRIANGLE_SIZE);
  //makeLabGrid.setFillColor(color(255));
  //makeLabGrid.setStrokeColor(color(200, 200, 200, 150));
  colorScheme = ColorScheme.BlackOnWhite;


  defaultColorsOn = true;
  makeLabLogo.setDefaultColoredTrianglesFillColor(OriginalColorArray);

  // for (let row = 0; row < makeLabGrid.gridArray.length; row++) {
  //   for (let col = 0; col < makeLabGrid.gridArray[row].length; col++) {
  //     makeLabGrid.gridArray[row][col].tri1.fillColor = Colorer.getRandomOriginalColor();
  //     makeLabGrid.gridArray[row][col].tri2.fillColor = Colorer.getRandomOriginalColor();
  //   }
  // }
}


function draw() {

  switch (colorScheme) {
    case ColorScheme.BlackOnWhite:
      background(250);
      break;
    case ColorScheme.WhiteOnBlack:
      background(10);
      break;
  }

  // makeLabGrid[0][0].draw();
  // makeLabGrid[0][1].draw();

  if (makeLabGrid.visible) {
    makeLabGrid.draw();
  }

  if (makeLabLogo.visible) {
    makeLabLogo.draw();
  }

}

function keyPressed() {
  if (key == 'g') {
    makeLabGrid.visible = !makeLabGrid.visible;
  }

  if (key == 'm') {
    makeLabLogo.isMOutlineVisible = !makeLabLogo.isMOutlineVisible;
  }

  if (key == 'l') {
    makeLabLogo.isLOutlineVisible = !makeLabLogo.isLOutlineVisible;
  }

  if (key == 'k') {
    makeLabLogo.areLTriangleStrokesVisible = !makeLabLogo.areLTriangleStrokesVisible;
  }

  if (key == 'h') {
    makeLabLogo.visible = !makeLabLogo.visible;
  }

  if (key == 'b') {
    toggleColorScheme();
  }

  if (key == 't') {
    transparent = !transparent;
    for (const tri of makeLabLogo.getAllTriangles(false)) {
      tri.isFillVisible = !transparent;
    }

    // for(const tri of makeLabLogo.getLTriangles()){
    //   tri.isStrokeVisible = !transparent; 
    // }
  }

  if (key == 'c') {
    defaultColorsOn = !defaultColorsOn;
    if (defaultColorsOn) {
      makeLabLogo.setDefaultColoredTrianglesFillColor(OriginalColorArray);
    } else {
      switch (colorScheme) {
        case ColorScheme.BlackOnWhite:
          makeLabLogo.setDefaultColoredTrianglesFillColor(color(255));
          break;
        case ColorScheme.WhiteOnBlack:
        default:
          makeLabLogo.setDefaultColoredTrianglesFillColor(color(0));
          break;
      }
    }
  }
}

function toggleColorScheme() {
  let fillColor = null;
  let strokeColor = null;

  switch (colorScheme) {
    case ColorScheme.BlackOnWhite:
      colorScheme = ColorScheme.WhiteOnBlack;
      fillColor = color(0);
      strokeColor = color(255);
      makeLabLogo.setColors(fillColor, strokeColor);

      break;
    case ColorScheme.WhiteOnBlack:
    default:
      colorScheme = ColorScheme.BlackOnWhite;
      fillColor = color(255);
      strokeColor = color(0);
      makeLabLogo.setColors(fillColor, strokeColor);
      break;
  }

  if (defaultColorsOn) {
    makeLabLogo.setDefaultColoredTrianglesFillColor(OriginalColorArray);
  }
}