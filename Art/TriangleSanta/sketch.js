/**
 * TODO
 * Some ideas:
 *  * all triangles in grid illuminate and fade before ML logo emerges
 *  * blank canvas and triangles rotate and move to final location
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/



const TRIANGLE_SIZE = 50;

let makeLabLogo = null;
let makeLabGrid = null;
let colorScheme =  null;
let defaultColorsOn = true;
let transparent = false;
let angleOverlays = false;
let triangleSanta = null;

// Build the triangle Santa plus the (hidden) Makeability Lab logo and grid that
// can be toggled on via the keyboard. Simpler sibling of SantaToMakeabilityLab,
// which morphs the two shapes together.
function setup() {
  createCanvas(800, 650);
  // Accessibility: text description of the canvas for screen readers
  // https://p5js.org/reference/p5/describe/
  describe("A Santa figure built from colored triangles, with keyboard toggles to also show the Makeability Lab logo, a triangle grid, and outlines.");

  angleMode(DEGREES);

  triangleSanta = new TriangleSanta(3*TRIANGLE_SIZE, 2 * TRIANGLE_SIZE, TRIANGLE_SIZE);
  //triangleSanta.setStrokeColors(color(128, 128, 128));
  makeLabLogo = new MakeabilityLabLogo(5*TRIANGLE_SIZE, 4*TRIANGLE_SIZE, TRIANGLE_SIZE);
  makeLabGrid = new Grid(width, height, TRIANGLE_SIZE);
  makeLabGrid.setFillColor(null);
  setColorScheme(ColorScheme.BlackOnWhite);

  defaultColorsOn = true;
  makeLabLogo.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);
  makeLabLogo.visible = false;
}


// Each frame: paint the background for the current scheme, then draw whichever
// layers are toggled on (grid, Santa, logo, and optional angle overlays).
function draw() {

  switch(colorScheme){
    case ColorScheme.BlackOnWhite:
      background(250);
      break;
    case ColorScheme.WhiteOnBlack:
      background(10);
      break;
  } 

  // makeLabGrid[0][0].draw();
  // makeLabGrid[0][1].draw();

  if(makeLabGrid.visible){
    makeLabGrid.draw();
  }

  if(triangleSanta.visible){
    triangleSanta.draw();
  }

  if(makeLabLogo.visible){
    makeLabLogo.draw();
  }

  if(angleOverlays){
    if(makeLabLogo.isLOutlineVisible){
      for(const lLineSegment of makeLabLogo.getLOutlineLineSegments()){
        lLineSegment.draw();
      }
    }

    for(const mLineSegment of makeLabLogo.getMOutlineLineSegments()){
      mLineSegment.draw();
    }
  }
}

// Keyboard toggles for showing layers: a=angle overlays, g=grid, m/l=M&L
// outlines, k=L strokes, h=logo, b=color scheme, t=transparency, c=default colors.
function keyPressed() {
  if(key == 'a'){
    angleOverlays = !angleOverlays;
    print("Angle overlays set to: ", angleOverlays);
  }

  if(key == 'g'){
    makeLabGrid.visible = !makeLabGrid.visible;
    print("Grid visibility is set to: ", makeLabGrid.visible);
  }

  if(key == 'm'){
    makeLabLogo.isMOutlineVisible = !makeLabLogo.isMOutlineVisible;
    print("M outline visible: ", makeLabLogo.isMOutlineVisible);
  }

  if(key == 'l'){
    makeLabLogo.isLOutlineVisible = !makeLabLogo.isLOutlineVisible;
    print("L outline visible: ", makeLabLogo.isLOutlineVisible);
  }

  if(key == 'k'){
    makeLabLogo.areLTriangleStrokesVisible = !makeLabLogo.areLTriangleStrokesVisible;
    print("L triangle strokes visible: ", makeLabLogo.areLTriangleStrokesVisible);
  }

  if(key == 'h'){
    makeLabLogo.visible = !makeLabLogo.visible;
    print("Makeability Lab logo visible: ", makeLabLogo.visible);
  }

  if(key == 'b'){
    toggleColorScheme();
  }

  if(key == 't'){
    transparent = !transparent;
    for(const tri of makeLabLogo.getAllTriangles(false)){
      tri.isFillVisible = !transparent;
    }

    print("Transparent set to: ", transparent);
  }

  if(key == 'c'){
    defaultColorsOn = !defaultColorsOn;
    if(defaultColorsOn){
      makeLabLogo.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);
    }else{
      switch(colorScheme){
        case ColorScheme.BlackOnWhite:
          makeLabLogo.setDefaultColoredTrianglesFillColor(color(255));
          break;
        case ColorScheme.WhiteOnBlack:
        default:
          makeLabLogo.setDefaultColoredTrianglesFillColor(color(0));
          break;
      } 
    }
    print("Default colors on: ", defaultColorsOn);
  }
}

// Apply a color scheme to the logo: set its triangle fill/stroke and outline
// colors, then restore the default-colored triangles if that mode is on.
function setColorScheme(cScheme){
  colorScheme = cScheme;
  let fillColor = null;
  let strokeColor = null;

  switch(colorScheme){
    case ColorScheme.BlackOnWhite:
      fillColor = color(255);
      strokeColor = color(0);
      makeLabLogo.setColors(fillColor, strokeColor);
      break;
    case ColorScheme.WhiteOnBlack:
    default:
      fillColor = color(0);
      strokeColor = color(255);
      makeLabLogo.setColors(fillColor, strokeColor);
      break;
  } 

  makeLabLogo.mOutlineColor = strokeColor;
  makeLabLogo.lOutlineColor = strokeColor;

  if(defaultColorsOn){
    makeLabLogo.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);
  }

  print("Color scheme set to: ", colorScheme);
}

// Flip between the two color schemes (black-on-white and white-on-black).
function toggleColorScheme(){

  switch(colorScheme){
    case ColorScheme.BlackOnWhite:
      setColorScheme(ColorScheme.WhiteOnBlack);
      break;
    case ColorScheme.WhiteOnBlack:
    default:
      setColorScheme(ColorScheme.BlackOnWhite);
      break;
  } 
}