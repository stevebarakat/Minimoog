import { KEYBOARD } from "@/config";

/**
 * Utility functions for safe keyboard event handling that prevents conflicts
 * with browser shortcuts while still allowing synth functionality
 */

/**
 * Checks if a keyboard event should be intercepted by the synth
 * Allows important browser shortcuts to pass through
 */
export function shouldInterceptKeyboardEvent(event: KeyboardEvent): boolean {
  // Always allow browser shortcuts with modifier keys
  if (event.ctrlKey || event.metaKey || event.altKey) {
    return false;
  }

  // Allow F-keys for browser functions (F5 refresh, F11 fullscreen, etc.)
  if (event.key.startsWith("F") && event.key.length > 1) {
    return false;
  }

  // Allow Tab for navigation
  if (event.key === "Tab") {
    return false;
  }

  // Allow Escape for browser functions
  if (event.key === "Escape") {
    return false;
  }

  return true;
}

/**
 * Checks if the synth should be considered "focused" and able to receive keyboard input
 * This prevents global keyboard capture when user is interacting with other elements
 */
export function isSynthFocused(): boolean {
  const activeElement = document.activeElement;

  // If no active element, assume synth can receive input
  if (!activeElement) return true;

  // Don't capture keys when user is typing in inputs
  if (
    activeElement.tagName === "INPUT" ||
    activeElement.tagName === "TEXTAREA" ||
    activeElement.tagName === "SELECT" ||
    activeElement.hasAttribute("contenteditable")
  ) {
    return false;
  }

  // Don't capture keys when user is in a dropdown or modal
  if (
    activeElement.closest('[role="dialog"]') ||
    activeElement.closest('[role="menu"]') ||
    activeElement.closest('[role="listbox"]')
  ) {
    return false;
  }

  return true;
}

/**
 * Safely prevents default behavior only for keys that should be intercepted
 */
export function safePreventDefault(
  event: KeyboardEvent,
  allowedKeys: string[]
): boolean {
  if (!shouldInterceptKeyboardEvent(event)) {
    return false;
  }

  if (!isSynthFocused()) {
    return false;
  }

  if (allowedKeys.includes(event.key)) {
    event.preventDefault();
    return true;
  }

  return false;
}

/**
 * Keys that are commonly used in browser shortcuts and should be handled carefully
 */
export const BROWSER_SHORTCUT_KEYS = [
  "F5",
  "F11",
  "F12", // Browser functions
  "Tab",
  "Escape", // Navigation
  "Enter", // Form submission (context dependent)
  "Backspace",
  "Delete", // Navigation in some contexts
];

/**
 * Keys that are safe to intercept for synth functionality
 */
export const SAFE_SYNTH_KEYS = [
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
  "\\", // Piano keys
  "z",
  "x",
  "-",
  "_",
  "=",
  "+", // Octave controls
];

/**
 * Generate keyboard keys for visual display
 * @param {Object} octaveRange - The range of octaves to generate keys for
 * @param {number} octaveRange.min - Minimum octave number
 * @param {number} octaveRange.max - Maximum octave number
 * @param {number} [extraKeys=0] - Number of extra keys to add from the next octave
 * @returns {Array<{note: string, isSharp: boolean}>} Array of key objects with note names and sharp indicators
 */
export function generateKeyboardKeys(
  octaveRange: {
    min: number;
    max: number;
  },
  extraKeys: number = 0
): Array<{ note: string; isSharp: boolean }> {
  const keys: Array<{ note: string; isSharp: boolean }> = [];
  const noteLayout = [
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

  for (let octave = octaveRange.min; octave <= octaveRange.max; octave++) {
    noteLayout.forEach((layoutItem) => {
      // For C and notes after C, increment the octave
      let noteOctave = octave;
      if (
        layoutItem.note === "C" ||
        layoutItem.note === "C#" ||
        layoutItem.note === "D" ||
        layoutItem.note === "D#" ||
        layoutItem.note === "E"
      ) {
        noteOctave = octave + 1;
      }
      keys.push({
        note: `${layoutItem.note}${noteOctave}`,
        isSharp: layoutItem.isSharp,
      });
    });
  }

  // Add extra keys from the next octave
  if (extraKeys > 0) {
    const nextOctave = octaveRange.max + 1;
    for (let i = 0; i < Math.min(extraKeys, noteLayout.length); i++) {
      const layoutItem = noteLayout[i];
      let noteOctave = nextOctave;
      if (
        layoutItem.note === "C" ||
        layoutItem.note === "C#" ||
        layoutItem.note === "D" ||
        layoutItem.note === "D#" ||
        layoutItem.note === "E"
      ) {
        noteOctave = nextOctave + 1;
      }
      keys.push({
        note: `${layoutItem.note}${noteOctave}`,
        isSharp: layoutItem.isSharp,
      });
    }
  }

  return keys;
}

/**
 * Calculate black key position for visual layout
 * @param {number} blackKeyIndex - Index of the black key in the keys array
 * @param {Array<{note: string, isSharp: boolean}>} keys - Array of all keyboard keys
 * @param {number} whiteKeyWidth - Width of a white key in pixels
 * @returns {{position: number, width: number} | null} Position and width of the black key, or null if calculation fails
 */
export function calculateBlackKeyPosition(
  blackKeyIndex: number,
  keys: Array<{ note: string; isSharp: boolean }>,
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
  const offsetAmount =
    whiteKeyWidth * KEYBOARD.BLACK_KEY_POSITIONING.OFFSET_AMOUNT;

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

  const position =
    basePosition +
    offset -
    whiteKeyWidth * KEYBOARD.BLACK_KEY_POSITIONING.POSITION_OFFSET;
  return {
    position,
    width: whiteKeyWidth * KEYBOARD.BLACK_KEY_POSITIONING.WIDTH_RATIO,
  };
}
