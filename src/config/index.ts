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

export function isDevMode(): boolean {
  return isDevelopment;
}

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
