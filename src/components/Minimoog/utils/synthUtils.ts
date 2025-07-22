// Helper: Convert note name (e.g., 'C4') to MIDI number
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

// Helper to map internal waveform names to Web Audio API types
export function mapOscillatorType(waveform: string): OscillatorType {
  switch (waveform) {
    case "triangle":
      return "triangle";
    case "sawtooth":
      return "sawtooth";
    case "pulse1":
    case "pulse2":
    case "pulse3":
      return "square";
    default:
      return "sine"; // fallback for custom or unsupported types
  }
}

// Helper to map knob values (0-10) to time values (20ms to 15s)
export function mapEnvelopeTime(value: number): number {
  // Map 0-10 to 0.02-15 seconds logarithmically for more musical envelope times
  const minTime = 0.02; // 20ms (increased from 5ms)
  const maxTime = 15; // 15s (increased from 10s)
  return minTime * Math.pow(maxTime / minTime, value / 10);
}

// Helper to map -4 to 4 to 20 Hz - 20,000 Hz logarithmically
// Practical range that works well with digital audio systems
export function mapCutoff(val: number): number {
  const minFreq = 20; // Practical lower limit for digital audio
  const maxFreq = 20000; // Practical upper limit for digital audio
  // Clamp input to -4 to 4 range
  const clampedVal = Math.max(-4, Math.min(4, val));
  // Map -4 to 4 to 0 to 1, then apply logarithmic mapping
  const normalizedVal = (clampedVal + 4) / 8; // Convert -4..4 to 0..1
  // Apply a more musical curve that gives better control in the middle range
  const musicalCurve = Math.pow(normalizedVal, 1.5); // Less aggressive curve
  let result = minFreq * Math.pow(maxFreq / minFreq, musicalCurve);

  // Add safety limits to prevent extreme values
  result = Math.max(20, Math.min(20000, result));

  return result;
}

// Helper to map 0-10 to a modulation amount (octaves above base cutoff)
export function mapContourAmount(val: number): number {
  // 0 = no envelope, 10 = up to 4 octaves above base cutoff
  return val * 0.4; // 0-4 octaves
}
