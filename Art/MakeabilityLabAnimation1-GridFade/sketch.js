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
  makeLabLogo.setStrokeTransparent(true, false);

  MakeabilityLabLogo.setColors(makeLabLogo.getMShadowTriangles(), color(255), color(255));

  makeLabGrid = new Grid(TRIANGLE_SIZE);
  makeLabGrid.visible = true;
  //makeLabGrid.setFillColor(color(255));
  //makeLabGrid.setStrokeColor(color(200, 200, 200, 150));
  colorScheme = ColorScheme.WhiteOnBlack;


  defaultColorsOn = true;
  makeLabLogo.setDefaultColoredTrianglesFillColor(OriginalColorArray);
  makeLabLogo.setFillTransparent(true, false);
  transparent = true;

  // TODO: would be great to slowly show the makelab logo
  setTimeout(() => {
    makeLabLogo.visible = true;
  }, 3000);

  // TODO: would be great to setup an animation to slowly have each inner L lerp to this color
  setTimeout(() => {
    let lTriangles = makeLabLogo.getLTriangles();
    let randomLTri =  lTriangles[Math.floor(Math.random()*lTriangles.length)];
    MakeabilityLabLogo.setColors(lTriangles, randomLTri.fillColor, randomLTri.strokeColor);
  }, 4000)
}

function draw() {
  background(250);

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
    print("Grid visible: ", makeLabGrid.visible);
  }

  if (key == 'm') {
    makeLabLogo.isMOutlineVisible = !makeLabLogo.isMOutlineVisible;
    print("M outline visible: ", makeLabLogo.isMOutlineVisible);
  }

  if (key == 'l') {
    makeLabLogo.isLOutlineVisible = !makeLabLogo.isLOutlineVisible;
    print("L outline visible: ", makeLabLogo.isLOutlineVisible);
  }

  if (key == 'k') {
    makeLabLogo.areLTriangleStrokesVisible = !makeLabLogo.areLTriangleStrokesVisible;
    print("L triangle strokes visible: ", makeLabLogo.areLTriangleStrokesVisible);
  }

  if (key == 'h') {
    makeLabLogo.visible = !makeLabLogo.visible;
    print("Makeability Lab logo visible: ", makeLabLogo.visible);
  }

  if (key == 'b') {
    toggleColorScheme();
  }

  if (key == 't') {
    transparent = !transparent;
    for (const tri of makeLabLogo.getAllTriangles(false)) {
      tri.isFillVisible = !transparent;
      tri.isStrokeVisible = !transparent;
    }
    print("Set transparency (except for M inner fill triangles) to: ", transparent);
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
      MakeabilityLabLogo.setColors(makeLabLogo.getMShadowTriangles(), strokeColor, fillColor);
      break;
    case ColorScheme.WhiteOnBlack:
    default:
      colorScheme = ColorScheme.BlackOnWhite;
      fillColor = color(255);
      strokeColor = color(0);
      makeLabLogo.setColors(fillColor, strokeColor);
      MakeabilityLabLogo.setColors(makeLabLogo.getMShadowTriangles(), strokeColor, fillColor);
      break;
  }

  if (defaultColorsOn) {
    makeLabLogo.setDefaultColoredTrianglesFillColor(OriginalColorArray);
  }
  print("Set color scheme to: ", colorScheme);
}