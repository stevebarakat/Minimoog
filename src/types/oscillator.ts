// Centralized oscillator types to avoid duplicates across the codebase

export type OscillatorWaveform =
  | "triangle"
  | "tri_saw"
  | "sawtooth"
  | "rev_saw"
  | "pulse1"
  | "pulse2"
  | "pulse3";

export type OscillatorRange = "32" | "16" | "8" | "4" | "2" | "lo";

export type OscillatorType = OscillatorWaveform;

export type OscillatorParams = {
  waveform: OscillatorWaveform;
  range: OscillatorRange;
  gain: number;
};

export type OscillatorCreateConfig = {
  audioContext: AudioContext;
  waveform: string;
  frequency: number;
  range: string;
  gain?: number;
};

export type UseOscillatorResult = {
  triggerAttack: (note: string) => void;
  triggerRelease: (forceStop?: boolean) => void;
  getNode: () => OscillatorNode | null;
};
