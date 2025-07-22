import { presetToURL } from "../presetToURL";
import { presets } from "@/data/presets";

describe("presetToURL", () => {
  it("should generate a URL for a preset", () => {
    const preset = presets.find((p) => p.id === "lead-solo");
    if (!preset) throw new Error("Lead Solo preset not found");
    const url = presetToURL(preset, "http://localhost:3000");

    expect(url).toContain("http://localhost:3000?");
    expect(url).toContain("osc1_waveform=sawtooth");
    expect(url).toContain("osc1_freq=0");
    expect(url).toContain("osc1_range=8");
    expect(url).toContain("osc1_enabled=true");
  });

  it("should include all preset parameters in the URL", () => {
    const preset = presets.find((p) => p.id === "warm-pad");
    if (!preset) throw new Error("Warm Pad preset not found");

    const url = presetToURL(preset, "http://localhost:3000");

    // Check for key parameters from the warm-pad preset
    expect(url).toContain("osc1_waveform=triangle");
    expect(url).toContain("osc1_range=8");
    expect(url).toContain("osc2_waveform=sawtooth");
    expect(url).toContain("filter_cutoff=4");
    expect(url).toContain("glide_on=true");
    expect(url).toContain("decay_switch=true");
  });

  it("should use window.location.origin as default base URL", () => {
    const preset = presets.find((p) => p.id === "fat-bass");
    if (!preset) throw new Error("Fat Bass preset not found");
    const url = presetToURL(preset);

    expect(url).toContain("?");
    expect(url).toContain("osc1_waveform=sawtooth");
  });

  it("should generate different URLs for different presets", () => {
    const fatBass = presets.find((p) => p.id === "fat-bass");
    const leadSolo = presets.find((p) => p.id === "lead-solo");

    if (!fatBass || !leadSolo) throw new Error("Presets not found");

    const fatBassUrl = presetToURL(fatBass, "http://localhost:3000");
    const leadSoloUrl = presetToURL(leadSolo, "http://localhost:3000");

    expect(fatBassUrl).not.toBe(leadSoloUrl);
  });
});
