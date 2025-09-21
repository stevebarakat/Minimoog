
/**
 * Calculate a gradual modulation curve for the ModWheel
 * Uses a power function to make small values more subtle and large values more pronounced
 * @param modWheelValue - Current ModWheel value (0-100)
 * @param maxValue - Maximum value when ModWheel is at 100
 * @param power - Power curve exponent (default 1.5 for gradual curve)
 * @returns The modulated value with gradual curve applied
 */
export function calculateGradualModulation(
  modWheelValue: number,
  maxValue: number,
  power: number = 1.5
): number {
  const normalizedModWheel = modWheelValue / 100;
  const powerCurve = Math.pow(normalizedModWheel, power);
  return powerCurve * maxValue;
}

