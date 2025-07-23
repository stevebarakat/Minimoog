// Configuration system tests for vitest
// Run with: npx vitest run

import { describe, it, expect } from "vitest";
import {
  AUDIO,
  MIDI,
  SYNTH_PARAMS,
  UI,
  FEATURES,
  clampParameter,
  getSynthParamValue,
  getSynthParamDefault,
  isFeatureEnabled,
  getAudioConfig,
  getEnvConfig,
  getAnalyzerConfig,
  getExternalInputAnalyzerConfig,
} from "../index";

// These tests are meant to be run with vitest, not jest or mocha.

describe("Configuration System", () => {
  describe("Constants", () => {
    it("AUDIO constants are correct", () => {
      expect(AUDIO.DEFAULT_SAMPLE_RATE).toBe(44100);
      expect(AUDIO.DEFAULT_FFT_SIZE).toBe(256);
      expect(AUDIO.DELAY.DEFAULT_TIME).toBe(0.3);
    });
    it("MIDI constants are correct", () => {
      expect(MIDI.A4_FREQUENCY).toBe(440);
      expect(MIDI.A4_MIDI_NOTE).toBe(69);
      expect(MIDI.NOTE_NAMES).toContain("C#");
    });
    it("SYNTH_PARAMS constants are correct", () => {
      expect(SYNTH_PARAMS.VOLUME.MAX).toBe(10);
      expect(SYNTH_PARAMS.PITCH_WHEEL.DEFAULT).toBe(50);
      expect(SYNTH_PARAMS.FILTER.CUTOFF.MIN).toBe(-4);
    });
    it("UI constants are correct", () => {
      expect(UI.ANIMATION_FRAME_DELAY).toBe(16);
      expect(UI.TUNER.A440_LABEL).toBe("A-440");
    });
    it("Feature flags are correct", () => {
      expect(FEATURES.AUDIO.ENABLE_OVERSAMPLING).toBe(true);
    });
  });

  describe("Utility Functions", () => {
    it("clampParameter clamps values", () => {
      expect(clampParameter(5, 0, 10)).toBe(5);
      expect(clampParameter(-1, 0, 10)).toBe(0);
      expect(clampParameter(11, 0, 10)).toBe(10);
    });
    it("getSynthParamValue clamps and returns correct value", () => {
      expect(getSynthParamValue("VOLUME", 12)).toBe(10);
      expect(getSynthParamValue("FILTER.CUTOFF", -10)).toBe(-4);
    });
    it("getSynthParamDefault returns correct default", () => {
      expect(getSynthParamDefault("VOLUME")).toBe(5);
      expect(getSynthParamDefault("FILTER.CUTOFF")).toBe(0);
    });
    it("isFeatureEnabled returns correct value", () => {
      expect(isFeatureEnabled("AUDIO.ENABLE_OVERSAMPLING")).toBe(true);
      expect(isFeatureEnabled("UI.ENABLE_TOOLTIPS")).toBe(true);
      expect(isFeatureEnabled("PERFORMANCE.ENABLE_LAZY_LOADING")).toBe(true);
      expect(isFeatureEnabled("NON_EXISTENT.PATH")).toBe(false);
    });
  });

  describe("Environment Switching", () => {
    it("getEnvConfig returns an object with AUDIO and PERFORMANCE keys", () => {
      const envConfig = getEnvConfig();
      expect(envConfig).toHaveProperty("AUDIO");
      expect(envConfig).toHaveProperty("PERFORMANCE");
    });
    it("getAudioConfig returns expected keys", () => {
      const audioConfig = getAudioConfig();
      expect(audioConfig).toHaveProperty("DEFAULT_SAMPLE_RATE");
      expect(audioConfig).toHaveProperty("DEFAULT_FFT_SIZE");
    });
    it("getAnalyzerConfig returns expected keys", () => {
      const analyzerConfig = getAnalyzerConfig();
      expect(analyzerConfig).toHaveProperty("fftSize");
      expect(analyzerConfig).toHaveProperty("frequencyBinCount");
    });
    it("getExternalInputAnalyzerConfig returns expected keys", () => {
      const extConfig = getExternalInputAnalyzerConfig();
      expect(extConfig).toHaveProperty("fftSize");
      expect(extConfig).toHaveProperty("frequencyBinCount");
    });
  });
});
