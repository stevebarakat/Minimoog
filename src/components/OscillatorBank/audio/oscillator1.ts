import {
  BaseOscillatorParams,
  BaseOscillatorInstance,
  createBaseOscillator,
  createPulseWave,
} from "./baseOscillator";

export type Osc1Params = BaseOscillatorParams & {
  waveform:
    | "triangle"
    | "tri_saw"
    | "sawtooth"
    | "pulse1"
    | "pulse2"
    | "pulse3";
};

export type Osc1Instance = BaseOscillatorInstance;

const pulseWavesCache = new WeakMap<
  AudioContext,
  { pulse2?: PeriodicWave; pulse3?: PeriodicWave; tri_saw?: PeriodicWave }
>();

function createTriangleSawtoothWave(audioContext: AudioContext): PeriodicWave {
  const n = 128; // Increased harmonics for fatter sound
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    const triangle =
      i % 2 === 1
        ? (8 / Math.PI ** 2) * (1 / i ** 2) * (i % 4 === 1 ? 1 : -1)
        : 0;
    const saw = (2 / (i * Math.PI)) * (i % 2 === 0 ? 0 : 1);
    // Enhanced blend with more sawtooth content for fatter sound
    real[i] = 0.3 * triangle + 0.7 * saw;
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

export function createOscillator1(
  params: Osc1Params,
  mixerNode?: AudioNode
): Osc1Instance {
  return createBaseOscillator(params, getCustomWave, mixerNode);
}
