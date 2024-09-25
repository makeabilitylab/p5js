/**
 * Converts degrees to radians.
 *
 * @param {number} degrees - The angle in degrees to be converted to radians.
 * @returns {number} The angle in radians.
 */
export function convertToRadians(degrees) {
  return degrees * (Math.PI / 180);
}

/**
 * Converts an angle from radians to degrees.
 *
 * @param {number} radians - The angle in radians to be converted.
 * @returns {number} The angle in degrees.
 */
export function convertToDegrees(radians) {
  return radians * (180 / Math.PI);
}

/**
 * Linearly interpolates between two values.
 *
 * @param {number} start - The starting value.
 * @param {number} end - The ending value.
 * @param {number} amt - The interpolation amount (0-1).
 * @returns {number} The interpolated value.
 */
export function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

/**
 * Generates a random number within a specified range (similar to p5js random)
 * If only one argument is provided, it generates a number between 0 and the argument.
 * If two arguments are provided, it generates a number between the two arguments.
 * 
 * @param {number} min - The minimum value (inclusive) or the maximum value if only one argument is provided.
 * @param {number} [max] - The maximum value (exclusive).
 * @returns {number} A random number within the specified range.
 */
export function random(min, max) {
  if (max === undefined) {
    max = min;
    min = 0;
  }
  return Math.random() * (max - min) + min;
}