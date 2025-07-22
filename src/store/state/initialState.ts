import { SynthState } from "../types/synth";
import { getPresetById } from "@/data/presets";
import { convertPresetToStoreFormat } from "@/utils/presetConversion";

export function createInitialState(): Omit<
  SynthState,
  | "setActiveKeys"
  | "setKeyboardRef"
  | "setPitchWheel"
  | "setModWheel"
  | "setOscillator1"
  | "setOscillator2"
  | "setOscillator3"
> {
  // Get the Fat Bass preset
  const fatBassPreset = getPresetById("fat-bass");

  // Default state values (for properties not covered by the preset)
  const defaultState: Omit<
    SynthState,
    | "setActiveKeys"
    | "setKeyboardRef"
    | "setPitchWheel"
    | "setModWheel"
    | "setOscillator1"
    | "setOscillator2"
    | "setOscillator3"
  > = {
    isDisabled: true,
    activeKeys: null,
    keyboardRef: { synth: null },
    pitchWheel: 50,
    modWheel: 50,
    masterTune: 0,
    oscillator1: {
      waveform: "sawtooth",
      frequency: 440,
      range: "8",
      enabled: true,
    },
    oscillator2: {
      waveform: "sawtooth",
      frequency: 0,
      range: "8",
      enabled: true,
    },
    oscillator3: {
      waveform: "rev_saw",
      frequency: 0,
      range: "8",
      enabled: true,
    },
    mixer: {
      osc1: { enabled: true, volume: 8 },
      osc2: { enabled: true, volume: 8 },
      osc3: { enabled: true, volume: 8 },
      noise: { enabled: false, volume: 0, noiseType: "white" },
      external: { enabled: false, volume: 0, overload: false },
    },
    mainVolume: 2.5,
    isMainActive: true,
    glideOn: false,
    glideTime: 0.1,
    filterAttack: 0.5,
    filterDecay: 2.5,
    filterSustain: 5,
    filterCutoff: 0,
    filterEmphasis: 5,
    filterContourAmount: 5,
    filterModulationOn: false,
    keyboardControl1: false,
    keyboardControl2: false,
    loudnessAttack: 0.5,
    loudnessDecay: 2.5,
    loudnessSustain: 8,
    decaySwitchOn: false,
    oscillatorModulationOn: false,
    lfoWaveform: "triangle",
    lfoRate: 5,
    modMix: 0,
    osc3Control: true,
    osc3FilterEgSwitch: true,
    noiseLfoSwitch: true,
    tunerOn: false,
    auxOutput: {
      enabled: false,
      volume: 0,
    },
  };

  // If Fat Bass preset exists, merge it with the default state
  if (fatBassPreset) {
    const presetParameters = convertPresetToStoreFormat(fatBassPreset);
    return { ...defaultState, ...presetParameters };
  }

  // Fallback to default state if preset not found
  return defaultState;
}
