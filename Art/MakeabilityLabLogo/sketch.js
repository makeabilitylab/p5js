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

function setup() {
  createCanvas(800, 600);
  
  angleMode(DEGREES); 

  makeLabLogo = new MakeabilityLabLogo(5*TRIANGLE_SIZE, 4*TRIANGLE_SIZE, TRIANGLE_SIZE);
  makeLabGrid = new Grid(width, height, TRIANGLE_SIZE);
  makeLabGrid.setFillColor(null);
  setColorScheme(ColorScheme.BlackOnWhite);

  defaultColorsOn = true;
  makeLabLogo.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);
}


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
      makeLabLogo.setDefaultColoredTrianglesFillColor(originalColorArray);
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