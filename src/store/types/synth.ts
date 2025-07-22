export type Note = string;

export type OscillatorWaveform =
  | "triangle"
  | "tri_saw"
  | "sawtooth"
  | "rev_saw"
  | "pulse1"
  | "pulse2"
  | "pulse3";
export type OscillatorRange = "32" | "16" | "8" | "4" | "2" | "lo";

export type OscillatorState = {
  waveform: OscillatorWaveform;
  frequency: number;
  range: OscillatorRange;
  enabled: boolean;
};

export type SynthObject = {
  triggerAttack: (note: string) => void;
  triggerRelease: (note: string) => void;
};

export type MixerSourceState = {
  enabled: boolean;
  volume: number;
};

export type MixerNoiseState = MixerSourceState & {
  noiseType: "white" | "pink";
};

export type MixerExternalState = MixerSourceState & {
  overload: boolean;
};

export type MixerState = {
  osc1: MixerSourceState;
  osc2: MixerSourceState;
  osc3: MixerSourceState;
  noise: MixerNoiseState;
  external: MixerExternalState;
};

export type SynthState = {
  // Audio context state
  isDisabled: boolean;

  // Keyboard state
  activeKeys: Note | null;
  keyboardRef: {
    synth: SynthObject | null;
  };

  // Controller state
  pitchWheel: number;
  modWheel: number;
  masterTune: number; // -2 to +2 semitones
  oscillator1: OscillatorState;
  oscillator2: OscillatorState;
  oscillator3: OscillatorState;
  mixer: MixerState;
  mainVolume: number; // 0-10, controls the final output gain
  isMainActive: boolean; // true = muted, false = unmuted

  // Glide
  glideOn: boolean;
  glideTime: number;

  // Filter envelope (contour)
  filterAttack: number; // 0-10
  filterDecay: number; // 0-10
  filterSustain: number; // 0-10

  // Filter controls
  filterCutoff: number; // -4 to 4
  filterEmphasis: number; // 0-10
  filterContourAmount: number; // 0-10

  // New switches
  filterModulationOn: boolean;
  keyboardControl1: boolean;
  keyboardControl2: boolean;
  oscillatorModulationOn: boolean;
  lfoWaveform: "triangle" | "square";
  lfoRate: number; // 0-10
  osc3Control: boolean;

  modMix: number;

  osc3FilterEgSwitch: boolean;
  noiseLfoSwitch: boolean;

  // Add loudness envelope state
  loudnessAttack: number;
  loudnessDecay: number;
  loudnessSustain: number;
  decaySwitchOn: boolean;

  // Tuner state
  tunerOn: boolean;

  // Aux output state
  auxOutput: {
    enabled: boolean;
    volume: number;
  };
};

export type SynthActions = {
  setIsDisabled: (disabled: boolean) => void;
  setActiveKeys: (
    key: Note | null | ((prev: Note | null) => Note | null)
  ) => void;
  setKeyboardRef: (ref: { synth: SynthObject | null }) => void;
  setPitchWheel: (value: number) => void;
  setModWheel: (value: number) => void;
  setMasterTune: (value: number) => void;
  setOscillator1: (osc: Partial<OscillatorState>) => void;
  setOscillator2: (osc: Partial<OscillatorState>) => void;
  setOscillator3: (osc: Partial<OscillatorState>) => void;
  setMixerSource: (
    source: "osc1" | "osc2" | "osc3",
    value: Partial<MixerSourceState>
  ) => void;
  setMixerNoise: (value: Partial<MixerNoiseState>) => void;
  setMixerExternal: (value: Partial<MixerExternalState>) => void;
  setMainVolume: (value: number) => void;
  setIsMainActive: (value: boolean) => void;
  setGlideOn: (on: boolean) => void;
  setGlideTime: (time: number) => void;
  setFilterEnvelope: (env: {
    attack?: number;
    decay?: number;
    sustain?: number;
  }) => void;
  setFilterCutoff: (value: number) => void;
  setFilterEmphasis: (value: number) => void;
  setFilterContourAmount: (value: number) => void;
  setFilterModulationOn: (on: boolean) => void;
  setKeyboardControl1: (on: boolean) => void;
  setKeyboardControl2: (on: boolean) => void;
  setOscillatorModulationOn: (on: boolean) => void;
  setLfoWaveform: (waveform: "triangle" | "square") => void;
  setLfoRate: (rate: number) => void;
  setOsc3Control: (on: boolean) => void;
  setModMix: (value: number) => void;
  setOsc3FilterEgSwitch: (on: boolean) => void;
  setNoiseLfoSwitch: (on: boolean) => void;
  setLoudnessEnvelope: (env: {
    attack?: number;
    decay?: number;
    sustain?: number;
  }) => void;
  setDecaySwitchOn: (on: boolean) => void;
  setTunerOn: (on: boolean) => void;
  setAuxOutput: (value: Partial<{ enabled: boolean; volume: number }>) => void;
  loadPreset: (preset: Partial<SynthState>) => void;
  updateURL: () => void;
};
