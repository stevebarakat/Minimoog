import { describe, it, expect, vi } from "vitest";
import { createSynthActions } from "../synthActions";
import { createInitialState } from "../../initialState";
import { SynthState } from "../../types/synth";
import {
  createMasterTuneRange,
  createGlideTimeRange,
  createModMixRange,
  createFilterCutoffRange,
  createFrequencyRange,
  createVolumeRange,
  createNoiseVolumeRange,
  createExternalInputVolumeRange,
} from "../../types/synth";

describe("synthActions", () => {
  describe("loadPreset", () => {
    it("should completely replace state with preset values", () => {
      const mockSet = vi.fn();
      const actions = createSynthActions(mockSet);

      const initialState = createInitialState();
      const preset = {
        masterTune: createMasterTuneRange(10),
        glideTime: createGlideTimeRange(5),
        modMix: createModMixRange(8),
        filterCutoff: createFilterCutoffRange(3),
        oscillator1: {
          waveform: "triangle" as const,
          frequency: createFrequencyRange(12),
          range: "16" as const,
          enabled: false,
          volume: createVolumeRange(5),
        },
        mixer: {
          osc1: { enabled: false, volume: createVolumeRange(0) },
          osc2: { enabled: true, volume: createVolumeRange(5) },
          osc3: { enabled: false, volume: createVolumeRange(0) },
          noise: {
            enabled: true,
            volume: createNoiseVolumeRange(8),
            noiseType: "pink" as const,
          },
          external: {
            enabled: false,
            volume: createExternalInputVolumeRange(0.001),
          },
        },
      };

      // Simulate the set function to capture the new state
      let capturedState: SynthState;
      mockSet.mockImplementation((stateUpdater) => {
        capturedState = stateUpdater(initialState);
      });

      actions.loadPreset(preset);

      // Verify that set was called
      expect(mockSet).toHaveBeenCalledTimes(1);

      // Verify that the state was completely replaced with preset values
      expect(capturedState!.masterTune).toBe(10);
      expect(capturedState!.glideTime).toBe(5);
      expect(capturedState!.modMix).toBe(8);
      expect(capturedState!.filterCutoff).toBe(3);
      expect(capturedState!.oscillator1).toEqual({
        waveform: "triangle",
        frequency: 12,
        range: "16",
        enabled: false,
        volume: 5,
      });
      expect(capturedState!.mixer).toEqual({
        osc1: { enabled: false, volume: 0 },
        osc2: { enabled: true, volume: 5 },
        osc3: { enabled: false, volume: 0 },
        noise: { enabled: true, volume: 8, noiseType: "pink" },
        external: { enabled: false, volume: 0.001 },
      });

      // Verify that essential non-preset properties are preserved
      expect(capturedState!.audioContext).toBe(initialState.audioContext);
      expect(capturedState!.activeKeys).toBe(initialState.activeKeys);
    });

    it("should completely replace state with preset values only", () => {
      const mockSet = vi.fn();
      const actions = createSynthActions(mockSet);

      const initialState = createInitialState();
      const preset = {
        masterTune: createMasterTuneRange(5),
      };

      let capturedState: SynthState;
      mockSet.mockImplementation((stateUpdater) => {
        capturedState = stateUpdater(initialState);
      });

      actions.loadPreset(preset);

      // Verify that the preset property was set correctly
      expect(capturedState!.masterTune).toBe(5);

      // Verify that essential non-preset properties are preserved
      expect(capturedState!.audioContext).toBe(initialState.audioContext);
      expect(capturedState!.activeKeys).toBe(initialState.activeKeys);
    });
  });
});
