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

let makeLabLogoStatic = null;
let makeLabGrid = null;
let colorScheme =  null;
let defaultColorsOn = true;
let transparent = false;
let angleOverlays = false;
let triangleSantaAnimated = null;

function setup() {
  createCanvas(800, 650);
  
  angleMode(DEGREES); 

  triangleSantaAnimated = new TriangleSanta(3*TRIANGLE_SIZE, 2 * TRIANGLE_SIZE, TRIANGLE_SIZE);
  //triangleSanta.setStrokeColors(color(128, 128, 128));
  
  makeLabLogoStatic = new MakeabilityLabLogo(5*TRIANGLE_SIZE, 4*TRIANGLE_SIZE, TRIANGLE_SIZE);
  
  makeLabGrid = new Grid(width, height, TRIANGLE_SIZE);
  makeLabGrid.setFillColor(null);
  setColorScheme(ColorScheme.BlackOnWhite);

  defaultColorsOn = true;
  
  makeLabLogoStatic.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);
  makeLabLogoStatic.visible = false;

  let allSantaTrianglesAnimated = triangleSantaAnimated.getAllTriangles();
  let allMakeLabTriangles = makeLabLogoStatic.getAllTriangles();

  ArrayUtils.shuffle(allSantaTrianglesAnimated);
  ArrayUtils.shuffle(allMakeLabTriangles);

  // TODO: update this so that you get all triangles of a certain orientation
  for(let santaTriIndex = 0; santaTriIndex <  allSantaTrianglesAnimated.length; santaTriIndex++){
    let tri = allSantaTrianglesAnimated[santaTriIndex];
    tri.original = Triangle.createTriangle(tri);

    let makeLabTriIndex = santaTriIndex % allMakeLabTriangles.length;
    tri.destination = allMakeLabTriangles[makeLabTriIndex];
    tri.destination.fillColor = color(tri.destination.fillColor);
    tri.destination.strokeColor = color(tri.destination.strokeColor);
  }

  // print("Num triangles visible in Santa " + triangleSantaAnimated.getAllTriangles(true).length);
  // print("Num all triangles in Santa " + triangleSantaAnimated.getAllTriangles(false).length);
}

function mouseMoved(){
  const lerpAmt = map(mouseX, 0, width, 0, 1, true);

  let allSantaTrianglesAnimated = triangleSantaAnimated.getAllTriangles();
  for(let i = 0; i < allSantaTrianglesAnimated.length; i++){

    const newX = lerp(allSantaTrianglesAnimated[i].original.x,
      allSantaTrianglesAnimated[i].destination.x,
      lerpAmt);

    const newY = lerp(allSantaTrianglesAnimated[i].original.y,
      allSantaTrianglesAnimated[i].destination.y,
      lerpAmt);

    let newFillColor = lerpColor(allSantaTrianglesAnimated[i].original.fillColor,
      allSantaTrianglesAnimated[i].destination.fillColor,
      lerpAmt);

    let newStrokeColor = lerpColor(allSantaTrianglesAnimated[i].original.strokeColor,
      allSantaTrianglesAnimated[i].destination.strokeColor,
      lerpAmt);
    
    const newAngle = 0;

    allSantaTrianglesAnimated[i].x = newX;
    allSantaTrianglesAnimated[i].y = newY;
    allSantaTrianglesAnimated[i].angle = newAngle;
    allSantaTrianglesAnimated[i].fillColor = newFillColor;
    allSantaTrianglesAnimated[i].strokeColor = newStrokeColor;
  }

  // if(defaultColorsOn){
  //   const cTriangles = makeLabLogoAnimated.getDefaultColoredTriangles();
  //   for(let i = 0; i < cTriangles.length; i++){
  //     const startColor = color(255);
  //     const endColor = color(ORIGINAL_COLOR_ARRAY[i]);
  //     const newColor = lerpColor(startColor, endColor, lerpAmt);
  //     cTriangles[i].fillColor = newColor;
  //   }
  // }else{
  //   const cTriangles = makeLabLogoAnimated.getDefaultColoredTriangles();
  //   for(let i = 0; i < cTriangles.length; i++){
  //     cTriangles[i].fillColor = color(255);
  //   }
  // }
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

  if(triangleSantaAnimated.visible){
    triangleSantaAnimated.draw();
  }

  if(makeLabLogoStatic.visible){
    makeLabLogoStatic.draw();
  }

  if(angleOverlays){
    if(makeLabLogoStatic.isLOutlineVisible){
      for(const lLineSegment of makeLabLogoStatic.getLOutlineLineSegments()){
        lLineSegment.draw();
      }
    }

    for(const mLineSegment of makeLabLogoStatic.getMOutlineLineSegments()){
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
    makeLabLogoStatic.isMOutlineVisible = !makeLabLogoStatic.isMOutlineVisible;
    print("M outline visible: ", makeLabLogoStatic.isMOutlineVisible);
  }

  if(key == 'l'){
    makeLabLogoStatic.isLOutlineVisible = !makeLabLogoStatic.isLOutlineVisible;
    print("L outline visible: ", makeLabLogoStatic.isLOutlineVisible);
  }

  if(key == 'k'){
    makeLabLogoStatic.areLTriangleStrokesVisible = !makeLabLogoStatic.areLTriangleStrokesVisible;
    print("L triangle strokes visible: ", makeLabLogoStatic.areLTriangleStrokesVisible);
  }

  if(key == 'h'){
    makeLabLogoStatic.visible = !makeLabLogoStatic.visible;
    print("Makeability Lab logo visible: ", makeLabLogoStatic.visible);
  }

  if(key == 'b'){
    toggleColorScheme();
  }

  if(key == 't'){
    transparent = !transparent;
    for(const tri of makeLabLogoStatic.getAllTriangles(false)){
      tri.isFillVisible = !transparent;
    }

    print("Transparent set to: ", transparent);
  }

  if(key == 'c'){
    defaultColorsOn = !defaultColorsOn;
    if(defaultColorsOn){
      makeLabLogoStatic.setDefaultColoredTrianglesFillColor(originalColorArray);
    }else{
      switch(colorScheme){
        case ColorScheme.BlackOnWhite:
          makeLabLogoStatic.setDefaultColoredTrianglesFillColor(color(255));
          break;
        case ColorScheme.WhiteOnBlack:
        default:
          makeLabLogoStatic.setDefaultColoredTrianglesFillColor(color(0));
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
      makeLabLogoStatic.setColors(fillColor, strokeColor);
      break;
    case ColorScheme.WhiteOnBlack:
    default:
      fillColor = color(0);
      strokeColor = color(255);
      makeLabLogoStatic.setColors(fillColor, strokeColor);
      break;
  } 

  makeLabLogoStatic.mOutlineColor = strokeColor;
  makeLabLogoStatic.lOutlineColor = strokeColor;

  if(defaultColorsOn){
    makeLabLogoStatic.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);
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