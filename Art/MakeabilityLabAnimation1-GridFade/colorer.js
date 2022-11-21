const ColorScheme = {
  WhiteOnBlack: 'WhiteOnBlack',
  BlackOnWhite: 'BlackOnWhite',
};

const OriginalColorPaletteRGB = {
  Blue: [135, 202, 228],
  BlueGray: [147, 169, 207],
  Purple: [171, 147, 197],
  Green: [148, 206, 146],
  Orange: [235, 185, 130],
  RedPurple: [207, 145, 166],
  Pink: [237, 162, 163],
  YellowGreen: [239, 226, 127],
  LightGreen: [209, 226, 133],
  BlueGreen: [147, 211, 202]
}

const OriginalColorArray = [
  OriginalColorPaletteRGB.Blue, 
  OriginalColorPaletteRGB.BlueGray,
  OriginalColorPaletteRGB.YellowGreen,
  OriginalColorPaletteRGB.Purple,
  OriginalColorPaletteRGB.Green,
  OriginalColorPaletteRGB.Orange,
  OriginalColorPaletteRGB.YellowGreen,
  OriginalColorPaletteRGB.LightGreen,
  OriginalColorPaletteRGB.Orange,
  OriginalColorPaletteRGB.RedPurple,
  OriginalColorPaletteRGB.BlueGreen,
  OriginalColorPaletteRGB.Pink
];


class Colorer{

  static getRandomOriginalColor(){
    return color(Colorer.getRandomColorFromPalette(OriginalColorPaletteRGB));
  }

  static getRandomColorFromPalette(palette){
    if(!palette){
      palette = OriginalColorPaletteRGB;
    }

    const keys = Object.keys(palette);
    const randKey = keys[Math.floor(Math.random() * keys.length)];
    return color(palette[randKey]);
  }
}