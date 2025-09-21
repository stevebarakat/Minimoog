import { noteToFrequency } from "./midiUtils";
import { clampParameter } from "./audioUtils";

/**
 * Calculate frequency with detune, pitch bend, and cents adjustments.
 * @param note - The base note (e.g., "A4", "C3")
 * @param masterTune - Master tuning adjustment in semitones (-12 to 12)
 * @param detuneSemis - Detune adjustment in semitones (-12 to 12)
 * @param pitchWheel - Pitch wheel value (0-100, 50 is center)
 * @param detuneCents - Fine detune adjustment in cents
 * @returns The calculated frequency in Hz, clamped between 20-22050 Hz
 */
export function calculateFrequency(
  note: string,
  masterTune: number,
  detuneSemis: number,
  pitchWheel: number,
  detuneCents: number
): number {
  const clampedMasterTune = clampParameter(masterTune, -12, 12);
  const clampedDetuneSemis = clampParameter(detuneSemis, -12, 12);
  const clampedPitchWheel = clampParameter(pitchWheel, 0, 100);
  const bendSemis = ((clampedPitchWheel - 50) / 50) * 2;
  const baseFreq = noteToFrequency(note) * Math.pow(2, clampedMasterTune / 12);
  const frequency =
    baseFreq *
    Math.pow(2, (clampedDetuneSemis + bendSemis + detuneCents / 100) / 12);
  return clampParameter(frequency, 20, 22050);
}
