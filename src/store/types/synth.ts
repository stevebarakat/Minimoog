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

export type MixerExternalState = MixerSourceState;

export type MixerState = {
  osc1: MixerSourceState;
  osc2: MixerSourceState;
  osc3: MixerSourceState;
  noise: MixerNoiseState;
  external: MixerExternalState;
};

export type SynthState = {
  // ============================================================================
  // AUDIO CONTEXT STATE
  // ============================================================================
  isDisabled: boolean;

  // ============================================================================
  // KEYBOARD STATE
  // ============================================================================
  activeKeys: Note | null;

  // ============================================================================
  // CONTROLLER STATE
  // ============================================================================
  pitchWheel: number;
  modWheel: number;
  masterTune: number; // -2 to +2 semitones
  oscillator1: OscillatorState;
  oscillator2: OscillatorState;
  oscillator3: OscillatorState;
  mixer: MixerState;
  mainVolume: number; // 0-10, controls the final output gain
  isMainActive: boolean; // true = muted, false = unmuted

  // ============================================================================
  // GLIDE STATE
  // ============================================================================
  glideOn: boolean;
  glideTime: number;

  // ============================================================================
  // FILTER STATE
  // ============================================================================
  filterAttack: number; // 0-10
  filterDecay: number; // 0-10
  filterSustain: number; // 0-10
  filterCutoff: number; // -4 to 4
  filterEmphasis: number; // 0-10
  filterContourAmount: number; // 0-10

  // ============================================================================
  // MODULATION STATE
  // ============================================================================
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

  // ============================================================================
  // ENVELOPE STATE
  // ============================================================================
  loudnessAttack: number;
  loudnessDecay: number;
  loudnessSustain: number;
  decaySwitchOn: boolean;

  // ============================================================================
  // OUTPUT STATE
  // ============================================================================
  tunerOn: boolean;
  auxOutput: {
    enabled: boolean;
    volume: number;
  };
};

export type SynthActions = {
  // ============================================================================
  // AUDIO CONTEXT ACTIONS
  // ============================================================================
  setIsDisabled: (disabled: boolean) => void;

  // ============================================================================
  // KEYBOARD ACTIONS
  // ============================================================================
  setActiveKeys: (
    key: Note | null | ((prev: Note | null) => Note | null)
  ) => void;

  // ============================================================================
  // CONTROLLER ACTIONS
  // ============================================================================
  setPitchWheel: (value: number) => void;
  setModWheel: (value: number) => void;
  setMasterTune: (value: number) => void;

  // ============================================================================
  // OSCILLATOR ACTIONS
  // ============================================================================
  setOscillator1: (osc: Partial<OscillatorState>) => void;
  setOscillator2: (osc: Partial<OscillatorState>) => void;
  setOscillator3: (osc: Partial<OscillatorState>) => void;

  // ============================================================================
  // MIXER ACTIONS
  // ============================================================================
  setMixerSource: (
    source: "osc1" | "osc2" | "osc3",
    value: Partial<MixerSourceState>
  ) => void;
  setMixerNoise: (value: Partial<MixerNoiseState>) => void;
  setMixerExternal: (value: Partial<MixerExternalState>) => void;
  setMainVolume: (value: number) => void;
  setIsMainActive: (value: boolean) => void;

  // ============================================================================
  // GLIDE ACTIONS
  // ============================================================================
  setGlideOn: (on: boolean) => void;
  setGlideTime: (time: number) => void;

  // ============================================================================
  // FILTER ACTIONS
  // ============================================================================
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

  // ============================================================================
  // MODULATION ACTIONS
  // ============================================================================
  setOscillatorModulationOn: (on: boolean) => void;
  setLfoWaveform: (waveform: "triangle" | "square") => void;
  setLfoRate: (rate: number) => void;
  setOsc3Control: (on: boolean) => void;
  setModMix: (value: number) => void;
  setOsc3FilterEgSwitch: (on: boolean) => void;
  setNoiseLfoSwitch: (on: boolean) => void;

  // ============================================================================
  // ENVELOPE ACTIONS
  // ============================================================================
  setLoudnessEnvelope: (env: {
    attack?: number;
    decay?: number;
    sustain?: number;
  }) => void;
  setDecaySwitchOn: (on: boolean) => void;

  // ============================================================================
  // OUTPUT ACTIONS
  // ============================================================================
  setTunerOn: (on: boolean) => void;
  setAuxOutput: (value: Partial<{ enabled: boolean; volume: number }>) => void;

  // ============================================================================
  // PRESET ACTIONS
  // ============================================================================
  loadPreset: (preset: Partial<SynthState>) => void;
  updateURL: () => void;
};
