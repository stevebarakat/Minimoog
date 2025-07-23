import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useModulation } from "../useModulation";

vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(() => ({
    lfoRate: 5,
    lfoWaveform: "triangle",
    oscillator3: { waveform: "triangle" },
    osc3Control: false,
    osc3FilterEgSwitch: false,
    noiseLfoSwitch: false,
    modMix: 5,
    modWheel: 50,
    oscillatorModulationOn: false,
    filterModulationOn: false,
  })),
}));
vi.mock("../utils/synthUtils", () => ({
  mapOscillatorType: vi.fn(() => "triangle"),
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
});
