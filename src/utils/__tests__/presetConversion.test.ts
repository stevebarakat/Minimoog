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

    // Check filter
    expect(storeFormat.filterCutoff).toBe(3.5);
    expect(storeFormat.filterEmphasis).toBe(6);
    expect(storeFormat.filterContourAmount).toBe(7);
    expect(storeFormat.filterAttack).toBe(0.1);
    expect(storeFormat.filterDecay).toBe(3);
    expect(storeFormat.filterSustain).toBe(4);
    expect(storeFormat.filterModulationOn).toBe(false);

    // Check loudness envelope
    expect(storeFormat.loudnessAttack).toBe(0.1);
    expect(storeFormat.loudnessDecay).toBe(3);
    expect(storeFormat.loudnessSustain).toBe(7);

    // Check oscillators
    expect(storeFormat.oscillator1?.waveform).toBe("sawtooth");
    expect(storeFormat.oscillator1?.frequency).toBe(0);
    expect(storeFormat.oscillator1?.range).toBe("32");
    expect(storeFormat.oscillator1?.enabled).toBe(true);

    // Check side panel
    expect(storeFormat.glideOn).toBe(false);
    expect(storeFormat.decaySwitchOn).toBe(false);
    expect(storeFormat.lfoRate).toBe(3);
    expect(storeFormat.lfoWaveform).toBe("triangle");
    expect(storeFormat.modWheel).toBe(40);

    // Check main volume
    expect(storeFormat.mainVolume).toBe(6);
  });

  it("should handle oscillators correctly", () => {
    const preset = presets.find((p) => p.id === "taurus-bass");
    if (!preset) throw new Error("Taurus Bass preset not found");
    const storeFormat = convertPresetToStoreFormat(preset);

    // Check that oscillator properties are preserved
    expect(storeFormat.oscillator1?.enabled).toBe(true);
    expect(storeFormat.oscillator1?.volume).toBe(9);
    expect(storeFormat.oscillator2?.enabled).toBe(true);
    expect(storeFormat.oscillator2?.volume).toBe(7);
    expect(storeFormat.oscillator3?.enabled).toBe(true);
    expect(storeFormat.oscillator3?.volume).toBe(5);
  });
});
