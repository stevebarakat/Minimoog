// Parameter mapping and MIDI conversion utilities

/**
 * Convert note name (e.g., 'C4') to MIDI number.
 * @param note - Note name string
 * @returns MIDI note number
 */
export function noteNameToMidi(note: string): number {
  const noteMap: Record<string, number> = {
    C: 0,
    "C#": 1,
    D: 2,
    "D#": 3,
    E: 4,
    F: 5,
    "F#": 6,
    G: 7,
    "G#": 8,
    A: 9,
    "A#": 10,
    B: 11,
  };
  const match = note.match(/^([A-G]#?)(-?\d+)$/);
  if (!match) return 60; // default to C4
  const [, n, oct] = match;
  return 12 * (parseInt(oct, 10) + 1) + noteMap[n];
}

/**
 * Map knob value (0-10) to envelope time (0.02s to 15s) logarithmically.
 * @param value - Knob value (0-10)
 * @returns Envelope time in seconds
 */
export function mapEnvelopeTime(value: number): number {
  const minTime = 0.02; // 20ms
  const maxTime = 15; // 15s
  return minTime * Math.pow(maxTime / minTime, value / 10);
}

/**
 * Map -4 to 4 to 20 Hz - 12,000 Hz logarithmically for filter cutoff.
 * @param val - Value in range -4 to 4
 * @returns Frequency in Hz
 */
export function mapCutoff(val: number): number {
  const minFreq = 20;
  const maxFreq = 12000;
  const clampedVal = Math.max(-4, Math.min(4, val));
  const normalizedVal = (clampedVal + 4) / 8;
  const musicalCurve = Math.pow(normalizedVal, 1.2);
  let result = minFreq * Math.pow(maxFreq / minFreq, musicalCurve);
  result = Math.max(20, Math.min(12000, result));
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
