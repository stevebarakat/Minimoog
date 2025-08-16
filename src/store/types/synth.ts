import {
  VolumeRange,
  createVolumeRange,
  PitchWheelRange,
  createPitchWheelRange,
  ModWheelRange,
  createModWheelRange,
  MasterTuneRange,
  createMasterTuneRange,
  FilterCutoffRange,
  createFilterCutoffRange,
  FilterEmphasisRange,
  createFilterEmphasisRange,
  FilterContourRange,
  createFilterContourRange,
  FilterEnvelopeRange,
  createFilterEnvelopeRange,
  LfoRateRange,
  createLfoRateRange,
  ModMixRange,
  createModMixRange,
  GlideTimeRange,
  createGlideTimeRange,
  ExternalInputVolumeRange,
  createExternalInputVolumeRange,
  NoiseVolumeRange,
  createNoiseVolumeRange,
  FrequencyRange,
  createFrequencyRange,
} from "@/types/branded";

import { OscillatorWaveform, OscillatorRange } from "@/types/oscillator";
import { Note } from "@/types/note";

export type {
  VolumeRange,
  FilterCutoffRange,
  FilterEmphasisRange,
  FilterContourRange,
  FilterEnvelopeRange,
  LfoRateRange,
  ModMixRange,
  ModWheelRange,
  PitchWheelRange,
  MasterTuneRange,
  GlideTimeRange,
  ExternalInputVolumeRange,
  NoiseVolumeRange,
  FrequencyRange,
};

export {
  createVolumeRange,
  createFilterCutoffRange,
  createFilterEmphasisRange,
  createFilterContourRange,
  createFilterEnvelopeRange,
  createLfoRateRange,
  createModMixRange,
  createModWheelRange,
  createPitchWheelRange,
  createMasterTuneRange,
  createGlideTimeRange,
  createExternalInputVolumeRange,
  createNoiseVolumeRange,
  createFrequencyRange,
};

export type OscillatorState = {
  waveform: OscillatorWaveform;
  frequency: number;
  range: OscillatorRange;
  enabled: boolean;
  volume: VolumeRange;
};

export type MixerSourceState = {
  enabled: boolean;
};

export type MixerNoiseState = MixerSourceState & {
  noiseType: "white" | "pink";
  volume: NoiseVolumeRange;
};

export type MixerExternalState = MixerSourceState & {
  volume: ExternalInputVolumeRange;
};

export type MixerState = {
  noise: MixerNoiseState;
  external: MixerExternalState;
};

export type SynthState = {
  // ============================================================================
  // AUDIO CONTEXT STATE
  // ============================================================================
  audioContext: {
    isReady: boolean;
    error: string | null;
    context: AudioContext | null;
  };

  // ============================================================================
  // KEYBOARD STATE
  // ============================================================================
  activeKeys: Note | null;

  // ============================================================================
  // CONTROLLER STATE
  // ============================================================================
  pitchWheel: PitchWheelRange;
  modWheel?: ModWheelRange; // Optional for future re-implementation
  masterTune: MasterTuneRange;
  oscillator1: OscillatorState;
  oscillator2: OscillatorState;
  oscillator3: OscillatorState;
  mixer: MixerState;
  mainVolume: VolumeRange;
  isMainActive: boolean;

  // ============================================================================
  // GLIDE STATE
  // ============================================================================
  glideOn: boolean;
  glideTime: GlideTimeRange;

  // ============================================================================
  // FILTER STATE
  // ============================================================================
  filterType: "huovilainen";
  filterAttack: FilterEnvelopeRange;
  filterDecay: FilterEnvelopeRange;
  filterSustain: FilterEnvelopeRange;
  filterCutoff: FilterCutoffRange;
  filterEmphasis: FilterEmphasisRange;
  filterContourAmount: FilterContourRange;
  filterModulationOn: boolean;
  keyboardControl1: boolean;
  keyboardControl2: boolean;

  // ============================================================================
  // MODULATION STATE
  // ============================================================================
  oscillatorModulationOn: boolean;
  lfoWaveform: "triangle" | "square";
  lfoRate: LfoRateRange;
  osc3Control: boolean;
  modMix: ModMixRange;
  osc3FilterEgSwitch: boolean;
  noiseLfoSwitch: boolean;

  // ============================================================================
  // ENVELOPE STATE
  // ============================================================================
  loudnessAttack: FilterEnvelopeRange;
  loudnessDecay: FilterEnvelopeRange;
  loudnessSustain: FilterEnvelopeRange;
  decaySwitchOn: boolean;

  // ============================================================================
  // OUTPUT STATE
  // ============================================================================
  tunerOn: boolean;
  auxOutput: {
    enabled: boolean;
    volume: VolumeRange;
  };

  // ============================================================================
  // DELAY EFFECT STATE
  // ============================================================================
  delay: {
    enabled: boolean;
    mix: VolumeRange; // 0-10 mapped to 0-1
    time: FilterEnvelopeRange; // 0-10 mapped to 0-2000ms
    feedback: VolumeRange; // 0-10 mapped to 0-0.9
  };

  // ============================================================================
  // REVERB EFFECT STATE
  // ============================================================================
  reverb: {
    enabled: boolean;
    mix: VolumeRange; // 0-10 mapped to 0-1
    decay: FilterEnvelopeRange; // 0-10 mapped to 0-10 seconds
    tone: FilterEnvelopeRange; // 0-10 mapped to bass (low) to treble (high) EQ
  };


};

export type SynthActions = {
  // AUDIO CONTEXT ACTIONS
  // ============================================================================
  setAudioContext: (audioContext: {
    isReady: boolean;
    error: string | null;
    context: AudioContext | null;
  }) => void;

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
  setFilterType: (type: "huovilainen") => void;
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
  // DELAY EFFECT ACTIONS
  // ============================================================================
  setDelay: (value: Partial<{ enabled: boolean; mix: number; time: number; feedback: number }>) => void;

  // ============================================================================
  // PRESET ACTIONS
  // ============================================================================
  loadPreset: (preset: Partial<SynthState>) => void;
};
