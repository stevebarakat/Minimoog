// Parameter mapping and MIDI conversion utilities
import { SYNTH_CONFIG } from "@/config";

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
 * Map -5 to 5 to 10 Hz - 32,000 Hz for filter cutoff.
 * Authentic Minimoog Model D frequency response range.
 * Improved mapping for better high frequency response at lower cutoff values.
 * @param val - Value in range -5 to 5
 * @returns Frequency in Hz
 */
export function mapCutoff(val: number): number {
  // Clamp value to valid range
  const clampedVal = Math.max(
    SYNTH_CONFIG.FILTER.CUTOFF.MIN,
    Math.min(SYNTH_CONFIG.FILTER.CUTOFF.MAX, val)
  );

  // Use a more sophisticated mapping that better matches real Minimoog behavior
  // -5 should still allow some high frequencies to pass through
  // -4 should allow more low frequencies to be filtered

  // Normalize to 0-1 range
  const normalizedVal = (clampedVal + 5) / 10;

  // Use a curve that's less aggressive at the low end
  // This allows high frequencies to be heard even at -5
  const curvePower = 0.6; // Less aggressive than before
  const curvedVal = Math.pow(normalizedVal, curvePower);

  // Calculate frequency using exponential mapping
  const result = CUTOFF_MIN_FREQ * Math.exp(curvedVal * CUTOFF_LOG_RATIO);

  // Final clamp to ensure valid range (10Hz - 32kHz for authentic Minimoog response)
  return Math.max(CUTOFF_MIN_FREQ, Math.min(CUTOFF_MAX_FREQ, result));
}

/**
 * Map 0-10 to a modulation amount (octaves above base cutoff).
 * Optimized for more dramatic envelope response.
 * @param val - Value in range 0-10
 * @returns Octaves above base cutoff (0-40)
 */
export function mapContourAmount(val: number): number {
  const clampedVal = Math.max(0, Math.min(10, val));
  // Use more aggressive curve for dramatic contour effect
  return Math.pow(clampedVal / 10, 0.5) * 40; // Range from 0 to 40
}

/**
 * Calculate the final filter cutoff frequency with keyboard control applied.
 * Enhanced version that makes keyboard control more noticeable without changing tracking amount.
 * @param baseCutoffValue - Base cutoff value (-5 to 5)
 * @param keyboardControlOffset - Keyboard control offset in octaves
 * @returns Final cutoff frequency in Hz
 */
export function calculateKeyboardControlledCutoff(
  baseCutoffValue: number,
  keyboardControlOffset: number
): number {
  // Get base frequency from the cutoff value
  const baseFrequency = mapCutoff(baseCutoffValue);

  // Enhanced keyboard control with much more dramatic effect
  if (keyboardControlOffset === 0) {
    return baseFrequency;
  }

  // Use a much more aggressive curve for keyboard control to make it very noticeable
  // Apply a steeper power curve to make the effect much more pronounced
  const powerCurve =
    Math.sign(keyboardControlOffset) *
    Math.pow(Math.abs(keyboardControlOffset), 0.4); // Much steeper curve

  // Add significant harmonic enhancement - makes the effect very dramatic
  const harmonicEnhancement = 1 + Math.abs(keyboardControlOffset) * 0.4; // Doubled enhancement

  // Add frequency-dependent boost for mid-range frequencies where it's most audible
  const frequencyBoost =
    baseFrequency > 100 && baseFrequency < 8000 ? 1.5 : 1.0;

  // Calculate the enhanced frequency with much more dramatic changes
  const enhancedFrequency =
    baseFrequency *
    Math.pow(2, powerCurve) *
    harmonicEnhancement *
    frequencyBoost;

  // Ensure we stay within the valid frequency range
  return Math.max(
    CUTOFF_MIN_FREQ,
    Math.min(CUTOFF_MAX_FREQ, enhancedFrequency)
  );
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
    const curve = Math.pow(remaining / 0.15, 0.8);
    return 0.6 + curve * 0.25;
  } else {
    // Extreme curve for maximum self-oscillation (8.5-10 on emphasis = 0.85-1.0 resonance)
    // Maximum possible resonance for the most dramatic filter effects
    const remaining = normalizedEmphasis - 0.85;
    const extremeCurve = Math.pow(remaining / 0.15, 0.4);
    return 0.85 + extremeCurve * 0.15; // Allow full 1.0 resonance for maximum effect
  }
}
