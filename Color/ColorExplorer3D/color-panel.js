let selectedColor;
let rgbColorPickerPanel;

function setup() {
  createCanvas(500, 100);
  selectedColor = color(0);
  rgbColorPickerPanel = new RgbColorPickerPanel(0, 0, width, height);
}

function draw() {
  background(0);

  if(parent.selectedColor && !parent.areColorLevelsEqual(selectedColor, parent.selectedColor)){
    print("new selected color from parent!", parent.selectedColor);
    let c = color(parent.selectedColor.levels[0],
        parent.selectedColor.levels[1],
        parent.selectedColor.levels[2],
        parent.selectedColor.levels[3]);
    setSelectedColor(c);
  }

  rgbColorPickerPanel.draw();
}

function setSelectedColor(c, callParent = false){
  selectedColor = c;
  rgbColorPickerPanel.setSelectedColor(c);

  if(callParent){
      parent.setSelectedColor(c);
  }
}

function mousePressed(){
  let colorPanelAtMouse = rgbColorPickerPanel.getColorPanelAtCoords(mouseX, mouseY);
  if(colorPanelAtMouse){
    let c = colorPanelAtMouse.getColorForPixel(mouseX, mouseY, true);
    setSelectedColor(c, true);
  }
}

function mouseMoved(){
  let colorPanelAtMouse = rgbColorPickerPanel.getColorPanelAtCoords(mouseX, mouseY);
  if(colorPanelAtMouse){
    let c = colorPanelAtMouse.getColorForPixel(mouseX, mouseY, true);
    //setHoverColor(c);
    rgbColorPickerPanel.setHoverColor(c);
  }
}