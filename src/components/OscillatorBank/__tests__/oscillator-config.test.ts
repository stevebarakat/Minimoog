import { describe, it, expect } from "vitest";
import { SYNTH_CONFIG } from "@/config/constants";
import { createFrequencyRange, createVolumeRange } from "@/store/types/synth";

describe("Synth Oscillators Configuration", () => {
  it("OSC3 supports reverse sawtooth waveform and OSC1/OSC2 do not", () => {
    const osc1Waveforms = SYNTH_CONFIG.OSCILLATORS.OSC1.WAVEFORM.VALUES;
    const osc2Waveforms = SYNTH_CONFIG.OSCILLATORS.OSC2.WAVEFORM.VALUES;
    const osc3Waveforms = SYNTH_CONFIG.OSCILLATORS.OSC3.WAVEFORM.VALUES;

    expect(osc3Waveforms.includes("rev_saw")).toBe(true);
    expect((osc1Waveforms as readonly string[]).includes("rev_saw")).toBe(
      false
    );
    expect((osc2Waveforms as readonly string[]).includes("rev_saw")).toBe(
      false
    );
  });

  it("OSC3 supports pulse3 waveform and OSC1/OSC2 do not", () => {
    const osc1Waveforms = SYNTH_CONFIG.OSCILLATORS.OSC1.WAVEFORM.VALUES;
    const osc2Waveforms = SYNTH_CONFIG.OSCILLATORS.OSC2.WAVEFORM.VALUES;
    const osc3Waveforms = SYNTH_CONFIG.OSCILLATORS.OSC3.WAVEFORM.VALUES;

    expect(osc3Waveforms.includes("pulse3")).toBe(true);
    expect((osc1Waveforms as readonly string[]).includes("pulse3")).toBe(false);
    expect((osc2Waveforms as readonly string[]).includes("pulse3")).toBe(false);
  });

  it("OSC1 is enabled by default, OSC2 and OSC3 are disabled by default", () => {
    expect(SYNTH_CONFIG.OSCILLATORS.OSC1.ENABLED.DEFAULT).toBe(true);
    expect(SYNTH_CONFIG.OSCILLATORS.OSC2.ENABLED.DEFAULT).toBe(false);
    expect(SYNTH_CONFIG.OSCILLATORS.OSC3.ENABLED.DEFAULT).toBe(false);
  });

  (
    Object.keys(
      SYNTH_CONFIG.OSCILLATORS
    ) as (keyof typeof SYNTH_CONFIG.OSCILLATORS)[]
  ).forEach((oscKey) => {
    it(`${oscKey} default config matches SYNTH_CONFIG`, () => {
      const oscConfig = SYNTH_CONFIG.OSCILLATORS[oscKey];
      const frequency = createFrequencyRange(oscConfig.FREQUENCY.DEFAULT);
      const volume = createVolumeRange(oscConfig.VOLUME.DEFAULT);

      expect(frequency).toBe(oscConfig.FREQUENCY.DEFAULT);
      expect(volume).toBe(oscConfig.VOLUME.DEFAULT);
      expect(typeof oscConfig.WAVEFORM.DEFAULT).toBe("string");
      expect(typeof oscConfig.ENABLED.DEFAULT).toBe("boolean");
    });

    it(`${oscKey} waveform values are valid`, () => {
      const oscConfig = SYNTH_CONFIG.OSCILLATORS[oscKey];

      // Check that default waveform is in the values array
      expect(oscConfig.WAVEFORM.VALUES).toContain(oscConfig.WAVEFORM.DEFAULT);

      // Check that all values are strings
      oscConfig.WAVEFORM.VALUES.forEach((waveform) => {
        expect(typeof waveform).toBe("string");
        expect(waveform.length).toBeGreaterThan(0);
      });
    });

    it(`${oscKey} frequency range is valid`, () => {
      const oscConfig = SYNTH_CONFIG.OSCILLATORS[oscKey];

      expect(oscConfig.FREQUENCY.MIN).toBeLessThanOrEqual(
        oscConfig.FREQUENCY.DEFAULT
      );
      expect(oscConfig.FREQUENCY.DEFAULT).toBeLessThanOrEqual(
        oscConfig.FREQUENCY.MAX
      );
      expect(oscConfig.FREQUENCY.MIN).toBe(-12);
      expect(oscConfig.FREQUENCY.MAX).toBe(12);
    });

    it(`${oscKey} volume range is valid`, () => {
      const oscConfig = SYNTH_CONFIG.OSCILLATORS[oscKey];

      expect(oscConfig.VOLUME.MIN).toBeLessThanOrEqual(
        oscConfig.VOLUME.DEFAULT
      );
      expect(oscConfig.VOLUME.DEFAULT).toBeLessThanOrEqual(
        oscConfig.VOLUME.MAX
      );
      expect(oscConfig.VOLUME.MIN).toBe(0);
      expect(oscConfig.VOLUME.MAX).toBe(10);
    });
  });
});
