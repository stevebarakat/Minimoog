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
  const n = 128; // Increased harmonics for richer sound
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    const triangle =
      i % 2 === 1
        ? (8 / Math.PI ** 2) * (1 / i ** 2) * (i % 4 === 1 ? 1 : -1)
        : 0;
    const saw = (2 / (i * Math.PI)) * (i % 2 === 0 ? 0 : 1);

    // Balanced blend for OSC2
    let harmonic = 0.5 * triangle + 0.5 * saw;

    // Add subtle even harmonic content for warmth (deterministic)
    if (i % 2 === 0 && i <= 12) {
      const evenHarmonic = (1 / (i * Math.PI)) * 0.12;
      harmonic += evenHarmonic;
    }

    // Enhance mid-range harmonics for presence
    if (i >= 3 && i <= 10) {
      harmonic *= 1.08;
    }

    real[i] = harmonic;
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
      const { waveform, range, frequency } = newParams;
      base.update({ waveform, range });
      if (typeof frequency === "number") {
        // Use setFrequency to apply range multiplier
        base.setFrequency(frequency);
      }
    },
  };
}
