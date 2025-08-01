import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useURLSync } from "../useMinimoogURLSync";
import type { OscillatorWaveform, OscillatorRange } from "@/types";

vi.mock("@/utils", () => ({
  loadStateFromURL: vi.fn(() => ({ test: "state" })),
}));
vi.mock("@/hooks/useURLSync", () => ({
  useURLSync: vi.fn(),
  setLoadingFromURL: vi.fn(),
}));

import * as synthStore from "@/store/synthStore";
import { loadStateFromURL } from "@/utils";
import { setLoadingFromURL } from "@/hooks/useURLSync";

describe("useMinimoogURLSync", () => {
  let loadPreset: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    loadPreset = vi.fn();
    // Provide a more complete mock state for useSynthStore
    vi.spyOn(synthStore, "useSynthStore").mockImplementation((selector) => {
      const triangle: OscillatorWaveform = "triangle";
      const sawtooth: OscillatorWaveform = "sawtooth";
      const pulse1: OscillatorWaveform = "pulse1";
      const range16: OscillatorRange = "16";
      const noiseType = "white" as const;
      const lfoWaveform = "triangle" as const;
      const mockState = {
        loadPreset,
        isDisabled: false,
        activeKeys: null,

        pitchWheel: 0,
        modWheel: 0,
        masterTune: 0,
        oscillator1: {
          waveform: triangle,
          frequency: 440,
          range: range16,
          enabled: true,
        },
        oscillator2: {
          waveform: sawtooth,
          frequency: 440,
          range: range16,
          enabled: true,
        },
        oscillator3: {
          waveform: pulse1,
          frequency: 440,
          range: range16,
          enabled: true,
        },
        mixer: {
          osc1: { enabled: true, volume: 5 },
          osc2: { enabled: true, volume: 5 },
          osc3: { enabled: true, volume: 5 },
          noise: { enabled: true, volume: 5, noiseType },
          external: { enabled: true, volume: 5 },
        },
        mainVolume: 0,
        isMainActive: true,
        glideOn: false,
        glideTime: 0,
        filterAttack: 0,
        filterDecay: 0,
        filterSustain: 0,
        filterCutoff: 0,
        filterEmphasis: 0,
        filterContourAmount: 0,
        filterModulationOn: false,
        keyboardControl1: false,
        keyboardControl2: false,
        oscillatorModulationOn: false,
        lfoWaveform,
        lfoRate: 0,
        osc3Control: false,
        modMix: 0,
        osc3FilterEgSwitch: false,
        noiseLfoSwitch: false,
        loudnessAttack: 0,
        loudnessDecay: 0,
        loudnessSustain: 0,
        decaySwitchOn: false,
        tunerOn: false,
        auxOutput: { enabled: false, volume: 0 },
        setIsDisabled: () => {},
        setActiveKeys: () => {},

        setPitchWheel: () => {},
        setModWheel: () => {},
        setMasterTune: () => {},
        setOscillator1: () => {},
        setOscillator2: () => {},
        setOscillator3: () => {},
        setMixerSource: () => {},
        setMixerNoise: () => {},
        setMixerExternal: () => {},
        setMainVolume: () => {},
        setIsMainActive: () => {},
        setGlideOn: () => {},
        setGlideTime: () => {},
        setFilterEnvelope: () => {},
        setFilterCutoff: () => {},
        setFilterEmphasis: () => {},
        setFilterContourAmount: () => {},
        setFilterModulationOn: () => {},
        setKeyboardControl1: () => {},
        setKeyboardControl2: () => {},
        setOscillatorModulationOn: () => {},
        setLfoWaveform: () => {},
        setLfoRate: () => {},
        setOsc3Control: () => {},
        setModMix: () => {},
        setOsc3FilterEgSwitch: () => {},
        setNoiseLfoSwitch: () => {},
        setLoudnessEnvelope: () => {},
        setDecaySwitchOn: () => {},
        setTunerOn: () => {},
        setAuxOutput: () => {},
        updateURL: () => {},
      };
      return selector ? selector(mockState) : mockState;
    });
    vi.mocked(loadStateFromURL).mockClear();
    vi.mocked(setLoadingFromURL).mockClear();
    loadPreset.mockClear();
  });

  it("loads state from URL without errors", () => {
    expect(() => {
      renderHook(() => useURLSync());
    }).not.toThrow();
  });
});
