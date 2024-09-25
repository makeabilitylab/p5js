import { MakeabilityLabLogo, Grid } from '../_library/makelab-logo.js';

const div = document.querySelector('.container');
const canvas = document.getElementById('myCanvas');
canvas.width = 1000;
canvas.height = 1000;
const ctx = canvas.getContext('2d');

let backgroundColor = "rgb(250, 250, 250)";

ctx.fillStyle = backgroundColor; // Set the fill style to gray
ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with the gray color

let triangleSize = 100;
let makeLabGrid, xLogo, yLogo, makeLabLogo;

// Initial resize
resizeCanvas();
printMenu();

function draw(ctx){
  // clear canvas
  ctx.fillStyle = backgroundColor;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw grid and logo
  makeLabGrid.draw(ctx);
  makeLabLogo.draw(ctx);
}

function printMenu(){
  console.log("Press '+' to increase triangle size. Currently set to: ", triangleSize);
  console.log("Press '-' to decrease triangle size. Currently set to: ", triangleSize);
  console.log("Press 'g' to toggle grid. Currently set to: ", makeLabGrid.visible);
  console.log("Press 'm' to toggle M outline. Currently set to: ", makeLabLogo.isMOutlineVisible);
  console.log("Press 'l' to toggle L outline. Currently set to: ", makeLabLogo.isLOutlineVisible);
  console.log("Press 'k' to toggle L triangle strokes. Currently set to: ", makeLabLogo.areLTriangleStrokesVisible);
  console.log("Press 'h' to toggle Makeability Lab logo. Currently set to: ", makeLabLogo.visible);
  console.log("");
  console.log("Type printMenu() to see this menu again.");
}

document.addEventListener('keydown', function(event) {
  const key = event.key;
  console.log(`keydown: ${key}`);
  switch (key) {
    case '=':
    case "+":
      triangleSize += 5;
      console.log(`triangleSize: ${triangleSize}`);
      recreateGraphicalObjects();
      draw(ctx);
      break;

    case '-':
    case "_":
      triangleSize -= 5;
      if(triangleSize < 5){
        triangleSize = 5;
      }
      console.log(`triangleSize: ${triangleSize}`);
      recreateGraphicalObjects();
      draw(ctx);
      break;

    case 'g':
      makeLabGrid.visible = !makeLabGrid.visible;
      console.log("Grid visibility is set to: ", makeLabGrid.visible);
      draw(ctx);
      break;

    case 'm':
      makeLabLogo.isMOutlineVisible = !makeLabLogo.isMOutlineVisible;
      console.log("M outline visible: ", makeLabLogo.isMOutlineVisible);
      draw(ctx);
      break;

    case 'l':
      makeLabLogo.isLOutlineVisible = !makeLabLogo.isLOutlineVisible;
      console.log("L outline visible: ", makeLabLogo.isLOutlineVisible);
      draw(ctx);
      break;

    case 'k':
      makeLabLogo.areLTriangleStrokesVisible = !makeLabLogo.areLTriangleStrokesVisible;
      console.log("L triangle strokes visible: ", makeLabLogo.areLTriangleStrokesVisible);
      draw(ctx);
      break;

    case 'h':
      makeLabLogo.visible = !makeLabLogo.visible;
      console.log("Makeability Lab logo visible: ", makeLabLogo.visible);
      draw(ctx);
      break;
      
  }
});

function recreateGraphicalObjects(){
  makeLabGrid = new Grid(canvas.width, canvas.height, triangleSize);
  xLogo = MakeabilityLabLogo.getXCenterPosition(triangleSize, canvas.width);
  yLogo = MakeabilityLabLogo.getYCenterPosition(triangleSize, canvas.height);
  makeLabLogo = new MakeabilityLabLogo(xLogo, yLogo, triangleSize);
}

function resizeCanvas() {
  console.log(`resizeCanvas: ${div.clientWidth}, ${div.clientHeight} and prev canvas: ${canvas.width}, ${canvas.height}`);
  canvas.width = div.clientWidth;
  canvas.height = div.clientHeight;
  recreateGraphicalObjects();
  draw(ctx);
}

// Event listener for window resize
window.addEventListener('resize', resizeCanvas);