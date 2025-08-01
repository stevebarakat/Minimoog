import { SynthState } from "../types/synth";
import { SYNTH_PARAMS } from "@/config";

export function createInitialState(): Omit<
  SynthState,
  | "setActiveKeys"
  | "setPitchWheel"
  | "setModWheel"
  | "setOscillator1"
  | "setOscillator2"
  | "setOscillator3"
> {
  const defaultState: Omit<
    SynthState,
    | "setActiveKeys"
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

    // Controller state
    pitchWheel: SYNTH_PARAMS.PITCH_WHEEL.DEFAULT,
    modWheel: SYNTH_PARAMS.MOD_WHEEL.DEFAULT,
    masterTune: SYNTH_PARAMS.MASTER_TUNE?.DEFAULT ?? 0,

    // Oscillator state - Vintage Minimoog settings
    oscillator1: {
      waveform: "sawtooth",
      frequency: 0,
      range: "8",
      enabled: true,
    },
    oscillator2: {
      waveform: "sawtooth",
      frequency: -7,
      range: "8",
      enabled: true,
    },
    oscillator3: {
      waveform: "triangle",
      frequency: -7,
      range: "8",
      enabled: true,
    },

    // Mixer state - Vintage Minimoog settings
    mixer: {
      osc1: { enabled: true, volume: 9 },
      osc2: { enabled: true, volume: 7 },
      osc3: { enabled: true, volume: 5 },
      noise: { enabled: false, volume: 0, noiseType: "white" },
      external: { enabled: false, volume: 0 },
    },
    mainVolume: 5,
    isMainActive: true,

    // Glide state - Vintage Minimoog settings
    glideOn: true,
    glideTime: 1,

    // Filter state - Vintage Minimoog settings
    filterAttack: 0.3,
    filterDecay: 2.5,
    filterSustain: 4.5,
    filterCutoff: 2.5,
    filterEmphasis: 6.5,
    filterContourAmount: 5.5,
    filterModulationOn: true,
    keyboardControl1: false,
    keyboardControl2: false,

    // Loudness envelope state - Vintage Minimoog settings
    loudnessAttack: 0.3,
    loudnessDecay: 2.5,
    loudnessSustain: 5.5,
    decaySwitchOn: false,

    // Modulation state - Vintage Minimoog settings
    oscillatorModulationOn: false,
    lfoWaveform: "triangle",
    lfoRate: 3.5,
    modMix: 2.5,
    osc3Control: true,
    osc3FilterEgSwitch: true,
    noiseLfoSwitch: false,

    // Output state
    tunerOn: false,
    auxOutput: {
      enabled: false,
      volume: 0,
    },
  };

  return defaultState;
}
