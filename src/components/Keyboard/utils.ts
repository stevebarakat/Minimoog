import type { Note } from "./types";

export const OCTAVE_NOTES: Note[] = [
  { note: "F", isSharp: false },
  { note: "F#", isSharp: true },
  { note: "G", isSharp: false },
  { note: "G#", isSharp: true },
  { note: "A", isSharp: false },
  { note: "A#", isSharp: true },
  { note: "B", isSharp: false },
  { note: "C", isSharp: false },
  { note: "C#", isSharp: true },
  { note: "D", isSharp: false },
  { note: "D#", isSharp: true },
  { note: "E", isSharp: false },
];

export const FIXED_OCTAVE = 4;

export const BASE_KEYBOARD_MAP: { [key: string]: string } = {
  a: "F",
  w: "F#",
  s: "G",
  e: "G#",
  d: "A",
  r: "A#",
  f: "B",
  g: "C",
  y: "C#",
  h: "D",
  u: "D#",
  j: "E",
  k: "F+1",
};

export function generateKeyboardKeys(octaveRange: {
  min: number;
  max: number;
}): Note[] {
  const keys = Array.from(
    { length: octaveRange.max - octaveRange.min + 1 },
    (_, i) => octaveRange.min + i
  ).flatMap((octave) =>
    OCTAVE_NOTES.map((key, index) => {
      const adjustedOctave = index >= 7 ? octave + 1 : octave;
      return {
        note: `${key.note}${adjustedOctave}`,
        isSharp: key.isSharp,
      };
    })
  );

  const lastOctave = octaveRange.max + 1;
  const extraNotes = OCTAVE_NOTES.slice(0, 7).map((key) => ({
    note: `${key.note}${lastOctave}`,
    isSharp: key.isSharp,
  }));

  return [
    ...keys,
    ...extraNotes,
    { note: `C${lastOctave + 1}`, isSharp: false },
  ];
}

export function getNoteFromKeyEvent(
  key: string,
  fixedOctave: number
): string | null {
  const baseNote = BASE_KEYBOARD_MAP[key.toLowerCase()];
  if (!baseNote) return null;

  if (baseNote === "F+1") {
    return `F${fixedOctave + 1}`;
  }

  const isHigherOctave = ["C", "C#", "D", "D#", "E"].includes(baseNote);
  return `${baseNote}${isHigherOctave ? fixedOctave + 1 : fixedOctave}`;
}

export function calculateBlackKeyPosition(
  blackKeyIndex: number,
  keys: Note[],
  whiteKeyWidth: number
): { position: number; width: number } | null {
  const keyIndexToWhiteIndex: { [index: number]: number } = {};
  let whiteIdx = 0;

  keys.forEach((key, idx) => {
    if (!key.isSharp) {
      keyIndexToWhiteIndex[idx] = whiteIdx;
      whiteIdx++;
    }
  });

  let prevWhiteIdx = blackKeyIndex - 1;
  while (prevWhiteIdx >= 0 && keys[prevWhiteIdx].isSharp) {
    prevWhiteIdx--;
  }

  let nextWhiteIdx = blackKeyIndex + 1;
  while (nextWhiteIdx < keys.length && keys[nextWhiteIdx].isSharp) {
    nextWhiteIdx++;
  }

  const leftWhiteIndex = keyIndexToWhiteIndex[prevWhiteIdx];
  const rightWhiteIndex = keyIndexToWhiteIndex[nextWhiteIdx];

  if (leftWhiteIndex === undefined || rightWhiteIndex === undefined) {
    return null;
  }

  // Find the current black key's position within its group
  // Piano layout: F# G# A# (group of 3) ... C# D# (group of 2)

  // First, let's find which octave pattern this black key belongs to
  const noteName = keys[blackKeyIndex].note.replace(/\d+$/, ""); // Remove octave number

  let groupSize = 1;
  let blackKeyInGroup = 0;

  if (noteName === "F#" || noteName === "G#" || noteName === "A#") {
    // Group of 3 black keys
    groupSize = 3;
    if (noteName === "F#") {
      blackKeyInGroup = 0; // First in group
    } else if (noteName === "G#") {
      blackKeyInGroup = 1; // Second in group
    } else if (noteName === "A#") {
      blackKeyInGroup = 2; // Third in group
    }
  } else if (noteName === "C#" || noteName === "D#") {
    // Group of 2 black keys
    groupSize = 2;
    if (noteName === "C#") {
      blackKeyInGroup = 0; // First in group
    } else if (noteName === "D#") {
      blackKeyInGroup = 1; // Second in group
    }
  }

  // Calculate base position (center between white keys)
  const basePosition =
    ((leftWhiteIndex + rightWhiteIndex + 1) / 2) * whiteKeyWidth;

  // Apply offset based on group size and position within group
  let offset = 0;
  const offsetAmount = whiteKeyWidth * 0.08; // Reduced to 8% of white key width for subtle offset

  if (groupSize === 3) {
    // Group of 3 black keys: F#, G#, A#
    if (blackKeyInGroup === 0) {
      // First black key: slightly left
      offset = -offsetAmount;
    } else if (blackKeyInGroup === 1) {
      // Second black key: centered
      offset = 0;
    } else if (blackKeyInGroup === 2) {
      // Third black key: slightly right
      offset = offsetAmount;
    }
  } else if (groupSize === 2) {
    // Group of 2 black keys: C#, D#
    if (blackKeyInGroup === 0) {
      // First black key: slightly left
      offset = -offsetAmount;
    } else if (blackKeyInGroup === 1) {
      // Second black key: slightly right
      offset = offsetAmount;
    }
  }

  const position = basePosition + offset - whiteKeyWidth * 0.35;
  return {
    position,
    width: whiteKeyWidth * 0.7,
  };
}
