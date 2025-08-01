import { MIDI } from "@/config";
import { frequencyToMidiNote } from "./midiUtils";

// Signal processing constants
export const SIGNAL_CONSTANTS = {
  // dB conversion
  DB_TO_LINEAR: 20,
  LINEAR_TO_DB: 1 / 20,

  // Frequency ranges
  MIN_FREQUENCY: 20,
  MAX_FREQUENCY: 20000,

  // Amplitude ranges
  MIN_AMPLITUDE: 0,
  MAX_AMPLITUDE: 1,

  // MIDI ranges
  MIN_MIDI_NOTE: 0,
  MAX_MIDI_NOTE: 127,

  // Pitch bend ranges
  MIN_PITCH_BEND: 0,
  MAX_PITCH_BEND: 16383,
  CENTER_PITCH_BEND: 8191.5,

  // Velocity ranges
  MIN_VELOCITY: 0,
  MAX_VELOCITY: 127,

  // Control change ranges
  MIN_CC_VALUE: 0,
  MAX_CC_VALUE: 127,
} as const;

/**
 * Clamp a value to a specific range.
 * @param value - The value to clamp
 * @param min - The minimum allowed value
 * @param max - The maximum allowed value
 * @returns The clamped value between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Clamp a value to the valid amplitude range [0, 1].
 * @param value - The amplitude value to clamp
 * @returns The clamped amplitude value (0-1)
 */
export function clampAmplitude(value: number): number {
  return clamp(
    value,
    SIGNAL_CONSTANTS.MIN_AMPLITUDE,
    SIGNAL_CONSTANTS.MAX_AMPLITUDE
  );
}

/**
 * Clamp a value to the valid frequency range [20, 20000] Hz.
 * @param value - The frequency value to clamp
 * @returns The clamped frequency value in Hz
 */
export function clampFrequency(value: number): number {
  return clamp(
    value,
    SIGNAL_CONSTANTS.MIN_FREQUENCY,
    SIGNAL_CONSTANTS.MAX_FREQUENCY
  );
}

/**
 * Clamp a value to the valid MIDI note range [0, 127].
 * @param value - The MIDI note value to clamp
 * @returns The clamped MIDI note value (0-127)
 */
export function clampMidiNote(value: number): number {
  return clamp(
    value,
    SIGNAL_CONSTANTS.MIN_MIDI_NOTE,
    SIGNAL_CONSTANTS.MAX_MIDI_NOTE
  );
}

/**
 * Clamp a value to the valid velocity range [0, 127].
 * @param value - The velocity value to clamp
 * @returns The clamped velocity value (0-127)
 */
export function clampVelocity(value: number): number {
  return clamp(
    value,
    SIGNAL_CONSTANTS.MIN_VELOCITY,
    SIGNAL_CONSTANTS.MAX_VELOCITY
  );
}

/**
 * Clamp a value to the valid control change range [0, 127].
 * @param value - The control change value to clamp
 * @returns The clamped control change value (0-127)
 */
export function clampControlChange(value: number): number {
  return clamp(
    value,
    SIGNAL_CONSTANTS.MIN_CC_VALUE,
    SIGNAL_CONSTANTS.MAX_CC_VALUE
  );
}

/**
 * Apply logarithmic scaling to a value from one range to another.
 * @param value - The value to scale
 * @param fromRange - The source range [min, max]
 * @param toRange - The target range [min, max]
 * @returns The logarithmically scaled value in the target range
 */
export function logarithmicScale(
  value: number,
  fromRange: [number, number],
  toRange: [number, number]
): number {
  const [fromMin, fromMax] = fromRange;
  const [toMin, toMax] = toRange;

  if (fromMax === fromMin) return toMin;

  const normalized = (value - fromMin) / (fromMax - fromMin);
  const logarithmic = Math.log(1 + normalized * 9) / Math.log(10);
  return toMin + logarithmic * (toMax - toMin);
}

/**
 * Apply musical scaling (12-tone equal temperament) to a value from one range to another.
 * @param value - The value to scale
 * @param fromRange - The source range [min, max]
 * @param toRange - The target range [min, max]
 * @returns The musically scaled value in the target range
 */
export function musicalScale(
  value: number,
  fromRange: [number, number],
  toRange: [number, number]
): number {
  const [fromMin, fromMax] = fromRange;
  const [toMin, toMax] = toRange;

  if (fromMax === fromMin) return toMin;

  const normalized = (value - fromMin) / (fromMax - fromMin);
  const musical = Math.pow(2, normalized * 12) / Math.pow(2, 12);
  return toMin + musical * (toMax - toMin);
}

