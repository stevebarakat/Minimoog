/**
 * Configuration system for the Minimoog synthesizer application
 * Provides environment-based access to constants and utility functions
 */

import {
  AUDIO,
  MIDI,
  SYNTH_PARAMS,
  ENVELOPE_MAPPING,
  FILTER_MAPPING,
  OSCILLATOR,
  EXTERNAL_INPUT,
  ENV,
  KEYBOARD,
} from "./constants";
import { clampParameter } from "@/utils";

const isDevelopment = import.meta.env.DEV;
const isTest = import.meta.env.MODE === "test";

/**
 * Get environment-specific configuration
 * @returns {Object} Environment configuration object containing audio, MIDI, and other settings
 */
export function getEnvConfig() {
  if (isTest) return ENV.TEST;
  if (isDevelopment) return ENV.DEV;
  return ENV.PROD;
}

/**
 * Get audio configuration based on environment
 * @returns {Object} Audio configuration object with sampleRate, fftSize, and frequencyBinCount
 */
export function getAudioConfig() {
  const envConfig = getEnvConfig();
  return {
    sampleRate: envConfig.AUDIO.SAMPLE_RATE,
    fftSize: envConfig.AUDIO.FFT_SIZE,
    frequencyBinCount: envConfig.AUDIO.FREQUENCY_BIN_COUNT,
  };
}

/**
 * Get synth parameter value with validation and clamping
 * @param {string} paramPath - Dot-separated path to the parameter (e.g., "oscillator1.frequency")
 * @param {number} value - The value to validate and clamp
 * @returns {number} The clamped parameter value within the valid range
 */
export function getSynthParamValue(paramPath: string, value: number): number {
  const pathParts = paramPath.split(".");
  let param: Record<string, unknown> = SYNTH_PARAMS;

  for (const part of pathParts) {
    param = param[part] as Record<string, unknown>;
    if (!param) {
      console.warn(`Parameter path not found: ${paramPath}`);
      return value;
    }
  }
  if (param.MIN !== undefined && param.MAX !== undefined) {
    return clampParameter(value, param.MIN as number, param.MAX as number);
  }

  return value;
}

/**
 * Get default value for a synth parameter
 * @param {string} paramPath - Dot-separated path to the parameter (e.g., "oscillator1.frequency")
 * @returns {number} The default value for the parameter, or 0 if not found
 */
export function getSynthParamDefault(paramPath: string): number {
  const pathParts = paramPath.split(".");
  let param: Record<string, unknown> = SYNTH_PARAMS;

  for (const part of pathParts) {
    if (typeof param[part] === "object" && param[part] !== null) {
      param = param[part] as Record<string, unknown>;
    } else {
      console.warn(`Parameter path not found: ${paramPath}`);
      return 0;
    }
  }

  return (param.DEFAULT as number) ?? 0;
}

/**
 * Get audio context configuration
 * @returns {Object} Audio context configuration with sampleRate and latencyHint
 */
export function getAudioContextConfig() {
  const envConfig = getEnvConfig();
  return {
    sampleRate: envConfig.AUDIO.SAMPLE_RATE,
    latencyHint: envConfig.AUDIO.LATENCY_HINT,
  };
}

/**
 * Get analyzer configuration
 * @returns {Object} Analyzer configuration with fftSize, frequencyBinCount, and smoothingTimeConstant
 */
export function getAnalyzerConfig() {
  const envConfig = getEnvConfig();
  return {
    fftSize: envConfig.AUDIO.FFT_SIZE,
    frequencyBinCount: envConfig.AUDIO.FREQUENCY_BIN_COUNT,
    smoothingTimeConstant: envConfig.AUDIO.SMOOTHING_TIME_CONSTANT,
  };
}

/**
 * Get external input analyzer configuration
 * @returns {Object} External input analyzer configuration with fftSize, frequencyBinCount, and smoothingTimeConstant
 */
export function getExternalInputAnalyzerConfig() {
  const envConfig = getEnvConfig();
  return {
    fftSize: envConfig.AUDIO.EXTERNAL_INPUT_FFT_SIZE,
    frequencyBinCount: envConfig.AUDIO.EXTERNAL_INPUT_FREQUENCY_BIN_COUNT,
    smoothingTimeConstant: envConfig.AUDIO.SMOOTHING_TIME_CONSTANT,
  };
}

/**
 * Get octave range multiplier
 * @param {string} range - The octave range identifier
 * @returns {number} The multiplier value for the given range, or 1 if not found
 */
export function getOctaveRangeMultiplier(range: string): number {
  return MIDI.OCTAVE_RANGES[range as keyof typeof MIDI.OCTAVE_RANGES] ?? 1;
}

// ============================================================================
// KEYBOARD UTILITY FUNCTIONS
// ============================================================================

/**
 * Convert MIDI note number to note name
 * @param {number} midiNote - MIDI note number (0-127)
 * @returns {string} Note name with octave (e.g., "C4", "F#5")
 */
export function midiToNoteName(midiNote: number): string {
  const noteIndex = midiNote % 12;
  const octave = Math.floor(midiNote / 12) - 1;
  return `${MIDI.NOTE_NAMES[noteIndex]}${octave}`;
}

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

export {
  AUDIO,
  MIDI,
  SYNTH_PARAMS,
  ENVELOPE_MAPPING,
  FILTER_MAPPING,
  OSCILLATOR,
  EXTERNAL_INPUT,
  ENV,
  KEYBOARD,
};

export default {
  AUDIO,
  MIDI,
  SYNTH_PARAMS,
  ENVELOPE_MAPPING,
  FILTER_MAPPING,
  OSCILLATOR,
  EXTERNAL_INPUT,
  ENV,
  KEYBOARD,
  getEnvConfig,
  getAudioConfig,
  clampParameter,
  getSynthParamValue,
  getSynthParamDefault,
  getAudioContextConfig,
  getAnalyzerConfig,
  getExternalInputAnalyzerConfig,
  getOctaveRangeMultiplier,
  midiToNoteName,
  generateKeyboardKeys,
  calculateBlackKeyPosition,
};
