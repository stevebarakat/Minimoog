import { MIDI } from "@/config";

export function noteToFrequency(note: string): number {
  const match = note.match(/^([A-G]#?)(\d)$/);
  if (!match) return MIDI.A4_FREQUENCY;
  const noteNames = MIDI.NOTE_NAMES;
  const [, name, octaveStr] = match;
  const octave = parseInt(octaveStr, 10);
  const n = noteNames.indexOf(name as (typeof noteNames)[number]);
  if (n < 0 || isNaN(octave)) return MIDI.A4_FREQUENCY;
  const midi = 12 * (octave + 1) + n;
  const freq = MIDI.A4_FREQUENCY * Math.pow(2, (midi - MIDI.A4_MIDI_NOTE) / 12);
  return isFinite(freq) ? freq : MIDI.A4_FREQUENCY;
}
