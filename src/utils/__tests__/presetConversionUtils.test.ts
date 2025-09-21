import { describe, it, expect } from "vitest";
import { convertPresetToStoreFormat } from "../presetConversionUtils";
import { Preset } from "@/data/presets";
import {
  createVolumeRange,
  createNoiseVolumeRange,
  createExternalInputVolumeRange,
} from "@/store/types/synth";

describe("presetConversionUtils", () => {
  describe("convertPresetToStoreFormat", () => {
    it("should convert effects when preset has delay and reverb", () => {
      const preset: Preset = {
        id: "test-preset",
        name: "Test Preset",
        description: "Test preset with effects",
        category: "Test",
        controllers: {
          tune: 5,
          glideTime: 3,
          modMix: 4,
          osc3FilterEgSwitch: false,
          noiseLfoSwitch: false,
          oscillatorModulationOn: false,
          osc3Control: false,
          keyboardControl1: false,
          keyboardControl2: false,
        },
        filter: {
          filterCutoff: 2,
          filterEmphasis: 4,
          filterContourAmount: 6,
          filterAttack: 2,
          filterDecay: 5,
          filterSustain: 7,
          filterModulationOn: false,
        },
        loudness: {
          loudnessAttack: 1,
          loudnessDecay: 4,
          loudnessSustain: 6,
        },
        oscillators: {
          oscillator1: {
            waveform: "triangle",
            frequency: 0,
            range: "8",
            enabled: true,
            volume: createVolumeRange(8),
          },
          oscillator2: {
            waveform: "sawtooth",
            frequency: -7,
            range: "8",
            enabled: true,
            volume: createVolumeRange(6),
          },
          oscillator3: {
            waveform: "triangle",
            frequency: -12,
            range: "8",
            enabled: false,
            volume: createVolumeRange(0),
          },
          mixer: {
            noise: {
              enabled: false,
              volume: createNoiseVolumeRange(0),
              noiseType: "white",
            },
            external: {
              enabled: false,
              volume: createExternalInputVolumeRange(0),
            },
          },
        },
        sidePanel: {
          glideOn: true,
          decaySwitchOn: true,
          lfoRate: 2,
          lfoWaveform: "triangle",
          modWheel: 50,
        },
        mainVolume: 7,
        effects: {
          volume: 5,
          delay: {
            enabled: true,
            mix: 6,
            time: 4,
            feedback: 5,
          },
          reverb: {
            enabled: true,
            mix: 8,
            tone: 6,
          },
        },
      };

      const result = convertPresetToStoreFormat(preset);

      // Verify effects are converted
      expect(result.effectsVolume).toBe(5);

      expect(result.delay).toBeDefined();
      expect(result.delay?.enabled).toBe(true);
      expect(result.delay?.mix).toBe(6);
      expect(result.delay?.time).toBe(4);
      expect(result.delay?.feedback).toBe(5);

      expect(result.reverb).toBeDefined();
      expect(result.reverb?.enabled).toBe(true);
      expect(result.reverb?.mix).toBe(8);
      expect(result.reverb?.tone).toBe(6);
    });

    it("should handle presets without effects", () => {
      const preset: Preset = {
        id: "test-preset-no-effects",
        name: "Test Preset No Effects",
        description: "Test preset without effects",
        category: "Test",
        controllers: {
          tune: 5,
          glideTime: 3,
          modMix: 4,
          osc3FilterEgSwitch: false,
          noiseLfoSwitch: false,
          oscillatorModulationOn: false,
          osc3Control: false,
          keyboardControl1: false,
          keyboardControl2: false,
        },
        filter: {
          filterCutoff: 2,
          filterEmphasis: 4,
          filterContourAmount: 6,
          filterAttack: 2,
          filterDecay: 5,
          filterSustain: 7,
          filterModulationOn: false,
        },
        loudness: {
          loudnessAttack: 1,
          loudnessDecay: 4,
          loudnessSustain: 6,
        },
        oscillators: {
          oscillator1: {
            waveform: "triangle",
            frequency: 0,
            range: "8",
            enabled: true,
            volume: createVolumeRange(8),
          },
          oscillator2: {
            waveform: "sawtooth",
            frequency: -7,
            range: "8",
            enabled: true,
            volume: createVolumeRange(6),
          },
          oscillator3: {
            waveform: "triangle",
            frequency: -12,
            range: "8",
            enabled: false,
            volume: createVolumeRange(0),
          },
          mixer: {
            noise: {
              enabled: false,
              volume: createNoiseVolumeRange(0),
              noiseType: "white",
            },
            external: {
              enabled: false,
              volume: createExternalInputVolumeRange(0),
            },
          },
        },
        sidePanel: {
          glideOn: true,
          decaySwitchOn: true,
          lfoRate: 2,
          lfoWaveform: "triangle",
          modWheel: 50,
        },
        mainVolume: 7,
      };

      const result = convertPresetToStoreFormat(preset);

      // Verify effects are not present
      expect(result.effectsVolume).toBeUndefined();
      expect(result.delay).toBeUndefined();
      expect(result.reverb).toBeUndefined();
    });
  });
});
