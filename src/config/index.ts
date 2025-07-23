/**
 * Configuration system for the Minimoog synthesizer application
 * Provides environment-based access to constants and utility functions
 */

import {
  AUDIO,
  MIDI,
  SYNTH_PARAMS,
  UI,
  ENVELOPE_MAPPING,
  FILTER_MAPPING,
  OSCILLATOR,
  EXTERNAL_INPUT,
  ENV,
  FEATURES,
  PERFORMANCE,
} from "./constants";

const isDevelopment = import.meta.env.DEV;
const isTest = import.meta.env.MODE === "test";

/**
 * Get environment-specific configuration
 */
export function getEnvConfig() {
  if (isTest) return ENV.TEST;
  if (isDevelopment) return ENV.DEV;
  return ENV.PROD;
}

/**
 * Get audio configuration for current environment
 */
export function getAudioConfig() {
  const envConfig = getEnvConfig();
  return {
    ...AUDIO,
    ...envConfig.AUDIO,
  };
}

/**
 * Get performance configuration for current environment
 */
export function getPerformanceConfig() {
  const envConfig = getEnvConfig();
  return {
    ...PERFORMANCE,
    ...envConfig.PERFORMANCE,
  };
}

/**
 * Get feature flags for current environment
 */
export function getFeatureFlags() {
  return FEATURES;
}

/**
 * Get a parameter value within its defined range
 */
export function clampParameter(
  value: number,
  min: number,
  max: number
): number {
  return Math.max(min, Math.min(max, value));
}

/**
 * Get a synth parameter value within its defined range
 */
export function getSynthParamValue(paramPath: string, value: number): number {
  const path = paramPath.split(".");
  let current: Record<string, unknown> = SYNTH_PARAMS;

  for (const key of path) {
    if (current[key] === undefined) {
      console.warn(`Parameter path not found: ${paramPath}`);
      return value;
    }
    current = current[key] as Record<string, unknown>;
  }

  if (current.MIN !== undefined && current.MAX !== undefined) {
    return clampParameter(value, current.MIN as number, current.MAX as number);
  }

  return value;
}

/**
 * Get default value for a synth parameter
 */
export function getSynthParamDefault(paramPath: string): number {
  const path = paramPath.split(".");
  let current: Record<string, unknown> = SYNTH_PARAMS;

  for (const key of path) {
    if (current[key] === undefined) {
      console.warn(`Parameter path not found: ${paramPath}`);
      return 0;
    }
    current = current[key] as Record<string, unknown>;
  }

  return (current.DEFAULT as number) ?? 0;
}

/**
 * Check if a feature is enabled
 */
export function isFeatureEnabled(featurePath: string): boolean {
  const path = featurePath.split(".");
  let current: Record<string, unknown> = FEATURES;

  for (const key of path) {
    if (current[key] === undefined) {
      console.warn(`Feature path not found: ${featurePath}`);
      return false;
    }
    current = current[key] as Record<string, unknown>;
  }

  return Boolean(current);
}

/**
 * Get audio context configuration
 */
export function getAudioContextConfig() {
  const audioConfig = getAudioConfig();
  return {
    sampleRate: audioConfig.DEFAULT_SAMPLE_RATE,
    latencyHint: "interactive" as const,
  };
}

/**
 * Get analyzer node configuration
 */
export function getAnalyzerConfig() {
  const audioConfig = getAudioConfig();
  return {
    fftSize: audioConfig.DEFAULT_FFT_SIZE,
    frequencyBinCount: audioConfig.DEFAULT_FREQUENCY_BIN_COUNT,
    smoothingTimeConstant: 0.8,
  };
}

/**
 * Get external input analyzer configuration
 */
export function getExternalInputAnalyzerConfig() {
  return {
    fftSize: AUDIO.EXTERNAL_INPUT_FFT_SIZE,
    frequencyBinCount: AUDIO.EXTERNAL_INPUT_FREQUENCY_BIN_COUNT,
    smoothingTimeConstant: 0.8,
  };
}

/**
 * Convert MIDI note number to frequency
 */
export function midiNoteToFrequency(midiNote: number): number {
  return MIDI.A4_FREQUENCY * Math.pow(2, (midiNote - MIDI.A4_MIDI_NOTE) / 12);
}

/**
 * Convert frequency to MIDI note number
 */
export function frequencyToMidiNote(frequency: number): number {
  return Math.round(
    12 * Math.log2(frequency / MIDI.A4_FREQUENCY) + MIDI.A4_MIDI_NOTE
  );
}

/**
 * Get octave range multiplier
 */
export function getOctaveRangeMultiplier(
  range: keyof typeof MIDI.OCTAVE_RANGES
): number {
  return MIDI.OCTAVE_RANGES[range];
}

export {
  AUDIO,
  MIDI,
  SYNTH_PARAMS,
  UI,
  ENVELOPE_MAPPING,
  FILTER_MAPPING,
  OSCILLATOR,
  EXTERNAL_INPUT,
  ENV,
  FEATURES,
  PERFORMANCE,
};

export default {
  AUDIO,
  MIDI,
  SYNTH_PARAMS,
  UI,
  ENVELOPE_MAPPING,
  FILTER_MAPPING,
  OSCILLATOR,
  EXTERNAL_INPUT,
  ENV,
  FEATURES,
  PERFORMANCE,
  getEnvConfig,
  getAudioConfig,
  getPerformanceConfig,
  getFeatureFlags,
  clampParameter,
  getSynthParamValue,
  getSynthParamDefault,
  isFeatureEnabled,
  getAudioContextConfig,
  getAnalyzerConfig,
  getExternalInputAnalyzerConfig,
  midiNoteToFrequency,
  frequencyToMidiNote,
  getOctaveRangeMultiplier,
};
