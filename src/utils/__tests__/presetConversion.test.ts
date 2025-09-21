import { convertPresetToStoreFormat } from "../presetConversionUtils";
import { presets } from "@/data/presets";
import { describe, it, expect } from "vitest";

describe("convertPresetToStoreFormat", () => {
  it("should convert a preset to store format", () => {
    const preset = presets.find((p) => p.id === "taurus-bass");
    if (!preset) throw new Error("Taurus Bass preset not found");
    const storeFormat = convertPresetToStoreFormat(preset);

    // Check controllers
    expect(storeFormat.masterTune).toBe(0);
    expect(storeFormat.glideTime).toBe(0);
    expect(storeFormat.modMix).toBe(2);
    expect(storeFormat.osc3FilterEgSwitch).toBe(true);
    expect(storeFormat.noiseLfoSwitch).toBe(false);

    // Check filter - updated to match actual preset values
    expect(storeFormat.filterCutoff).toBe(2.8);
    expect(storeFormat.filterEmphasis).toBe(7.5);
    expect(storeFormat.filterContourAmount).toBe(8.5);
    expect(storeFormat.filterAttack).toBe(0.05);
    expect(storeFormat.filterDecay).toBe(4.5);
    expect(storeFormat.filterSustain).toBe(6.5);
    expect(storeFormat.filterModulationOn).toBe(false);

    // Check loudness envelope - updated to match actual preset values
    expect(storeFormat.loudnessAttack).toBe(0.05);
    expect(storeFormat.loudnessDecay).toBe(4.0);
    expect(storeFormat.loudnessSustain).toBe(8.5);

    // Check oscillators
    expect(storeFormat.oscillator1?.waveform).toBe("sawtooth");
    expect(storeFormat.oscillator1?.frequency).toBe(0);
    expect(storeFormat.oscillator1?.range).toBe("32");
    expect(storeFormat.oscillator1?.enabled).toBe(true);

    // Check side panel - updated to match actual preset values
    expect(storeFormat.glideOn).toBe(false);
    expect(storeFormat.decaySwitchOn).toBe(false);
    expect(storeFormat.lfoRate).toBe(2.5);
    expect(storeFormat.lfoWaveform).toBe("triangle");
    expect(storeFormat.modWheel).toBe(35);

    // Check main volume - updated to match actual preset values
    expect(storeFormat.mainVolume).toBe(7.0);
  });

  it("should handle oscillators correctly", () => {
    const preset = presets.find((p) => p.id === "taurus-bass");
    if (!preset) throw new Error("Taurus Bass preset not found");
    const storeFormat = convertPresetToStoreFormat(preset);

    // Check that oscillator properties are preserved - updated to match actual preset values
    expect(storeFormat.oscillator1?.enabled).toBe(true);
    expect(storeFormat.oscillator1?.volume).toBe(10);
    expect(storeFormat.oscillator2?.enabled).toBe(true);
    expect(storeFormat.oscillator2?.volume).toBe(8);
    expect(storeFormat.oscillator3?.enabled).toBe(true);
    expect(storeFormat.oscillator3?.volume).toBe(6);
  });
});

describe("presets array environment behavior", () => {
  it("should handle Starter preset based on environment", () => {
    const starterPreset = presets.find((p) => p.id === "starter-preset");
    const isDevelopment = process.env.NODE_ENV === "development";

    if (isDevelopment) {
      // In development mode, the Starter preset should be present
      expect(starterPreset).toBeDefined();
      expect(starterPreset?.name).toBe("Starter Preset");
      expect(starterPreset?.category).toBe("Starter");
    } else {
      // In production mode, the Starter preset should be hidden
      expect(starterPreset).toBeUndefined();
    }
  });

  it("should have valid preset structure for all presets", () => {
    // Test that all presets have the required structure
    presets.forEach((preset) => {
      expect(preset.controllers).toBeDefined();
      expect(preset.filter).toBeDefined();
      expect(preset.loudness).toBeDefined();
      expect(preset.oscillators).toBeDefined();
      expect(preset.sidePanel).toBeDefined();
      expect(preset.mainVolume).toBeDefined();
    });
  });

  it("should have presets with valid categories", () => {
    // Test that all presets have valid categories - updated to include Experimental
    const validCategories = ["Lead", "Pad", "Bass", "Experimental"];
    presets.forEach((preset) => {
      expect(validCategories).toContain(preset.category);
    });
  });
});
