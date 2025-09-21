// Centralized audio types to avoid duplicates across the codebase
import type { BaseOscillatorParams } from "@/components/OscillatorBank/audio/baseOscillator";

// Basic oscillator interface for simple usage
export type SimpleOscillator = {
  triggerAttack?: (note: string) => void;
  triggerRelease?: () => void;
  getNode?: () => OscillatorNode | null;
};

// Full oscillator interface for complex usage
export type OscillatorInstance = {
  start: (frequency: number) => void;
  stop: () => void;
  getNode: () => OscillatorNode | null;
  getGainNode: () => GainNode;
  update: (
    params: Partial<Pick<BaseOscillatorParams, "waveform" | "range" | "gain">>
  ) => void;
  setFrequency: (frequency: number) => void;
  getRangeMultiplier: () => number;
};

// Basic synth object interface for simple usage
export type SimpleSynthObject = {
  triggerAttack: (note: string) => void;
  triggerRelease: () => void;
};

// Full synth object interface for complex usage
export type ComplexSynthObject = {
  triggerAttack: (note: string) => void;
  triggerRelease: (note: string) => void;
};

// Audio node parameters interface
export type AudioNodeParametersProps = {
  audioContext: AudioContext | null;
  node: AudioNode | null;
  parameter: AudioParam | null;
  value: number;
  setValue: (value: number) => void;
};

// Filter envelope interface
export type FilterEnvelope = {
  triggerAttack: () => void;
  triggerRelease: () => void;
};

export type CustomDelayNode = AudioWorkletNode & {
  parameters: {
    delayTime: AudioParam;
    feedback: AudioParam;
    wetLevel: AudioParam;
    dryLevel: AudioParam;
    enabled: AudioParam;
  };
};

// Audio nodes collection interface
export type AudioNodes = {
  // Core nodes
  masterGain: GainNode | null;
  mixerNode: GainNode | null;
  loudnessEnvelopeGain: GainNode | null;
  filterNode: BiquadFilterNode | null;

  // Effects nodes
  delayNode: CustomDelayNode | DelayNode | null; // Custom delay or native delay node
  delayMixGain: GainNode | null;
  delayFeedbackGain: GainNode | null;
  reverbNode: ConvolverNode | null; // Native ConvolverNode for reverb
  reverbMixGain: GainNode | null;
  reverbToneFilter: BiquadFilterNode | null;
  toneFilterNode: BiquadFilterNode | null;
  dryGain: GainNode | null;
  effectsGain: GainNode | null;
  filterEnvelope: FilterEnvelope | null;
};

// Envelope properties interface
export type EnvelopeProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | BiquadFilterNode | null;
  loudnessEnvelopeGain: GainNode | null;
  osc1: SimpleOscillator | null;
  osc2: SimpleOscillator | null;
  osc3: SimpleOscillator | null;
  filterEnvelope: FilterEnvelope | null;
};

// Modulation properties interface
export type ModulationProps = {
  audioContext: AudioContext | null;
  osc1: SimpleOscillator | null;
  osc2: SimpleOscillator | null;
  osc3: SimpleOscillator | null;
  filterNode: AudioWorkletNode | BiquadFilterNode | null;
};
