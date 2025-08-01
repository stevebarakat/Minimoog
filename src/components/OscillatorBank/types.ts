export type OscillatorType =
  | "triangle"
  | "tri_saw"
  | "sawtooth"
  | "pulse1"
  | "pulse2"
  | "pulse3";

export type OscillatorRange = "lo" | "32" | "16" | "8" | "4" | "2";

export type OscillatorWaveform =
  | "triangle"
  | "tri_saw"
  | "sawtooth"
  | "pulse1"
  | "pulse2"
  | "pulse3";

export type OscillatorParams = {
  waveform: OscillatorWaveform;
  range: OscillatorRange;
  gain: number;
};
