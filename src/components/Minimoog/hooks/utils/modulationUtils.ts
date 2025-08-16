import type { ModulationState } from "./types";

export function calculateLfoFrequency(lfoRate: number): number {
  const minHz = 0.2;
  const maxHz = 20;
  const calculatedFreq = minHz * Math.pow(maxHz / minHz, lfoRate / 10);
  return Math.max(0.2, Math.min(20, calculatedFreq));
}

export function createPinkNoiseGenerator() {
  const state = { b0: 0, b1: 0, b2: 0, b3: 0, b4: 0, b5: 0 };

  return (): number => {
    const white = Math.random() * 2 - 1;
    state.b0 = 0.99886 * state.b0 + white * 0.0555179;
    state.b1 = 0.99332 * state.b1 + white * 0.0750759;
    state.b2 = 0.969 * state.b2 + white * 0.153852;
    state.b3 = 0.8665 * state.b3 + white * 0.3104856;
    state.b4 = 0.55 * state.b4 + white * 0.5329522;
    state.b5 = -0.7616 * state.b5 - white * 0.016898;
    const b6 = white * 0.5362;
    const out =
      (state.b0 + state.b1 + state.b2 + state.b3 + state.b4 + state.b5 + b6) *
      0.11;
    return Math.max(-1, Math.min(1, out));
  };
}

export function createRedNoiseGenerator() {
  const state = { y: 0 };

  return (): number => {
    const white = Math.random() * 2 - 1;
    state.y = 0.995 * state.y + 0.02 * white;
    return Math.max(-1, Math.min(1, state.y));
  };
}

export function calculateLfoValue(
  time: number,
  frequency: number,
  waveform: "triangle" | "square"
): number {
  const s = Math.sin(2 * Math.PI * frequency * time);
  if (waveform === "triangle") {
    return (2 * Math.asin(s)) / Math.PI;
  }
  return s >= 0 ? 1 : -1;
}

export function mixModulationSources(
  source1: number,
  source2: number,
  mix: number
): number {
  const normalizedMix = Math.max(0, Math.min(1, mix / 10));

  // Authentic Minimoog modulation mixing behavior
  // When mix is centered (5), both sources contribute equally
  // When mix is fully counterclockwise (0), only source1 (OSC 3/Filter EG)
  // When mix is fully clockwise (10), only source2 (Noise/LFO)
  const value = (1 - normalizedMix) * source1 + normalizedMix * source2;

  // Ensure the result stays within the valid range
  return Math.max(-1, Math.min(1, value));
}

export function updateEnvelopeState(
  state: ModulationState["envelope"],
  gateOn: boolean,
  time: number,
  attackSec: number,
  decaySec: number,
  sustainLevel: number,
  decaySwitchOn: boolean
): number {
  const dt = Math.max(0, time - state.lastTime);
  state.lastTime = time;

  if (gateOn && !state.isGateOn) {
    state.stage = "attack";
  } else if (!gateOn && state.isGateOn) {
    state.stage = decaySwitchOn ? "release" : "idle";
  }
  state.isGateOn = gateOn;

  switch (state.stage) {
    case "attack": {
      const k = Math.exp((-5 * dt) / attackSec);
      state.value = 1 - (1 - state.value) * k;
      if (state.value > 0.999) {
        state.stage = "decay";
      }
      break;
    }
    case "decay": {
      const k = Math.exp((-5 * dt) / decaySec);
      state.value = sustainLevel + (state.value - sustainLevel) * k;
      if (Math.abs(state.value - sustainLevel) < 0.001) {
        state.stage = "sustain";
      }
      break;
    }
    case "sustain":
      state.value = sustainLevel;
      break;
    case "release": {
      const k = Math.exp((-5 * dt) / decaySec);
      state.value = state.value * k;
      if (state.value < 0.001) {
        state.stage = "idle";
        state.value = 0;
      }
      break;
    }
    case "idle":
      state.value = 0;
      break;
  }

  return state.value * 2 - 1;
}
