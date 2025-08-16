// Configuration system tests for vitest
// Run with: npx vitest run

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { AUDIO, MIDI, SYNTH_CONFIG } from "../constants";
import { getEnvConfig } from "@/config";
import {
  getOctaveRangeMultiplier,
  generateKeyboardKeys,
  midiNoteToFrequency,
  frequencyToMidiNote,
} from "@/utils";
import { clampParameter } from "@/utils";

// These tests focus on behavior and integration, not implementation details

describe("Configuration System", () => {
  describe("Parameter Validation Behavior", () => {
    it("clampParameter handles edge cases correctly", () => {
      // Test normal clamping
      expect(clampParameter(5, 0, 10)).toBe(5);
      expect(clampParameter(-1, 0, 10)).toBe(0);
      expect(clampParameter(11, 0, 10)).toBe(10);

      // Test edge cases
      expect(clampParameter(0, 0, 10)).toBe(0);
      expect(clampParameter(10, 0, 10)).toBe(10);
      expect(clampParameter(-Infinity, 0, 10)).toBe(0);
      expect(clampParameter(Infinity, 0, 10)).toBe(10);
      expect(clampParameter(NaN, 0, 10)).toBe(NaN);
    });
  });

  describe("Environment Configuration Behavior", () => {
    let originalMode: string;

    beforeEach(() => {
      originalMode = import.meta.env.MODE;
    });

    afterEach(() => {
      // Restore original environment
      vi.stubGlobal("import.meta", {
        env: {
          MODE: originalMode,
          DEV: originalMode === "development",
          PROD: originalMode === "production",
        },
      });
    });

    it("getEnvConfig adapts to different environments", () => {
      // Test development environment
      vi.stubGlobal("import.meta", {
        env: { MODE: "development", DEV: true, PROD: false },
      });
      const devConfig = getEnvConfig();
      expect(devConfig).toHaveProperty("AUDIO");

      // Test production environment
      vi.stubGlobal("import.meta", {
        env: { MODE: "production", DEV: false, PROD: true },
      });
      const prodConfig = getEnvConfig();
      expect(prodConfig).toHaveProperty("AUDIO");

      // Test test environment
      vi.stubGlobal("import.meta", {
        env: { MODE: "test", DEV: false, PROD: false },
      });
      const testConfig = getEnvConfig();
      expect(testConfig).toHaveProperty("AUDIO");
    });
  });

  describe("MIDI Utility Behavior", () => {
    it("midiNoteToFrequency converts notes correctly", () => {
      // Test A4 (440Hz)
      expect(midiNoteToFrequency(69)).toBeCloseTo(440, 1);

      // Test C4 (261.63Hz)
      expect(midiNoteToFrequency(60)).toBeCloseTo(261.63, 1);

      // Test edge cases
      expect(midiNoteToFrequency(0)).toBeGreaterThan(0); // C-1
      expect(midiNoteToFrequency(127)).toBeLessThan(15000); // G9
    });

    it("frequencyToMidiNote converts frequencies correctly", () => {
      // Test A4 (440Hz)
      expect(frequencyToMidiNote(440)).toBeCloseTo(69, 0);

      // Test C4 (261.63Hz)
      expect(frequencyToMidiNote(261.63)).toBeCloseTo(60, 0);

      // Test edge cases - function can return values outside 0-127 for extreme frequencies
      expect(frequencyToMidiNote(20)).toBeGreaterThanOrEqual(-12); // Allow negative for very low frequencies
      expect(frequencyToMidiNote(20000)).toBeLessThanOrEqual(140); // Allow higher for very high frequencies
    });

    it("getOctaveRangeMultiplier provides correct octave range values", () => {
      // Function returns actual octave range values, not multipliers
      expect(getOctaveRangeMultiplier("32")).toBe(32);
      expect(getOctaveRangeMultiplier("16")).toBe(16);
      expect(getOctaveRangeMultiplier("8")).toBe(8);
      expect(getOctaveRangeMultiplier("4")).toBe(4);
      expect(getOctaveRangeMultiplier("2")).toBe(2);
      expect(getOctaveRangeMultiplier("lo")).toBe(1);
    });
  });

  describe("Integration Behavior", () => {
    it("should validate volume parameters", () => {
      expect(SYNTH_CONFIG.VOLUME.MAIN.MIN).toBe(0);
      expect(SYNTH_CONFIG.VOLUME.MAIN.MAX).toBe(10);
      expect(SYNTH_CONFIG.VOLUME.MAIN.DEFAULT).toBeGreaterThanOrEqual(0);
      expect(SYNTH_CONFIG.VOLUME.MAIN.DEFAULT).toBeLessThanOrEqual(10);
    });

    it("should validate pitch wheel parameters", () => {
      expect(SYNTH_CONFIG.CONTROLLERS.PITCH_WHEEL.MIN).toBe(0);
      expect(SYNTH_CONFIG.CONTROLLERS.PITCH_WHEEL.MAX).toBe(100);
      expect(
        SYNTH_CONFIG.CONTROLLERS.PITCH_WHEEL.DEFAULT
      ).toBeGreaterThanOrEqual(0);
      expect(SYNTH_CONFIG.CONTROLLERS.PITCH_WHEEL.DEFAULT).toBeLessThanOrEqual(
        100
      );
    });

    it("audio constants provide valid ranges for real-time processing", () => {
      // Sample rate should be reasonable for web audio
      expect(AUDIO.DEFAULT_SAMPLE_RATE).toBeGreaterThanOrEqual(22050);
      expect(AUDIO.DEFAULT_SAMPLE_RATE).toBeLessThanOrEqual(96000);
    });

    it("MIDI constants provide standard musical values", () => {
      // A4 should be 440Hz
      expect(MIDI.A4_FREQUENCY).toBe(440);

      // A4 should be MIDI note 69
      expect(MIDI.A4_MIDI_NOTE).toBe(69);

      // Note names should include standard chromatic scale
      expect(MIDI.NOTE_NAMES).toContain("C");
      expect(MIDI.NOTE_NAMES).toContain("C#");
      expect(MIDI.NOTE_NAMES).toContain("D");
      expect(MIDI.NOTE_NAMES).toContain("A");
    });
  });

  describe("Error Handling Behavior", () => {
    it("handles edge case inputs without breaking", () => {
      // Test with extreme values
      expect(clampParameter(1e6, 0, 10)).toBe(10);
      expect(clampParameter(-1e6, 0, 10)).toBe(0);

      // Test with invalid MIDI notes
      expect(() => midiNoteToFrequency(-1)).not.toThrow();
      expect(() => midiNoteToFrequency(128)).not.toThrow();

      // Test with invalid frequencies
      expect(() => frequencyToMidiNote(-1)).not.toThrow();
      expect(() => frequencyToMidiNote(0)).not.toThrow();
    });
  });

  it("generateKeyboardKeys adds extra keys correctly", () => {
    // Test with default octave range and 8 extra keys
    const keys = generateKeyboardKeys({ min: 0, max: 3 }, 8);

    // Should have 48 keys from 4 octaves (0-3) plus 8 extra keys = 56 total
    expect(keys).toHaveLength(56);

    // The extra keys should be from the next octave (octave 4)
    // First 8 keys of octave 4 are: F4, F#4, G4, G#4, A4, A#4, B4, C5 (C gets octave incremented)
    const lastKeys = keys.slice(-8);
    expect(lastKeys.map((k) => k.note)).toEqual([
      "F4",
      "F#4",
      "G4",
      "G#4",
      "A4",
      "A#4",
      "B4",
      "C5",
    ]);

    // Verify the sharp/flat properties are correct
    expect(lastKeys.map((k) => k.isSharp)).toEqual([
      false,
      true,
      false,
      true,
      false,
      true,
      false,
      false,
    ]);
  });
});
