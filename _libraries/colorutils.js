// A collection of color utility functions. Most are based from code I've found on the web, including:
//  - https://stackoverflow.com/a/17243070
//  - https://stackoverflow.com/a/5624139
//
// By Jon E. Froehlich
// http://makeabilitylab.io/
//

class ColorUtils {
  /**
   * Converts a HSV (hue, saturation, value) (also known as HSB for hue,
   * saturation, brightness) to RGB (red, green, blue). The HSV values
   * are 0 to 1 and the return values are 0 - 255
   * 
   * @param {Number} h Hue value between 0 and 1
   * @param {Number} s Saturation value between 0 and 1
   * @param {Number} v Value value between 0 and 1
   */
  static hsvToRgb(h, s, v, returnRounded = true) {
    var r, g, b, i, f, p, q, t;
    if (arguments.length === 1) {
      s = h.s, v = h.v, h = h.h;
    }
    i = Math.floor(h * 6);
    f = h * 6 - i;
    p = v * (1 - s);
    q = v * (1 - f * s);
    t = v * (1 - (1 - f) * s);
    switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
    }

    if (returnRounded) {
      return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255)
      };
    } else {
      return {
        r: r * 255,
        g: g * 255,
        b: b * 255
      };
    }
  }

  /**
   * Converts RGB (red, green, blue) to HSV (hue, saturation, value)
   * 
   * @param {Number} r Red value between 0 and 255 (inclusive)
   * @param {Number} g Green value between 0 and 255 (inclusive)
   * @param {Number} b Blue value between 0 and 255 (inclusive)
   */
  static rgbToHsv(r, g, b) {
    if (arguments.length === 1) {
      g = r.g, b = r.b, r = r.r;
    }
    var max = Math.max(r, g, b), min = Math.min(r, g, b),
      d = max - min,
      h,
      s = (max === 0 ? 0 : d / max),
      v = max / 255;

    switch (max) {
      case min: h = 0; break;
      case r: h = (g - b) + d * (g < b ? 6 : 0); h /= 6 * d; break;
      case g: h = (b - r) + d * 2; h /= 6 * d; break;
      case b: h = (r - g) + d * 4; h /= 6 * d; break;
    }

    return {
      h: h,
      s: s,
      v: v
    };
  }

  // from: https://stackoverflow.com/a/5624139
  static hexStringToRgb(hex) {
    // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
    var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
    hex = hex.replace(shorthandRegex, function(m, r, g, b) {
      return r + r + g + g + b + b;
    });
  
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : null;
  }

  /**
   * Converts a 24- or 32-bit RGB (or RGBA) number to individual 8-bit components
   * 
   * @param {Number} c a 24-bit or 32-bit RGB number
   */
  static rgbToRgb(c){
    if(c > 0xFFFFFF){
      let r = c >> 24 & 0xFF;
      let g = c >> 16 & 0xFF;
      let b = c >> 8 & 0xFF;
      let a = c & 0xFF;

      return {
        r: r,
        g: g,
        b: b,
        a: a
      };
    }else{
      let r = c >> 16 & 0xFF;
      let g = c >> 8 & 0xFF;
      let b = c & 0xFF;

      return {
        r: r,
        g: g,
        b: b,
      };
    }
  }

  /**
   * 
   * @param {*} c can be a p5.Color, an object with r, g, b, or a 24-bit RGB value
   * @param {*} includeAlpha 
   */
  static rgbToHexString(c, includeAlpha = true) {
    // code from https://stackoverflow.com/a/24390910
    let hex = null;
    if ('levels' in c) {
      hex = [0, 1, 2].map(
        function (idx) { return ColorUtils.byteToHex(c.levels[idx]); }
      ).join('');

      if (includeAlpha) {
        hex += ColorUtils.byteToHex(c.levels[3]);
      }
    } else if ('r' in c && 'g' in c && 'b' in c) {
      hex = ColorUtils.byteToHex(c.r) + ColorUtils.byteToHex(c.g) + ColorUtils.byteToHex(c.b);

      if (includeAlpha) {
        if ('a' in c) {
          hex += ColorUtils.byteToHex(ColorUtils.byteToHex(c.a));
        }else{
          hex += "00";
        }
      }
    } else if(typeof c === 'number'){
      hex = c.toString(16);
    }

    return "#" + hex;
    //return "#" + hex(red(c), 2) + hex(green(c), 2) + hex(blue(c), 2);
  }

  static byteToHex(num) {
    // Turns a number (0-255) into a 2-character hex number (00-ff)
    return ('0' + num.toString(16)).slice(-2);
  }

}