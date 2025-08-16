import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useModulation } from "../useModulation";

// Mock the store with different modMix values for testing
const createMockStore = (
  modMix: number,
  lfoRate: number = 5,
  lfoWaveform: "triangle" | "square" = "triangle"
) => ({
  useSynthStore: vi.fn(() => ({
    lfoRate,
    lfoWaveform,
    oscillator3: { waveform: "triangle" },
    osc3Control: false,
    osc3FilterEgSwitch: false,
    noiseLfoSwitch: false,
    modMix,
    modWheel: 50,
    oscillatorModulationOn: false,
    filterModulationOn: false,
    filterType: "huovilainen",
  })),
});

vi.mock("../utils/synthUtils", () => ({
  mapOscillatorType: vi.fn(() => "triangle"),
}));

vi.mock("@/utils", () => ({
  getPooledNode: vi.fn((type) => {
    if (type === "oscillator") {
      return {
        type: "triangle",
        frequency: {
          value: 440,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      };
    }
    if (type === "gain") {
      return {
        gain: { setValueAtTime: vi.fn() },
        connect: vi.fn(),
        disconnect: vi.fn(),
      };
    }
    return {};
  }),
  releaseNode: vi.fn(),
  mapCutoff: vi.fn((val) => val * 100), // Simple mock mapping
  log: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

describe("useModulation", () => {
  let mockAudioContext: unknown;
  let mockAudioWorkletNode: unknown;

  beforeEach(() => {
    mockAudioWorkletNode = {
      port: { postMessage: vi.fn(), onmessage: vi.fn() },
      parameters: new Map(),
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
      createOscillator: vi.fn(() => ({
        type: "triangle",
        frequency: {
          value: 440,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      createBuffer: vi.fn(() => ({
        getChannelData: vi.fn(() => new Float32Array(10)),
      })),
      createBufferSource: vi.fn(() => ({
        buffer: null,
        loop: false,
        connect: vi.fn(),
        disconnect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
      })),
      sampleRate: 44100,
      currentTime: 0,
      destination: {},
    };
    global.AudioWorkletNode = vi.fn(
      () => mockAudioWorkletNode
    ) as unknown as typeof AudioWorkletNode;
  });

  it("sets up modulation without errors", () => {
    vi.doMock("@/store/synthStore", createMockStore(5));

    expect(() => {
      renderHook(() =>
        useModulation({
          audioContext: mockAudioContext as AudioContext,
          osc1: { getNode: vi.fn() },
          osc2: { getNode: vi.fn() },
          osc3: { getNode: vi.fn() },
          filterNode: mockAudioWorkletNode as AudioWorkletNode,
        })
      );
    }).not.toThrow();
  });

  it("handles different modulation mix values without errors", () => {
    vi.doMock("@/store/synthStore", createMockStore(0));

    expect(() => {
      renderHook(() =>
        useModulation({
          audioContext: mockAudioContext as AudioContext,
          osc1: { getNode: vi.fn() },
          osc2: { getNode: vi.fn() },
          osc3: { getNode: vi.fn() },
          filterNode: mockAudioWorkletNode as AudioWorkletNode,
        })
      );
    }).not.toThrow();
  });

  it("handles different LFO rates without errors", () => {
    vi.doMock("@/store/synthStore", createMockStore(5, 8));

    expect(() => {
      renderHook(() =>
        useModulation({
          audioContext: mockAudioContext as AudioContext,
          osc1: { getNode: vi.fn() },
          osc2: { getNode: vi.fn() },
          osc3: { getNode: vi.fn() },
          filterNode: mockAudioWorkletNode as AudioWorkletNode,
        })
      );
    }).not.toThrow();
  });

  it("handles different LFO waveforms without errors", () => {
    vi.doMock("@/store/synthStore", createMockStore(5, 5, "square"));

    expect(() => {
      renderHook(() =>
        useModulation({
          audioContext: mockAudioContext as AudioContext,
          osc1: { getNode: vi.fn() },
          osc2: { getNode: vi.fn() },
          osc3: { getNode: vi.fn() },
          filterNode: mockAudioWorkletNode as AudioWorkletNode,
        })
      );
    }).not.toThrow();
  });

  it("handles null audio context gracefully", () => {
    vi.doMock("@/store/synthStore", createMockStore(5));

    expect(() => {
      renderHook(() =>
        useModulation({
          audioContext: null,
          osc1: { getNode: vi.fn() },
          osc2: { getNode: vi.fn() },
          osc3: { getNode: vi.fn() },
          filterNode: mockAudioWorkletNode as AudioWorkletNode,
        })
      );
    }).not.toThrow();
  });
});
