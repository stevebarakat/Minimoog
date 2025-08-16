import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAudioNodes } from "../useAudioNodes";

vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(() => ({
    filterCutoff: 3,
    filterEmphasis: 5,
    mainVolume: 10,
    isMainActive: true,
    delay: {
      enabled: false,
      mix: 5,
      time: 7.5,
      feedback: 3,
    },
    reverb: {
      enabled: false,
      mix: 5,
      decay: 3,
      tone: 5,
    },
  })),
}));
vi.mock("../utils/synthUtils", () => ({
  mapCutoff: vi.fn(() => 440),
}));

// Mock fetch to prevent WASM loading errors in tests
global.fetch = vi.fn(() =>
  Promise.resolve({
    arrayBuffer: () => Promise.resolve(new ArrayBuffer(8)),
  } as Response)
);

describe("useAudioNodes", () => {
  let mockAudioContext: unknown;
  let mockAudioWorkletNode: unknown;

  beforeEach(() => {
    mockAudioWorkletNode = {
      parameters: new Map([
        ["cutoff", { setValueAtTime: vi.fn() }],
        ["resonance", { setValueAtTime: vi.fn() }],
      ]),
      port: {
        postMessage: vi.fn(),
        close: vi.fn(),
      },
      connect: vi.fn(),
      disconnect: vi.fn(),
    };
    mockAudioContext = {
      audioWorklet: {
        addModule: vi.fn().mockResolvedValue(undefined),
      },
      createGain: vi.fn(() => ({
        gain: { value: 1, setValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      createWaveShaper: vi.fn(() => ({
        curve: null,
        oversample: "none",
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      createDelay: vi.fn(() => ({
        delayTime: { value: 0.3, setValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      createConvolver: vi.fn(() => ({
        buffer: null,
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      createBiquadFilter: vi.fn(() => ({
        type: "lowpass",
        frequency: { value: 1000, setValueAtTime: vi.fn() },
        Q: { value: 1, setValueAtTime: vi.fn() },
        gain: { value: 0, setValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
      })),
      createBuffer: vi.fn(() => ({
        length: 44100,
        duration: 1,
        sampleRate: 44100,
        numberOfChannels: 1,
        getChannelData: vi.fn(() => new Float32Array(44100)),
      })),
      createOscillator: vi.fn(),
      createAnalyser: vi.fn(),
      currentTime: 0,
      destination: {},
    };
    global.AudioWorkletNode = vi.fn(
      () => mockAudioWorkletNode
    ) as unknown as typeof AudioWorkletNode;
  });

  it("returns the expected structure after setup", async () => {
    const { result, rerender } = renderHook(() =>
      useAudioNodes(mockAudioContext as AudioContext)
    );
    // Wait for useEffect to run (workaround: rerender after a tick)
    await act(() => Promise.resolve());
    rerender();
    expect(result.current).toHaveProperty("mixerNode");
    expect(result.current).toHaveProperty("filterNode");
    expect(result.current).toHaveProperty("loudnessEnvelopeGain");
    expect(result.current).toHaveProperty("delayNode");
    expect(result.current).toHaveProperty("delayMixGain");
    expect(result.current).toHaveProperty("delayFeedbackGain");
    expect(result.current).toHaveProperty("reverbNode");
    expect(result.current).toHaveProperty("reverbMixGain");
    expect(result.current).toHaveProperty("toneFilterNode");
    expect(result.current).toHaveProperty("dryGain");
    expect(result.current).toHaveProperty("masterGain");
    expect(result.current).toHaveProperty("isMixerReady");
  });
});