/**
 * Convert MIDI pitch bend value to semitone offset.
 * @param bend - The MIDI pitch bend value (0-16383)
 * @returns The semitone offset (-2 to +2)
 */
export function pitchBendToSemitones(bend: number): number {
  const normalized =
    (bend - SIGNAL_CONSTANTS.CENTER_PITCH_BEND) /
    SIGNAL_CONSTANTS.CENTER_PITCH_BEND;
  return normalized * 2;
}

/**
 * Convert semitone offset to MIDI pitch bend value.
 * @param semitones - The semitone offset (-2 to +2)
 * @returns The MIDI pitch bend value (0-16383)
 */
export function semitonesToPitchBend(semitones: number): number {
  const normalized = semitones / 2;
  return Math.round((normalized + 1) * SIGNAL_CONSTANTS.CENTER_PITCH_BEND);
}

/**
 * Convert linear volume to logarithmic gain.
 * @param linearVolume - The linear volume value (0-maxVolume)
 * @param maxVolume - The maximum volume value (default: 10)
 * @returns The logarithmic gain value (0-1)
 */
export function linearToLogGain(
  linearVolume: number,
  maxVolume: number = 10
): number {
  const normalized = linearVolume / maxVolume;
  return Math.pow(normalized, 1.5);
}

/**
 * Convert logarithmic gain to linear volume.
 * @param gain - The logarithmic gain value (0-1)
 * @param maxVolume - The maximum volume value (default: 10)
 * @returns The linear volume value (0-maxVolume)
 */
export function logGainToLinear(gain: number, maxVolume: number = 10): number {
  return Math.pow(gain, 1 / 1.5) * maxVolume;
}

/**
 * Calculate the Root Mean Square (RMS) of an audio buffer.
 * @param buffer - The audio buffer to analyze
 * @returns The RMS value
 */
export function calculateRMS(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += buffer[i] * buffer[i];
  }
  return Math.sqrt(sum / buffer.length);
}

/**
 * Calculate the peak amplitude of an audio buffer.
 * @param buffer - The audio buffer to analyze
 * @returns The peak amplitude value
 */
export function calculatePeak(buffer: Float32Array): number {
  let peak = 0;
  for (let i = 0; i < buffer.length; i++) {
    peak = Math.max(peak, Math.abs(buffer[i]));
  }
  return peak;
}

/**
 * Calculate the average amplitude of an audio buffer.
 * @param buffer - The audio buffer to analyze
 * @returns The average amplitude value
 */
export function calculateAverage(buffer: Float32Array): number {
  let sum = 0;
  for (let i = 0; i < buffer.length; i++) {
    sum += Math.abs(buffer[i]);
  }
  return sum / buffer.length;
}

/**
 * Apply smoothing to a value using exponential moving average.
 * @param currentValue - The current value
 * @param targetValue - The target value to smooth towards
 * @param smoothingCoefficient - The smoothing coefficient (0-1, higher = smoother)
 * @returns The smoothed value
 */
export function smoothValue(
  currentValue: number,
  targetValue: number,
  smoothingCoefficient: number
): number {
  return currentValue + (targetValue - currentValue) * smoothingCoefficient;
}

/**
 * Apply smoothing to an audio parameter using Web Audio API.
 * @param param - The audio parameter to smooth
 * @param targetValue - The target value to smooth towards
 * @param smoothingTime - The smoothing time constant in seconds
 * @param audioContext - The audio context for timing
 */
export function smoothAudioParameter(
  param: AudioParam,
  targetValue: number,
  smoothingTime: number,
  audioContext: AudioContext
): void {
  const now = audioContext.currentTime;
  param.setTargetAtTime(targetValue, now, smoothingTime);
}

/**
 * Convert milliseconds to seconds.
 * @param ms - The time in milliseconds
 * @returns The time in seconds
 */
export function msToSeconds(ms: number): number {
  return ms / 1000;
}

/**
 * Convert seconds to milliseconds.
 * @param seconds - The time in seconds
 * @returns The time in milliseconds
 */
export function secondsToMs(seconds: number): number {
  return seconds * 1000;
}

/**
 * Convert BPM (beats per minute) to frequency in Hz (for LFO).
 * @param bpm - The tempo in beats per minute
 * @returns The frequency in Hz
 */
export function bpmToFrequency(bpm: number): number {
  return bpm / 60;
}

