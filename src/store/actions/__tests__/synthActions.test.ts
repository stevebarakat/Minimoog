import { describe, it, expect, vi } from "vitest";
import { createSynthActions } from "../synthActions";
import { createInitialState } from "../../state/initialState";

describe("synthActions", () => {
  describe("loadPreset", () => {
    it("should completely replace state with preset values", () => {
      const mockSet = vi.fn();
      const actions = createSynthActions(mockSet);

      const initialState = createInitialState();
      const preset = {
        masterTune: 10,
        glideTime: 5,
        modMix: 8,
        filterCutoff: 7,
        oscillator1: {
          waveform: "triangle" as const,
          frequency: 12,
          range: "16" as const,
          enabled: false,
        },
        mixer: {
          osc1: { enabled: false, volume: 0 },
          osc2: { enabled: true, volume: 5 },
          osc3: { enabled: false, volume: 0 },
          noise: { enabled: true, volume: 8, noiseType: "pink" as const },
          external: { enabled: false, volume: 0 },
        },
      };

      // Simulate the set function to capture the new state
      let capturedState: any;
      mockSet.mockImplementation((stateUpdater) => {
        capturedState = stateUpdater(initialState);
      });

      actions.loadPreset(preset);

      // Verify that set was called
      expect(mockSet).toHaveBeenCalledTimes(1);

      // Verify that the state was completely replaced with preset values
      expect(capturedState.masterTune).toBe(10);
      expect(capturedState.glideTime).toBe(5);
      expect(capturedState.modMix).toBe(8);
      expect(capturedState.filterCutoff).toBe(7);
      expect(capturedState.oscillator1).toEqual({
        waveform: "triangle",
        frequency: 12,
        range: "16",
        enabled: false,
      });
      expect(capturedState.mixer).toEqual({
        osc1: { enabled: false, volume: 0 },
        osc2: { enabled: true, volume: 5 },
        osc3: { enabled: false, volume: 0 },
        noise: { enabled: true, volume: 8, noiseType: "pink" },
        external: { enabled: false, volume: 0 },
      });

      // Verify that essential non-preset properties are preserved
      expect(capturedState.isDisabled).toBe(initialState.isDisabled);
      expect(capturedState.activeKeys).toBe(initialState.activeKeys);
    });

    it("should completely replace state with preset values only", () => {
      const mockSet = vi.fn();
      const actions = createSynthActions(mockSet);

      const initialState = createInitialState();
      const preset = {
        masterTune: 5,
      };

      let capturedState: any;
      mockSet.mockImplementation((stateUpdater) => {
        capturedState = stateUpdater(initialState);
      });

      actions.loadPreset(preset);

      // Verify that only the specified preset property was set
      expect(capturedState.masterTune).toBe(5);

      // Verify that unspecified properties are undefined (complete replacement)
      expect(capturedState.glideTime).toBeUndefined();
      expect(capturedState.modMix).toBeUndefined();
      expect(capturedState.oscillator1).toBeUndefined();
      expect(capturedState.mixer).toBeUndefined();

      // Verify that essential non-preset properties are preserved
      expect(capturedState.isDisabled).toBe(initialState.isDisabled);
      expect(capturedState.activeKeys).toBe(initialState.activeKeys);
    });
  });
});
