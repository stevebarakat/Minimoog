import {
  BaseOscillatorParams,
  BaseOscillatorInstance,
  createBaseOscillator,
  createPulseWave,
} from "./baseOscillator";

export type Osc3Params = BaseOscillatorParams & {
  waveform:
    | "triangle"
    | "rev_saw"
    | "sawtooth"
    | "pulse1"
    | "pulse2"
    | "pulse3";
  frequency: number;
};

export type Osc3Instance = BaseOscillatorInstance & {
  updateWithFrequency: (params: Partial<Osc3Params>) => void;
};

const pulseWavesCache = new WeakMap<
  AudioContext,
  { pulse2?: PeriodicWave; pulse3?: PeriodicWave; rev_saw?: PeriodicWave }
>();

function createReverseSawtoothWave(audioContext: AudioContext): PeriodicWave {
  const n = 128; // Increased harmonics for richer sound
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    let harmonic = (-2 / (i * Math.PI)) * (i % 2 === 0 ? 0 : 1);

    // Add subtle even harmonic content for buzz (deterministic)
    if (i % 2 === 0 && i <= 16) {
      const evenHarmonic = (-1 / (i * Math.PI)) * 0.18;
      harmonic += evenHarmonic;
    }

    // Enhance lower harmonics for more fundamental presence
    if (i <= 6) {
      harmonic *= 1.12 + 0.08 / i;
    }

    // Add subtle high-frequency content for brightness
    if (i > 20 && i <= 40) {
      harmonic *= 1.05;
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

  if (waveform === "rev_saw") {
    if (!cache.rev_saw) {
      cache.rev_saw = createReverseSawtoothWave(audioContext);
    }
    return cache.rev_saw;
  } else {
    const type = waveform as "pulse2" | "pulse3";
    if (!cache[type]) {
      const dutyCycle = type === "pulse2" ? 0.25 : 0.1;
      cache[type] = createPulseWave(audioContext, dutyCycle);
    }
    return cache[type]!;
  }
}

export function createOscillator3(
  params: Osc3Params,
  mixerNode?: AudioNode
): Osc3Instance {
  const base = createBaseOscillator(params, getCustomWave, mixerNode);
  return {
    ...base,
    updateWithFrequency: (newParams: Partial<Osc3Params>) => {
      const { waveform, range, frequency } = newParams;
      base.update({ waveform, range });
      if (typeof frequency === "number") {
        // Use setFrequency to apply range multiplier
        base.setFrequency(frequency);
      }
    },
  };
}
