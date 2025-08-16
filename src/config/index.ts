/**
 * Configuration system for the Minimoog synthesizer application
 * Provides environment-based access to constants and utility functions
 */

import {
  AUDIO,
  MIDI,
  SYNTH_CONFIG,
  ENVELOPE_MAPPING,
  FILTER_MAPPING,
  OSCILLATOR,
  EXTERNAL_INPUT,
  ENV,
  KEYBOARD,
  DEFAULT_SYNTH_STATE,
  DEFAULT_PRESET_ID,
} from "./constants";
const isDevelopment = import.meta.env.DEV;
const isTest = import.meta.env.MODE === "test";

/**
 * Check if the application is running in development mode
 * @returns {boolean} True if in development mode, false otherwise
 */
export function isDevMode(): boolean {
  return isDevelopment;
}

/**
 * Get environment-specific configuration
 * @returns {Object} Environment configuration object containing audio, MIDI, and other settings
 */
export function getEnvConfig() {
  if (isTest) return ENV.TEST;
  if (isDevelopment) return ENV.DEV;
  return ENV.PROD;
}

// Re-exported from constants.ts for convenience
export {
  AUDIO,
  MIDI,
  SYNTH_CONFIG,
  ENVELOPE_MAPPING,
  FILTER_MAPPING,
  OSCILLATOR,
  EXTERNAL_INPUT,
  ENV,
  KEYBOARD,
  DEFAULT_SYNTH_STATE,
  DEFAULT_PRESET_ID,
};


