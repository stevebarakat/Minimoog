export type BaseOscillatorParams = {
  audioContext: AudioContext;
  waveform: string;
  range: "32" | "16" | "8" | "4" | "2" | "lo";
  gain?: number;
};

export type BaseOscillatorInstance = {
  start: (frequency: number) => void;
  stop: () => void;
  update: (
    params: Partial<Pick<BaseOscillatorParams, "waveform" | "range" | "gain">>
  ) => void;
  getNode: () => OscillatorNode | null;
  getGainNode: () => GainNode;
  setFrequency: (frequency: number) => void;
};

export const rangeToMultiplier: Record<BaseOscillatorParams["range"], number> =
  {
    "32": 0.25,
    "16": 0.5,
    "8": 1,
    "4": 2,
    "2": 4,
    lo: 0.01,
  };

export function createPulseWave(
  audioContext: AudioContext,
  dutyCycle: number
): PeriodicWave {
  const n = 128; // Increased harmonics for fatter sound
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    const theta = Math.PI * i * dutyCycle;
    real[i] = (2 / (i * Math.PI)) * Math.sin(theta);
    imag[i] = 0;
  }
  return audioContext.createPeriodicWave(real, imag);
}

export function createBaseOscillator(
  params: BaseOscillatorParams,
  getCustomWave: (audioContext: AudioContext, waveform: string) => PeriodicWave,
  mixerNode?: AudioNode
): BaseOscillatorInstance {
  let osc: OscillatorNode | null = null;
  let currentParams = { ...params };
  const gainNode = params.audioContext.createGain();
  gainNode.gain.value = params.gain ?? 1;
  if (mixerNode) {
    gainNode.connect(mixerNode);
  } else {
    gainNode.connect(params.audioContext.destination);
  }

  function start(frequency: number): void {
    if (!osc) {
      osc = params.audioContext.createOscillator();
      let oscType: OscillatorType = "triangle";
      if (currentParams.waveform === "triangle") {
        oscType = "triangle";
      } else if (currentParams.waveform === "sawtooth") {
        oscType = "sawtooth";
      } else if (currentParams.waveform === "pulse1") {
        oscType = "square";
      } else {
        oscType = "custom";
      }
      if (oscType === "custom") {
        osc.setPeriodicWave(
          getCustomWave(params.audioContext, currentParams.waveform)
        );
      } else {
        osc.type = oscType;
      }
      osc.connect(gainNode);
      osc.start();
    }
    setFrequency(frequency);
  }

  function setFrequency(frequency: number): void {
    if (osc) {
      const freq = frequency * rangeToMultiplier[currentParams.range];
      osc.frequency.setValueAtTime(
        isFinite(freq) ? freq : 440,
        params.audioContext.currentTime
      );
    }
  }

  function stop(): void {
    if (osc) {
      osc.stop();
      osc.disconnect();
      osc = null;
    }
  }

  function update(
    newParams: Partial<
      Pick<BaseOscillatorParams, "waveform" | "range" | "gain">
    >
  ): void {
    currentParams = { ...currentParams, ...newParams };
    if (osc) {
      let oscType: OscillatorType = "triangle";
      if (currentParams.waveform === "triangle") {
        oscType = "triangle";
      } else if (currentParams.waveform === "sawtooth") {
        oscType = "sawtooth";
      } else if (currentParams.waveform === "pulse1") {
        oscType = "square";
      } else {
        oscType = "custom";
      }
      if (oscType === "custom") {
        osc.setPeriodicWave(
          getCustomWave(params.audioContext, currentParams.waveform)
        );
      } else {
        osc.type = oscType;
      }
    }
    if (typeof newParams.gain === "number") {
      gainNode.gain.value = newParams.gain;
    }
  }

  function getNode(): OscillatorNode | null {
    return osc;
  }

  function getGainNode(): GainNode {
    return gainNode;
  }

  return {
    start,
    stop,
    update,
    getNode,
    getGainNode,
    setFrequency,
  };
}
