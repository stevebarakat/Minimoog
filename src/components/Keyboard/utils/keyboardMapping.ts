import { MIDI } from "@/config";

// Minimoog-style keyboard layout
export const QWERTY_KEYS = [
  // Bottom row - white keys starting from C1 (A key = C1)
  "a",
  "s",
  "d",
  "f",
  "g",
  "h",
  "j",
  "k",
  "l",
  ";",
  "'",
  // Top row - black keys (sharps/flats)
  "w",
  "e",
  "t",
  "y",
  "u",
  "o",
  "p",
  // QWERTY row continuation
  "q",
  "r",
  "i",
  "[",
  "]",
  // Number row removed - 1,2 reserved for pitch bend, others not used
  // Shifted versions
  "A",
  "S",
  "D",
  "F",
  "G",
  "H",
  "J",
  "K",
  "L",
  ":",
  '"',
  "W",
  "E",
  "T",
  "Y",
  "U",
  "O",
  "P",
  "Q",
  "R",
  "I",
  "{",
  "}",
];

// Octave shift keys (moved to avoid conflicts with musical keys)
export const OCTAVE_DOWN_KEYS = ["z", ",", "<"];
export const OCTAVE_UP_KEYS = ["x", ".", ">"];

// Pitch bend and modulation keys (Logic Pro style)
export const PITCH_BEND_DOWN_KEYS = ["1", "!"];
export const PITCH_BEND_UP_KEYS = ["2", "@"];

// Direct modulation amount keys
export const MOD_AMOUNT_KEYS = {
  "3": 0, // Modulation off
  "4": 20, // Modulation 20%
  "5": 40, // Modulation 40%
  "6": 60, // Modulation 60%
  "7": 80, // Modulation 80%
  "8": 100, // Modulation max
} as const;

// Minimoog-style keyboard mapping
// A = C1, W = C#1, S = D1, etc.
// Bottom row starts from C1, black keys on top row
const KEY_TO_SEMITONE: Record<string, number> = {
  // Bottom row - white keys starting from C1 (C4 = 0, so C1 = -36)
  a: 0, // C1 (C4)
  s: 2, // D1 (D4)
  d: 4, // E1 (E4)
  f: 5, // F1 (F4)
  g: 7, // G1 (G4)
  h: 9, // A1 (A4)
  j: 11, // B1 (B4)
  k: 12, // C2 (C5)
  l: 14, // D2 (D5)
  ";": 16, // E2 (E5)
  "'": 17, // F2 (F5)

  // Black keys row
  w: 1, // C#1 (C#4)
  e: 3, // D#1 (D#4)
  // r: null (no mapping)
  t: 6, // F#1 (F#4)
  y: 8, // G#1 (G#4)
  u: 10, // A#1 (A#4)
  // i: null (no mapping)
  o: 13, // C#2 (C#5)
  p: 15, // D#2 (D#5)

  // Extended range (QR I) - keeping some for compatibility
  q: -1, // B0 (B3) - lower
  // r and i intentionally omitted (null mapping)

  // Number keys 1 and 2 are reserved for pitch bend
  // Number keys 3-0 removed to avoid conflicts

  // Extended range brackets
  "[": 18, // F#2 (F#5)
  "]": 19, // G2 (G5)
};

export function getNoteForKey(
  key: string,
  octaveOffset: number
): string | null {
  // Convert to lowercase to handle both uppercase and lowercase keys
  const normalizedKey = key.toLowerCase();

  // Get semitone offset for the key
  const semitone = KEY_TO_SEMITONE[normalizedKey];

  if (semitone === undefined) return null;

  // Calculate note and octave
  const baseMidi = 60 + octaveOffset * 12; // C4 = 60
  const midi = baseMidi + semitone;

  // Validate MIDI note is within valid range (0-127)
  if (midi < 0 || midi > 127) return null;

  const noteName = MIDI.NOTE_NAMES[midi % 12];
  const octave = Math.floor(midi / 12) - 1;

  return `${noteName}${octave}`;
}
