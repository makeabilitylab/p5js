/**
 * An interactive holiday greeting card from the Makeability Lab
 * 
 * Future ideas:
 *  - Have snow falling (and possibly accumulating on bottom)
 *  - Have scenery in background like trees/mountains
 *  - Have triangles also rotate into place
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
let originalSantaTriangles = null;

function setup() {
  createCanvas(800, 650);
  
  angleMode(DEGREES); 

  triangleSantaAnimated = new TriangleSanta(3*TRIANGLE_SIZE, 2 * TRIANGLE_SIZE, TRIANGLE_SIZE);
  originalSantaTriangles = triangleSantaAnimated.getAllTriangles();
  //triangleSanta.setStrokeColors(color(128, 128, 128));
  
  makeLabLogoStatic = new MakeabilityLabLogo(5*TRIANGLE_SIZE, 4*TRIANGLE_SIZE, TRIANGLE_SIZE);
  
  makeLabGrid = new Grid(width, height, TRIANGLE_SIZE);
  makeLabGrid.setFillColor(null);
  setColorScheme(ColorScheme.BlackOnWhite);
  makeLabGrid.visible = false;

  defaultColorsOn = true;
  
  makeLabLogoStatic.setDefaultColoredTrianglesFillColor(ORIGINAL_COLOR_ARRAY);
  makeLabLogoStatic.visible = false;

  createTriangleAnimationMapping();
}

function getMapOfTriangleDirectionToTriangles(triangles){
  let mapDirToTriangles = new Map();
  for(let i = 0; i <  triangles.length; i++){
    const tri = triangles[i];
    if(!mapDirToTriangles.has(tri.direction)){
      mapDirToTriangles.set(tri.direction, new Array());
    }
    let trianglesWithThisDir = mapDirToTriangles.get(tri.direction);
    trianglesWithThisDir.push(tri);
  }
  return mapDirToTriangles;
}

function createTriangleAnimationMapping(){
  let allSantaTrianglesAnimated = triangleSantaAnimated.getAllTriangles();
  let allMakeLabTriangles = makeLabLogoStatic.getAllTriangles();
  const allVisibleMakeLabTriangles = allMakeLabTriangles.filter(tri => tri.visible);

  let mapDirToSantaTris = getMapOfTriangleDirectionToTriangles(allSantaTrianglesAnimated);
  let mapDirToMakeLabTris = getMapOfTriangleDirectionToTriangles(allVisibleMakeLabTriangles);

  for (let [triDir, santaTriangles] of mapDirToSantaTris) {
    let makeLabTriangles = mapDirToMakeLabTris.get(triDir);
    ArrayUtils.shuffle(santaTriangles);
    ArrayUtils.shuffle(makeLabTriangles);
    for(let santaTriIndex = 0; santaTriIndex <  santaTriangles.length; santaTriIndex++){
      let santaTriangle = santaTriangles[santaTriIndex];
      santaTriangle.original = Triangle.createTriangle(santaTriangle);
  
      let makeLabTriIndex = santaTriIndex % makeLabTriangles.length;
      santaTriangle.destination = makeLabTriangles[makeLabTriIndex];
      santaTriangle.destination.fillColor = color(santaTriangle.destination.fillColor);
      santaTriangle.destination.strokeColor = color(santaTriangle.destination.strokeColor);
    }
  }
}

function mouseMoved(){
  const lerpAmt = map(mouseX, 0, width, 0, 1, true);

  let allSantaTrianglesAnimated = originalSantaTriangles;
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

  // Draw holiday message
  push();
  const lerpAmt = map(mouseX, 0, width, 0, 1, true);
  textSize(25);
  const startTextColor = color(128);
  const endTextcolor = color(0);
  const holidayMsg = "Happy holidays from the Makeability Lab!";
  const msgWidth = textWidth(holidayMsg);

  let textColor = lerpColor(startTextColor, endTextcolor, lerpAmt);
  fill(textColor);
  noStroke();
  text(holidayMsg, width / 2 - msgWidth / 2, 50);
  pop();
}

function keyPressed() {

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