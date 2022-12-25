/**
 * TODO
 * Some ideas:
 *  * all triangles in grid illuminate and fade before ML logo emerges
 *  * blank canvas and triangles rotate and move to final location
 *  * animate between JEF and ML logo
 * 
 * By Professor Jon E. Froehlich
 * https://jonfroehlich.github.io/
 * http://makeabilitylab.cs.washington.edu
 **/



const TRIANGLE_SIZE = 50;

let makeLabLogo = null;
let makeLabLogoAnimated = null;

let makeLabGrid = null;

let colorScheme =  null;
let defaultColorsOn = true;
let transparent = false;
let originalRandomTriLocs = [];

function setup() {
  createCanvas(800, 600);
  
  angleMode(DEGREES); 

  makeLabLogo = new MakeabilityLabLogo(5*TRIANGLE_SIZE, 4*TRIANGLE_SIZE, TRIANGLE_SIZE);
  makeLabLogo.visible = false;

  makeLabLogoAnimated = new MakeabilityLabLogo(5*TRIANGLE_SIZE, 4*TRIANGLE_SIZE, TRIANGLE_SIZE);
  makeLabLogoAnimated.isLOutlineVisible = false;
  makeLabLogoAnimated.isMOutlineVisible = false;
  //makeLabLogoAnimated.setDefaultColoredTrianglesFillColor(originalColorArray);

  for(const tri of makeLabLogoAnimated.getLTriangles()){
    tri.strokeColor = color(0);
    tri.isStrokeVisible = true;
  }

  makeLabGrid = new Grid(width, height, TRIANGLE_SIZE);
  makeLabGrid.setFillColor(null);
  makeLabGrid.visible = false;

  colorScheme = ColorScheme.BlackOnWhite;


  defaultColorsOn = true;
  makeLabLogo.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);

  for(const tri of makeLabLogoAnimated.getAllTriangles(true)){
    tri.x = random(0, width - TRIANGLE_SIZE);
    tri.y = random(0, height - TRIANGLE_SIZE);
    tri.angle = random(0, 360);
    originalRandomTriLocs.push({x: tri.x, y: tri.y, angle: tri.angle});
  }

  setStaticLogoTransparent(true);
}

function touchMoved(){
  mouseMoved();
}

function mouseMoved(){
  const lerpAmt = map(mouseX, 0, width, 0, 1, true);

  let staticTriangles = makeLabLogo.getAllTriangles(true);
  let animatedTriangles = makeLabLogoAnimated.getAllTriangles(true);
  for(let i = 0; i < originalRandomTriLocs.length; i++){
    const endX = staticTriangles[i].x;
    const endY = staticTriangles[i].y;
    const endAngle = 0;

    const startX = originalRandomTriLocs[i].x;
    const startY = originalRandomTriLocs[i].y;
    const startAngle = originalRandomTriLocs[i].angle;

    const newX = lerp(startX, endX, lerpAmt);
    const newY = lerp(startY, endY, lerpAmt);
    const newAngle = lerp(startAngle, endAngle, lerpAmt);

    animatedTriangles[i].x = newX;
    animatedTriangles[i].y = newY;
    animatedTriangles[i].angle = newAngle;
  }

  if(defaultColorsOn){
    const cTriangles = makeLabLogoAnimated.getDefaultColoredTriangles();
    for(let i = 0; i < cTriangles.length; i++){
      const startColor = color(255);
      const endColor = color(ORIGINAL_COLOR_ARRAY[i]);
      const newColor = lerpColor(startColor, endColor, lerpAmt);
      cTriangles[i].fillColor = newColor;
    }
  }else{
    const cTriangles = makeLabLogoAnimated.getDefaultColoredTriangles();
    for(let i = 0; i < cTriangles.length; i++){
      cTriangles[i].fillColor = color(255);
    }
  }
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

  

  if(makeLabLogoAnimated.visible){
    makeLabLogoAnimated.draw();
  }

  if(makeLabLogo.visible){
    makeLabLogo.draw();
  }
  
}

function keyPressed() {
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
    setStaticLogoTransparent(!transparent);
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

function setStaticLogoTransparent(trans){
  transparent = trans;
  for(const tri of makeLabLogo.getAllTriangles(false)){
    tri.isFillVisible = !trans;
  }

  print("Transparent set to: ", trans);
}

function toggleColorScheme(){
  let fillColor = null;
  let strokeColor = null;

  switch(colorScheme){
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

  if(defaultColorsOn){
    makeLabLogo.setDefaultColoredTrianglesFillColor(originalColorArray);
  }

  print("Color scheme set to: ", colorScheme);
}