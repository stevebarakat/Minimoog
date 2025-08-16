// Parameter mapping and MIDI conversion utilities
import { FILTER_MAPPING, SYNTH_CONFIG } from "@/config";

// Precomputed constants for better performance
const ENVELOPE_TIME_MIN = 0.05;
const ENVELOPE_TIME_MAX = 15;
const ENVELOPE_TIME_RATIO = ENVELOPE_TIME_MAX / ENVELOPE_TIME_MIN;
const ENVELOPE_TIME_LOG_RATIO = Math.log(ENVELOPE_TIME_RATIO);

const CUTOFF_MIN_FREQ = 10; // Authentic Minimoog low-end (10Hz)
const CUTOFF_MAX_FREQ = 32000; // Authentic Minimoog high-end (32kHz)
const CUTOFF_FREQ_RATIO = CUTOFF_MAX_FREQ / CUTOFF_MIN_FREQ;
const CUTOFF_LOG_RATIO = Math.log(CUTOFF_FREQ_RATIO);

/**
 * Map knob value (0-10) to envelope time (0.05s to 15s) logarithmically.
 * Optimized with precomputed constants for better performance.
 * @param value - Knob value (0-10)
 * @returns Envelope time in seconds
 */
export function mapEnvelopeTime(value: number): number {
  const normalizedValue = Math.max(0, Math.min(10, value)) / 10;
  return (
    ENVELOPE_TIME_MIN * Math.exp(normalizedValue * ENVELOPE_TIME_LOG_RATIO)
  );
}

/**
 * Map -4 to 4 to 10 Hz - 32,000 Hz logarithmically for filter cutoff.
 * Authentic Minimoog Model D frequency response range.
 * Optimized with precomputed constants and improved clamping.
 * @param val - Value in range -4 to 4
 * @returns Frequency in Hz
 */
export function mapCutoff(val: number): number {
  // Clamp value to valid range
  const clampedVal = Math.max(
    SYNTH_CONFIG.FILTER.CUTOFF.MIN,
    Math.min(SYNTH_CONFIG.FILTER.CUTOFF.MAX, val)
  );

  // Normalize to 0-1 range
  const normalizedVal = (clampedVal + 4) / 8;

  // Apply musical curve for better response
  const musicalCurve = Math.pow(
    normalizedVal,
    FILTER_MAPPING.CUTOFF.MUSICAL_CURVE_POWER
  );

  // Calculate frequency using precomputed constants
  const result = CUTOFF_MIN_FREQ * Math.exp(musicalCurve * CUTOFF_LOG_RATIO);

  // Final clamp to ensure valid range (10Hz - 32kHz for authentic Minimoog response)
  return Math.max(CUTOFF_MIN_FREQ, Math.min(CUTOFF_MAX_FREQ, result));
}

/**
 * Map 0-10 to a modulation amount (octaves above base cutoff).
 * Optimized for better envelope response.
 * @param val - Value in range 0-10
 * @returns Octaves above base cutoff (0-20)
 */
export function mapContourAmount(val: number): number {
  const clampedVal = Math.max(0, Math.min(10, val));
  // Use exponential curve for more musical response
  return Math.pow(clampedVal / 10, 0.7) * 20; // Range from 0 to 20
}

/**
 * Map 0-10 to resonance value (0-1) for authentic Minimoog emphasis behavior.
 * Enhanced curve based on original Minimoog Model D resonance characteristics.
 * Provides more aggressive self-oscillation at higher settings.
 * @param val - Value in range 0-10 (Minimoog emphasis knob range)
 * @returns Resonance value (0-1) for filter processing
 */
export function mapResonance(val: number): number {
  const clampedVal = Math.max(0, Math.min(10, val));
  const normalizedEmphasis = clampedVal / 10;

  // Enhanced authentic Minimoog emphasis behavior
  if (normalizedEmphasis < 0.5) {
    // Linear mapping for lower values (0-5 on emphasis = 0-0.3 resonance)
    // Gentle resonance, clean filtering
    return normalizedEmphasis * (0.3 / 0.5);
  } else if (normalizedEmphasis < 0.7) {
    // Moderate curve for mid values (5-7 on emphasis = 0.3-0.6 resonance)
    // Filter starts to add character and presence
    const remaining = normalizedEmphasis - 0.5;
    const curve = Math.pow(remaining / 0.2, 1.1);
    return 0.3 + curve * 0.3;
  } else if (normalizedEmphasis < 0.85) {
    // Steeper curve for high values (7-8.5 on emphasis = 0.6-0.85 resonance)
    // Filter begins to "sing" and approach self-oscillation
    const remaining = normalizedEmphasis - 0.7;
    const curve = Math.pow(remaining / 0.15, 1.3);
    return 0.6 + curve * 0.25;
  } else {
    // Aggressive curve for self-oscillation (8.5-10 on emphasis = 0.85-0.99 resonance)
    // Full self-oscillation capability with more aggressive response
    const remaining = normalizedEmphasis - 0.85;
    const steepCurve = Math.pow(remaining / 0.15, 0.7);
    return 0.85 + steepCurve * 0.14; // Cap at 0.99 to prevent instability
  }
}
