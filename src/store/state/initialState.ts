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
  const fatBassPreset = getPresetById("fat-bass");

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
    // Audio context state
    isDisabled: true,

    // Keyboard state
    activeKeys: null,
    keyboardRef: { synth: null },

    // Controller state
    pitchWheel: SYNTH_PARAMS.PITCH_WHEEL.DEFAULT,
    modWheel: SYNTH_PARAMS.MOD_WHEEL.DEFAULT,
    masterTune: SYNTH_PARAMS.MASTER_TUNE?.DEFAULT ?? 0,

    // Oscillator state
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

    // Mixer state
    mixer: {
      osc1: { enabled: true, volume: 8 },
      osc2: { enabled: true, volume: 8 },
      osc3: { enabled: true, volume: 8 },
      noise: { enabled: false, volume: 0, noiseType: "white" },
      external: { enabled: false, volume: 0, overload: false },
    },
    mainVolume: SYNTH_PARAMS.VOLUME.DEFAULT,
    isMainActive: true,

    // Glide state
    glideOn: false,
    glideTime: SYNTH_PARAMS.GLIDE.TIME.DEFAULT,

    // Filter state
    filterAttack: SYNTH_PARAMS.FILTER.ATTACK.DEFAULT,
    filterDecay: SYNTH_PARAMS.FILTER.DECAY.DEFAULT,
    filterSustain: SYNTH_PARAMS.FILTER.SUSTAIN.DEFAULT,
    filterCutoff: SYNTH_PARAMS.FILTER.CUTOFF.DEFAULT,
    filterEmphasis: SYNTH_PARAMS.FILTER.EMPHASIS.DEFAULT,
    filterContourAmount: SYNTH_PARAMS.FILTER.CONTOUR_AMOUNT.DEFAULT,
    filterModulationOn: false,
    keyboardControl1: false,
    keyboardControl2: false,

    // Loudness envelope state
    loudnessAttack: SYNTH_PARAMS.LOUDNESS.ATTACK.DEFAULT,
    loudnessDecay: SYNTH_PARAMS.LOUDNESS.DECAY.DEFAULT,
    loudnessSustain: SYNTH_PARAMS.LOUDNESS.SUSTAIN.DEFAULT,
    decaySwitchOn: false,

    // Modulation state
    oscillatorModulationOn: false,
    lfoWaveform: "triangle",
    lfoRate: SYNTH_PARAMS.LFO.RATE.DEFAULT,
    modMix: SYNTH_PARAMS.MOD_MIX.DEFAULT,
    osc3Control: true,
    osc3FilterEgSwitch: true,
    noiseLfoSwitch: true,

    // Output state
    tunerOn: false,
    auxOutput: {
      enabled: false,
      volume: 0,
    },
  };

  if (fatBassPreset) {
    const presetParameters = convertPresetToStoreFormat(fatBassPreset);
    return { ...defaultState, ...presetParameters };
  }

  return defaultState;
}
