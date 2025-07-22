import {
  BaseOscillatorParams,
  BaseOscillatorInstance,
  createBaseOscillator,
  createPulseWave,
} from "./baseOscillator";

export type Osc2Params = BaseOscillatorParams & {
  waveform:
    | "triangle"
    | "tri_saw"
    | "sawtooth"
    | "pulse1"
    | "pulse2"
    | "pulse3";
  frequency: number;
};

export type Osc2Instance = BaseOscillatorInstance & {
  updateWithFrequency: (params: Partial<Osc2Params>) => void;
};

const pulseWavesCache = new WeakMap<
  AudioContext,
  { pulse2?: PeriodicWave; pulse3?: PeriodicWave; tri_saw?: PeriodicWave }
>();

function createTriangleSawtoothWave(audioContext: AudioContext): PeriodicWave {
  const n = 64;
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    const triangle =
      i % 2 === 1
        ? (8 / Math.PI ** 2) * (1 / i ** 2) * (i % 4 === 1 ? 1 : -1)
        : 0;
    const saw = (2 / (i * Math.PI)) * (i % 2 === 0 ? 0 : 1);
    real[i] = 0.5 * triangle + 0.5 * saw;
    imag[i] = 0;
  }
  return audioContext.createPeriodicWave(real, imag);
}

function getCustomWave(
  audioContext: AudioContext,
  waveform: string
): PeriodicWave {
  let cache = pulseWavesCache.get(audioContext);
  if (!cache) {
    cache = {};
    pulseWavesCache.set(audioContext, cache);
  }

  if (waveform === "tri_saw") {
    if (!cache.tri_saw) {
      cache.tri_saw = createTriangleSawtoothWave(audioContext);
    }
    return cache.tri_saw;
  } else {
    const type = waveform as "pulse2" | "pulse3";
    if (!cache[type]) {
      const dutyCycle = type === "pulse2" ? 0.25 : 0.1;
      cache[type] = createPulseWave(audioContext, dutyCycle);
    }
    return cache[type]!;
  }
}

export function createOscillator2(
  params: Osc2Params,
  mixerNode?: AudioNode
): Osc2Instance {
  const base = createBaseOscillator(params, getCustomWave, mixerNode);
  return {
    ...base,
    updateWithFrequency: (newParams: Partial<Osc2Params>) => {
      const { waveform, range, gain, frequency } = newParams;
      base.update({ waveform, range, gain });
      if (typeof frequency === "number" && base.getNode()) {
        base
          .getNode()!
          .frequency.setValueAtTime(frequency, params.audioContext.currentTime);
      }
    },
  };
}
