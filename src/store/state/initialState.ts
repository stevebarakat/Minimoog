import { SynthState } from "../types/synth";
import { getPresetById } from "@/data/presets";
import { convertPresetToStoreFormat } from "@/utils/presetConversion";
import { SYNTH_PARAMS, MIDI } from "@/config";

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
    pitchWheel: SYNTH_PARAMS.PITCH_WHEEL.DEFAULT,
    modWheel: SYNTH_PARAMS.MOD_WHEEL.DEFAULT,
    masterTune: SYNTH_PARAMS.MASTER_TUNE?.DEFAULT ?? 0,
    oscillator1: {
      waveform: "sawtooth",
      frequency: MIDI.A4_FREQUENCY,
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
    mainVolume: SYNTH_PARAMS.VOLUME.DEFAULT,
    isMainActive: true,
    glideOn: false,
    glideTime: SYNTH_PARAMS.GLIDE.TIME.DEFAULT,
    filterAttack: SYNTH_PARAMS.FILTER.ATTACK.DEFAULT,
    filterDecay: SYNTH_PARAMS.FILTER.DECAY.DEFAULT,
    filterSustain: SYNTH_PARAMS.FILTER.SUSTAIN.DEFAULT,
    filterCutoff: SYNTH_PARAMS.FILTER.CUTOFF.DEFAULT,
    filterEmphasis: SYNTH_PARAMS.FILTER.EMPHASIS.DEFAULT,
    filterContourAmount: SYNTH_PARAMS.FILTER.CONTOUR_AMOUNT.DEFAULT,
    filterModulationOn: false,
    keyboardControl1: false,
    keyboardControl2: false,
    loudnessAttack: SYNTH_PARAMS.LOUDNESS.ATTACK.DEFAULT,
    loudnessDecay: SYNTH_PARAMS.LOUDNESS.DECAY.DEFAULT,
    loudnessSustain: SYNTH_PARAMS.LOUDNESS.SUSTAIN.DEFAULT,
    decaySwitchOn: false,
    oscillatorModulationOn: false,
    lfoWaveform: "triangle",
    lfoRate: SYNTH_PARAMS.LFO.RATE.DEFAULT,
    modMix: SYNTH_PARAMS.MOD_MIX.DEFAULT,
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
