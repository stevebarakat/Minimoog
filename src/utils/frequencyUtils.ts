// Convert MIDI note name (e.g., 'C4') to frequency in Hz
import { MIDI } from "@/config";

export function noteToFrequency(note: string): number {
  const noteRegex = /^([A-G]#?)(-?\d+)$/;
  const match = note.match(noteRegex);
  if (!match) return MIDI.A4_FREQUENCY;
  const noteNames = MIDI.NOTE_NAMES;
  const noteIndex = noteNames.indexOf(match[1] as (typeof noteNames)[number]);
  const octave = parseInt(match[2], 10);
  const midiNumber = noteIndex + (octave + 1) * 12;
  return MIDI.A4_FREQUENCY * Math.pow(2, (midiNumber - MIDI.A4_MIDI_NOTE) / 12);
}

// Calculate frequency with detune, pitch bend, and cents
export function calculateFrequency(
  note: string,
  masterTune: number,
  detuneSemis: number,
  pitchWheel: number,
  detuneCents: number
): number {
  const clamp = (v: number, min: number, max: number) =>
    Math.max(min, Math.min(max, v));
  const clampedMasterTune = clamp(masterTune, -12, 12);
  const clampedDetuneSemis = clamp(detuneSemis, -12, 12);
  const clampedPitchWheel = clamp(pitchWheel, 0, 100);
  const bendSemis = ((clampedPitchWheel - 50) / 50) * 2;
  const baseFreq = noteToFrequency(note) * Math.pow(2, clampedMasterTune / 12);
  const frequency =
    baseFreq *
    Math.pow(2, (clampedDetuneSemis + bendSemis + detuneCents / 100) / 12);
  return clamp(frequency, 20, 22050);
}
