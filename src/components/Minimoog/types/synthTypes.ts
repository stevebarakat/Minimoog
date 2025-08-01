export type Oscillator = {
  getNode?: () => OscillatorNode | null;
  triggerAttack?: (note: string) => void;
  triggerRelease?: () => void;
};

export type AudioNodes = {
  mixerNode: GainNode | null;
  filterNode: AudioWorkletNode | null; // Only AudioWorkletNode for Moog ZDF
  loudnessEnvelopeGain: GainNode | null;
  masterGain: GainNode | null;
  isMixerReady: boolean;
};

export type EnvelopeProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | null; // Only AudioWorkletNode for Moog ZDF
  loudnessEnvelopeGain: GainNode | null;
  osc1: Oscillator | null;
  osc2: Oscillator | null;
  osc3: Oscillator | null;
};

export type ModulationProps = {
  audioContext: AudioContext | null;
  osc1: Oscillator | null;
  osc2: Oscillator | null;
  osc3: Oscillator | null;
  filterNode: AudioWorkletNode | null; // Only AudioWorkletNode for Moog ZDF
};
