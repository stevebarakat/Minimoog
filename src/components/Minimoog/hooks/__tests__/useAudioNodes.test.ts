import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useAudioNodes } from "../useAudioNodes";

vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(() => ({
    filterCutoff: 3,
    filterEmphasis: 5,
    mainVolume: 10,
    isMainActive: true,
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
    expect(result.current).toHaveProperty("masterGain");
    expect(result.current).toHaveProperty("isMixerReady");
  });
});
