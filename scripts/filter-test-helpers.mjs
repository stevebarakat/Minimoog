import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";

export const filterDirectory = fileURLToPath(
  new URL("../public/audio/moog-filters/huovilainen/", import.meta.url)
);

export const scenarios = [
  ...[20, 50, 1000, 5000, 15000, 21168].flatMap((cutoff) =>
    [0, 0.5, 1, 2].map((resonance) => ({
      name: `tone-${cutoff}-${resonance}`,
      signal: "tone", cutoff, resonance,
    }))
  ),
  { name: "silence", signal: "silence", cutoff: 1000, resonance: 0.5 },
  { name: "impulse", signal: "impulse", cutoff: 1000, resonance: 0.5 },
  { name: "step", signal: "step", cutoff: 5000, resonance: 0.5 },
  { name: "parameter-sweep", signal: "tone", cutoff: 50, resonance: 0 },
  { name: "envelope", signal: "tone", cutoff: 1000, resonance: 0.5 },
  { name: "manual-envelope", signal: "tone", cutoff: 1000, resonance: 0.5 },
];

export async function instantiateFilter(binary) {
  const memory = new WebAssembly.Memory({ initial: 64, maximum: 128 });
  const { instance } = await WebAssembly.instantiate(binary, {
    env: { memory, __memory_base: 0, fmin: Math.min, exp: Math.exp, tanh: Math.tanh },
  });
  const exports = instance.exports;
  exports.init();
  return {
    exports,
    input: new Float32Array(memory.buffer, exports.inputBufferPtr(), 128),
    output: new Float32Array(memory.buffer, exports.outputBufferPtr(), 128),
  };
}

export async function readFilterBinary() {
  return readFile(new URL("../public/audio/moog-filters/huovilainen/huovilainenFilterKernel.wasm", import.meta.url));
}

// The fixture is captured from the deployed pre-PR binary, not from a
// second implementation of the filter under test.
export async function renderScenario(binary, scenario) {
  const { exports: e, input, output } = await instantiateFilter(binary);
  e.setCutoff(scenario.cutoff);
  e.setResonance(scenario.resonance);
  const captureFrames = new Set([0, 1, 5, 15, 31, 63, 95, 127]);
  const samples = [];
  let squares = 0;
  let peak = 0;

  for (let frame = 0; frame < 128; frame++) {
    const time = frame * 128 / 44100;
    e.updateEnvelope(time);
    if (scenario.name === "parameter-sweep") {
      e.setCutoff(50 + frame * 125);
      e.setResonance(frame / 128);
    }
    if (scenario.name === "envelope") {
      if (frame === 0) {
        e.setEnvelopeDecayTime(0.03);
        e.setEnvelopeSustainLevel(0.4);
        e.setEnvelopeAttack(100, 5000, 0.02);
      }
      if (frame === 80) e.setEnvelopeRelease(100, 0.05);
      if (frame === 110) e.setEnvelopeActive(0);
    }
    if (scenario.name === "manual-envelope") {
      if (frame === 0) e.setEnvelopeActive(1);
      e.setEnvelopeCutoff(100 + frame * 90);
      if (frame === 90) e.setEnvelopeActive(0);
    }
    for (let i = 0; i < 128; i++) {
      const n = frame * 128 + i;
      switch (scenario.signal) {
        case "silence": input[i] = 0; break;
        case "impulse": input[i] = n === 0 ? 0.5 : 0; break;
        case "step": input[i] = n < 8192 ? 0.2 : -0.2; break;
        default:
          input[i] = 0.4 * Math.sin(n * 2 * Math.PI * 220 / 44100)
            + 0.1 * Math.sin(n * 2 * Math.PI * 1973 / 44100);
      }
    }
    e.filter();
    for (const sample of output) {
      if (!Number.isFinite(sample)) throw new Error(`Nonfinite audio in ${scenario.name}`);
      squares += sample * sample;
      peak = Math.max(peak, Math.abs(sample));
    }
    if (captureFrames.has(frame)) samples.push(...[0, 17, 63, 127].map((i) => output[i]));
  }
  return { samples, peak, rms: Math.sqrt(squares / (128 * 128)) };
}
