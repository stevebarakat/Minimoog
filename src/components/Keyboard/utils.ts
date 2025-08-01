import type { Note } from "./types";
import {
  midiToNoteName,
  generateKeyboardKeys,
  calculateBlackKeyPosition,
} from "@/config";

// Re-export the centralized functions for backward compatibility
export { midiToNoteName, generateKeyboardKeys, calculateBlackKeyPosition };

// Define the note layout for visual display
export const OCTAVE_NOTES: Note[] = [
  "F",
  "F#",
  "G",
  "G#",
  "A",
  "A#",
  "B",
  "C",
  "C#",
  "D",
  "D#",
  "E",
];
