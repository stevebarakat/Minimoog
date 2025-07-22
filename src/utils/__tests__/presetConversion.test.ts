import { convertPresetToStoreFormat } from "../presetConversion";
import { presets } from "@/data/presets";
import { describe, it, expect } from "vitest";

describe("convertPresetToStoreFormat", () => {
  it("should convert a preset to store format", () => {
    const preset = presets.find((p) => p.id === "fat-bass");
    if (!preset) throw new Error("Fat Bass preset not found");
    const storeFormat = convertPresetToStoreFormat(preset);

    // Check controllers
    expect(storeFormat.masterTune).toBe(5);
    expect(storeFormat.glideTime).toBe(0);
    expect(storeFormat.modMix).toBe(2);
    expect(storeFormat.osc3FilterEgSwitch).toBe(true);
    expect(storeFormat.noiseLfoSwitch).toBe(false);

    // Check filter
    expect(storeFormat.filterCutoff).toBe(3);
    expect(storeFormat.filterEmphasis).toBe(7);
    expect(storeFormat.filterContourAmount).toBe(8);
    expect(storeFormat.filterAttack).toBe(0.1);
    expect(storeFormat.filterDecay).toBe(4);
    expect(storeFormat.filterSustain).toBe(3);
    expect(storeFormat.filterModulationOn).toBe(false);

    // Check loudness envelope
    expect(storeFormat.loudnessAttack).toBe(0.1);
    expect(storeFormat.loudnessDecay).toBe(3);
    expect(storeFormat.loudnessSustain).toBe(6);

    // Check oscillators
    expect(storeFormat.oscillator1?.waveform).toBe("sawtooth");
    expect(storeFormat.oscillator1?.frequency).toBe(0);
    expect(storeFormat.oscillator1?.range).toBe("32");
    expect(storeFormat.oscillator1?.enabled).toBe(true);

    // Check side panel
    expect(storeFormat.glideOn).toBe(false);
    expect(storeFormat.decaySwitchOn).toBe(false);
    expect(storeFormat.lfoRate).toBe(5);
    expect(storeFormat.lfoWaveform).toBe("triangle");
    expect(storeFormat.modWheel).toBe(50);

    // Check main volume
    expect(storeFormat.mainVolume).toBe(5);
  });

  it("should handle oscillators correctly", () => {
    const preset = presets.find((p) => p.id === "fat-bass");
    if (!preset) throw new Error("Fat Bass preset not found");
    const storeFormat = convertPresetToStoreFormat(preset);

    // Check that oscillator properties are preserved
    expect(storeFormat.mixer?.osc1.enabled).toBe(true);
    expect(storeFormat.mixer?.osc1.volume).toBe(10);
    expect(storeFormat.mixer?.osc2.enabled).toBe(true);
    expect(storeFormat.mixer?.osc2.volume).toBe(8);
    expect(storeFormat.mixer?.osc3.enabled).toBe(true);
    expect(storeFormat.mixer?.osc3.volume).toBe(6);
  });
});
