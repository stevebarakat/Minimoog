export type EnvelopeStage = "idle" | "attack" | "decay" | "sustain" | "release";

export type ModulationState = {
  envelope: {
    isGateOn: boolean;
    stage: EnvelopeStage;
    value: number;
    lastTime: number;
  };
};

export type ModulationSources = {
  lfo: number;
  osc3: number;
  noise: number;
  filterEg: number;
};

export type ModulationConfig = {
  lfoRate: number;
  lfoWaveform: "triangle" | "square";
  modMix: number;
  osc3FilterEgSwitch: boolean;
  noiseLfoSwitch: boolean;
  modWheel: number;
};

export type NoiseGenerators = {
  pink: () => number;
  red: () => number;
};
