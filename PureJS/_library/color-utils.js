import { lerp } from './math-utils.js';

/**
 * Linearly interpolates between two colors.
 *
 * @param {Object|string} startColor - The starting color. Can be an object with r, g, b, and 
 *  optionally alpha fields, or a string in a valid CSS color format.
 * @param {Object|string} endColor - The ending color. Can be an object with r, g, b, and 
 *  optionally alpha fields, or a string in a valid CSS color format.
 * @param {number} amt - The amount to interpolate between the two colors. Should be a value between 0 and 1.
 * @returns {string} The interpolated color in rgba format.
 */
export function lerpColor(startColor, endColor, amt) {
  // console.log(`lerpColor: startColor: ${startColor}, endColor: ${endColor}, amt: ${amt}`);

  // Ensure both colors are objects with r, g, b, and optionally a properties
  startColor = convertColorStringToObject(startColor);
  endColor = convertColorStringToObject(endColor);

  const r = Math.round(lerp(startColor.r, endColor.r, amt));
  const g = Math.round(lerp(startColor.g, endColor.g, amt));
  const b = Math.round(lerp(startColor.b, endColor.b, amt));
  const a = lerp(startColor.a || 1, endColor.a || 1, amt); // Default to 1 if a property is missing

  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/**
 * Converts a color string (hex, rgb, or rgba) to an object with r, g, b, and optionally a properties.
 * If the input is already an object, it returns the input as is.
 *
 * @param {string|Object} colorStr - The color string or object to convert.
 * @returns {Object} An object with properties r, g, b, and optionally a.
 * @throws {Error} If the color string format is invalid.
 */
export function convertColorStringToObject(colorStr) {
  if (typeof colorStr === 'string') {
    // Handle hexstring, rgb, or rgba string
    const match = colorStr.match(/^#([0-9a-fA-F]{6}|[0-9a-fA-F]{3}|[0-9a-fA-F]{8})$/);
    if (match) {
      // Hexstring
      const hex = match[1];
      if (hex.length === 8) {
        // 8-digit hex string with alpha
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
          a: parseInt(hex.substring(6, 8), 16) / 255
        };
      } else {
        // 6-digit hex string without alpha
        return {
          r: parseInt(hex.substring(0, 2), 16),
          g: parseInt(hex.substring(2, 4), 16),
          b: parseInt(hex.substring(4, 6), 16),
          a: 1 // Default to 1 if alpha is not specified
        };
      }
    } else if (colorStr.startsWith('rgb')) {
      // rgb or rgba string
      const match = colorStr.match(/rgba?\((\d+), (\d+), (\d+)(?:, (\d?\.\d+))?\)/);
      if (match) {
        const [, r, g, b, a] = match;
        return {
          r: parseInt(r),
          g: parseInt(g),
          b: parseInt(b),
          a: a !== undefined ? parseFloat(a) : 1 // Default to 1 if alpha is not specified
        };
      }
    }
    throw new Error(`Invalid color string: ${colorStr}`);
  }

  // If it's already an object, return it
  return colorStr;
}