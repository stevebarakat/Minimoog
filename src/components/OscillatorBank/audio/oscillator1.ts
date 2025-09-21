import {
  BaseOscillatorParams,
  BaseOscillatorInstance,
  createBaseOscillator,
  createPulseWave,
} from "./baseOscillator";
import { OSCILLATOR } from "@/config";

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
  const n = OSCILLATOR.HARMONICS_COUNT; // Increased harmonics for fatter sound
  const real = new Float32Array(n);
  const imag = new Float32Array(n);
  for (let i = 1; i < n; i++) {
    const triangle =
      i % 2 === 1
        ? (8 / Math.PI ** 2) * (1 / i ** 2) * (i % 4 === 1 ? 1 : -1)
        : 0;
    const saw = (2 / (i * Math.PI)) * (i % 2 === 0 ? 0 : 1);

    // Enhanced blend with more sawtooth content for fatter sound
    let harmonic = 0.2 * triangle + 0.8 * saw; // More sawtooth for buzz

    // Add more aggressive even harmonic content for buzz/warmth
    if (i % 2 === 0 && i <= 20) {
      const evenHarmonic = (1 / (i * Math.PI)) * 0.25; // Stronger even harmonics
      harmonic += evenHarmonic;
    }

    // Add specific buzz harmonics (2nd, 3rd, 5th, 7th)
    if (i === 2) harmonic *= 1.3; // Strong 2nd harmonic for warmth
    if (i === 3) harmonic *= 1.4; // Strong 3rd harmonic for buzz
    if (i === 5) harmonic *= 1.25; // 5th harmonic
    if (i === 7) harmonic *= 1.2; // 7th harmonic

    // Enhance lower harmonics more aggressively
    if (i <= 12) {
      harmonic *= 1.15 + 0.15 / i; // Stronger boost for lower harmonics
    }

    // Add subtle high-frequency buzz content
    if (i > 20 && i <= 50) {
      harmonic *= 1.05; // Slight boost for presence
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

export function createOscillator1(
  params: Osc1Params,
  mixerNode?: AudioNode
): Osc1Instance {
  return createBaseOscillator(params, getCustomWave, mixerNode);
}