/**
 * Convert frequency in Hz to BPM (beats per minute).
 * @param frequency - The frequency in Hz
 * @returns The tempo in beats per minute
 */
export function frequencyToBpm(frequency: number): number {
  return frequency * 60;
}

/**
 * Convert frequency to note name with octave.
 * @param frequency - The frequency in Hz
 * @returns The note name with octave (e.g., "A4", "C#3")
 */
export function frequencyToNoteName(frequency: number): string {
  const noteNames = MIDI.NOTE_NAMES;
  const midiNote = frequencyToMidiNote(frequency);
  const octave = Math.floor(midiNote / 12) - 1;
  const noteIndex = midiNote % 12;
  return `${noteNames[noteIndex]}${octave}`;
}

/**
 * Calculate cents deviation from a reference frequency.
 * @param frequency - The frequency to measure
 * @param referenceFrequency - The reference frequency
 * @returns The cents deviation (positive = sharp, negative = flat)
 */
export function calculateCents(
  frequency: number,
  referenceFrequency: number
): number {
  return 1200 * Math.log2(frequency / referenceFrequency);
}

/**
 * Apply cents deviation to a frequency.
 * @param frequency - The base frequency
 * @param cents - The cents deviation to apply
 * @returns The adjusted frequency
 */
export function applyCents(frequency: number, cents: number): number {
  return frequency * Math.pow(2, cents / 1200);
}

/**
 * Convert a value to a musical scale (for filter cutoff, etc.).
 * @param value - The value to convert
 * @param fromRange - The source range [min, max]
 * @param toRange - The target range [min, max]
 * @returns The musically scaled value in the target range
 */
export function toMusicalScale(
  value: number,
  fromRange: [number, number],
  toRange: [number, number]
): number {
  const [fromMin, fromMax] = fromRange;
  const [toMin, toMax] = toRange;

  // Normalize to 0-1 range
  const normalized = (value - fromMin) / (fromMax - fromMin);

  // Apply musical curve (exponential for frequency-like parameters)
  const musical = Math.pow(normalized, 1.2);

  // Scale to target range
  return toMin + musical * (toMax - toMin);
}

/**
 * Convert a value from musical scale back to linear scale.
 * @param value - The musically scaled value
 * @param fromRange - The source range [min, max]
 * @param toRange - The target range [min, max]
 * @returns The linear value in the target range
 */
export function fromMusicalScale(
  value: number,
  fromRange: [number, number],
  toRange: [number, number]
): number {
  const [fromMin, fromMax] = fromRange;
  const [toMin, toMax] = toRange;

  // Normalize to 0-1 range
  const normalized = (value - fromMin) / (fromMax - fromMin);

  // Apply inverse musical curve
  const inverseMusical = Math.pow(normalized, 1 / 1.2);

  // Scale to target range
  return toMin + inverseMusical * (toMax - toMin);
}

/**
 * Check if a value is within a valid range
 */
export function isValidRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max && isFinite(value);
}

/**
 * Check if a value is a valid frequency
 */
export function isValidFrequency(frequency: number): boolean {
  return isValidRange(
    frequency,
    SIGNAL_CONSTANTS.MIN_FREQUENCY,
    SIGNAL_CONSTANTS.MAX_FREQUENCY
  );
}

/**
 * Check if a value is a valid amplitude
 */
export function isValidAmplitude(amplitude: number): boolean {
  return isValidRange(
    amplitude,
    SIGNAL_CONSTANTS.MIN_AMPLITUDE,
    SIGNAL_CONSTANTS.MAX_AMPLITUDE
  );
}

/**
 * Check if a value is a valid MIDI note
 */
export function isValidMidiNote(note: number): boolean {
  return isValidRange(
    note,
    SIGNAL_CONSTANTS.MIN_MIDI_NOTE,
    SIGNAL_CONSTANTS.MAX_MIDI_NOTE
  );
}

/**
 * Check if a value is a valid velocity
 */
export function isValidVelocity(velocity: number): boolean {
  return isValidRange(
    velocity,
    SIGNAL_CONSTANTS.MIN_VELOCITY,
    SIGNAL_CONSTANTS.MAX_VELOCITY
  );
}

/**
 * Round a value to a specific number of decimal places
 */
export function roundToDecimals(value: number, decimals: number): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Round a value to the nearest step
 */
export function roundToStep(value: number, step: number): number {
  return Math.round(value / step) * step;
}

/**
 * Snap a value to zero if it's within a threshold
 */
export function snapToZero(value: number, threshold: number = 0.001): number {
  return Math.abs(value) < threshold ? 0 : value;
}
