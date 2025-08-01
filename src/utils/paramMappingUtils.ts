// Parameter mapping and MIDI conversion utilities
import { FILTER_MAPPING, SYNTH_PARAMS } from "@/config";

/**
 * Map knob value (0-10) to envelope time (0.02s to 15s) logarithmically.
 * @param value - Knob value (0-10)
 * @returns Envelope time in seconds
 */
export function mapEnvelopeTime(value: number): number {
  const minTime = 0.02; // 20ms
  const maxTime = 15; // 15s
  const mapped = minTime * Math.pow(maxTime / minTime, value / 10);
  return mapped;
}

/**
 * Map -4 to 4 to 20 Hz - 12,000 Hz logarithmically for filter cutoff.
 * @param val - Value in range -4 to 4
 * @returns Frequency in Hz
 */
export function mapCutoff(val: number): number {
  const minFreq = FILTER_MAPPING.CUTOFF.MIN_FREQ;
  // Clamp to 3,000 Hz for extra safety
  const maxFreq = 3000;
  const clampedVal = Math.max(
    SYNTH_PARAMS.FILTER.CUTOFF.MIN,
    Math.min(SYNTH_PARAMS.FILTER.CUTOFF.MAX, val)
  );
  const normalizedVal = (clampedVal + 4) / 8;
  const musicalCurve = Math.pow(
    normalizedVal,
    FILTER_MAPPING.CUTOFF.MUSICAL_CURVE_POWER
  );
  let result = minFreq * Math.pow(maxFreq / minFreq, musicalCurve);
  result = Math.max(minFreq, Math.min(maxFreq, result));
  return result;
}

/**
 * Map 0-10 to a modulation amount (octaves above base cutoff).
 * @param val - Value in range 0-10
 * @returns Octaves above base cutoff (0-4)
 */
export function mapContourAmount(val: number): number {
  return val * 0.4;
}
