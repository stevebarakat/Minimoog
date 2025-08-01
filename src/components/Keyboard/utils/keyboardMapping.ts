import { MIDI } from "@/config";

// QWERTY keys for white and black piano keys
export const QWERTY_KEYS = [
  "a",
  "w",
  "s",
  "e",
  "d",
  "f",
  "t",
  "g",
  "y",
  "h",
  "u",
  "j",
  "k",
  "o",
  "l",
  "p",
  ";",
  "[",
  "'",
  "]",
  "\\",
  "Enter",
];

// Octave shift keys
export const OCTAVE_DOWN_KEYS = ["z", "-", "_"];
export const OCTAVE_UP_KEYS = ["x", "=", "+"];

// Map QWERTY keys to semitone offsets from C
const KEY_TO_SEMITONE: Record<string, number> = {
  a: 0, // C
  w: 1, // C#
  s: 2, // D
  e: 3, // D#
  d: 4, // E
  f: 5, // F
  t: 6, // F#
  g: 7, // G
  y: 8, // G#
  h: 9, // A
  u: 10, // A#
  j: 11, // B
  k: 12, // C (next octave)
  o: 13, // C# (next octave)
  l: 14, // D (next octave)
  p: 15, // D# (next octave)
  ";": 16, // E (next octave)
  "[": 17, // F (next octave)
  "'": 18, // F# (next octave)
  "]": 19, // G (next octave)
  Enter: 20, // G# (next octave)
  "\\": 21, // A (next octave)
};

export function getNoteForKey(
  key: string,
  octaveOffset: number
): string | null {
  // Get semitone offset for the key
  const semitone =
    key === "Enter"
      ? KEY_TO_SEMITONE.Enter
      : KEY_TO_SEMITONE[key.toLowerCase()];

  if (semitone === undefined) return null;

  // Calculate note and octave
  const baseMidi = 60 + octaveOffset * 12; // C4 = 60
  const midi = baseMidi + semitone;
  const noteName = MIDI.NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;

  return `${noteName}${octave}`;
}
