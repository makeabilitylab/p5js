import { MakeabilityLabLogo, Grid } from '../_library/makelab-logo.js';

const canvas = document.getElementById('myCanvas');
canvas.width = 1000;
canvas.height = 1000;
const ctx = canvas.getContext('2d');

ctx.fillStyle = "rgb(250, 250, 250)"; // Set the fill style to gray
ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the entire canvas with the gray color

const TRIANGLE_SIZE = 100;
let makeLabGrid = new Grid(canvas.width, canvas.height, TRIANGLE_SIZE);
let xLogo = MakeabilityLabLogo.getXCenterPosition(TRIANGLE_SIZE, canvas.width);
let yLogo = MakeabilityLabLogo.getYCenterPosition(TRIANGLE_SIZE, canvas.height);
let makeLabLogo = new MakeabilityLabLogo(xLogo, yLogo, TRIANGLE_SIZE);

draw(ctx);
printMenuToConsole();

function draw(ctx){
  // clear canvas
  ctx.fillStyle = "rgb(250, 250, 250)";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // draw grid and logo
  makeLabGrid.draw(ctx);
  makeLabLogo.draw(ctx);
}

function printMenuToConsole(){
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

  switch (key) {
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