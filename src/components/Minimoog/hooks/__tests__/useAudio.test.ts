import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useAudio } from "../useAudio";

vi.mock("../useAudioNodes", () => ({
  useAudioNodes: vi.fn(() => ({
    mixerNode: {},
    filterNode: {},
    loudnessEnvelopeGain: {},
    delayNode: {},
    delayMixGain: {},
    delayFeedbackGain: {},
    dryGain: {},
    masterGain: {},
  })),
}));
vi.mock("../useModulation", () => ({ useModulation: vi.fn() }));
vi.mock("../useEnvelopes", () => ({ useEnvelopes: vi.fn(() => ({})) }));
vi.mock("../useOverflowDirection", () => ({
  useOverflowDirection: vi.fn(() => "containerRef"),
}));
vi.mock("@/components/Noise/hooks", () => ({ useNoise: vi.fn() }));
vi.mock("@/components/OscillatorBank/hooks", () => ({
  useOscillator1: vi.fn(() => "osc1"),
  useOscillator2: vi.fn(() => "osc2"),
  useOscillator3: vi.fn(() => "osc3"),
}));
vi.mock("@/components/Tuner/hooks", () => ({ useTuner: vi.fn() }));
vi.mock("@/components/Output/hooks", () => ({ useAuxOutput: vi.fn() }));
vi.mock("@/components/Keyboard/hooks", () => ({ useMidiHandling: vi.fn() }));
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(() => ({ oscillatorModulationOn: true, modWheel: 50 })),
}));

describe("useAudio", () => {
  it("sets up audio without errors", () => {
    expect(() => {
      renderHook(() => useAudio({} as AudioContext));
    }).not.toThrow();
  });
});
