import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useModulation } from "../useModulation";
import { useSynthStore } from "@/store/synthStore";
import { createMockStore } from "@/test/testHelpers";
import {
  createLfoRateRange,
  createFilterContourRange,
  createModWheelRange,
} from "@/types/branded";

// Mock the store with different modMix values for testing
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

describe("useModulation", () => {
  // Mock AudioContext and AudioWorkletNode for testing
  const mockAudioContext = {
    createOscillator: vi.fn(() => ({
      type: "triangle",
      frequency: { setValueAtTime: vi.fn() },
      start: vi.fn(),
      stop: vi.fn(),
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    createGain: vi.fn(() => ({
      gain: { setValueAtTime: vi.fn() },
      connect: vi.fn(),
      disconnect: vi.fn(),
    })),
    currentTime: 0,
  } as unknown as AudioContext;

  const mockAudioWorkletNode = {
    port: {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      postMessage: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  } as unknown as AudioWorkletNode;

  beforeEach(() => {
    vi.clearAllMocks();
    // Set up global AudioContext mock
    global.AudioContext = vi.fn(() => mockAudioContext) as unknown as typeof AudioContext;
    global.AudioWorkletNode = vi.fn(() => mockAudioWorkletNode) as unknown as typeof AudioWorkletNode;
  });

  it("sets up modulation without errors", () => {
    // Mock the store with all required properties
    vi.mocked(useSynthStore).mockImplementation((selector) => {
      const mockState = createMockStore({
        lfoRate: createLfoRateRange(5),
        lfoWaveform: "triangle",
        filterContourAmount: createFilterContourRange(5),
        filterModulationOn: true,
        modWheel: createModWheelRange(50),
      });
      return selector ? selector(mockState) : mockState;
    });

    expect(() => {
      renderHook(() =>
        useModulation({
          audioContext: mockAudioContext,
          osc1: { getNode: vi.fn() },
          osc2: { getNode: vi.fn() },
          osc3: { getNode: vi.fn() },
          filterNode: mockAudioWorkletNode,
        })
      );
    }).not.toThrow();
  });

  it("handles different modulation mix values without errors", () => {
    // Mock the store with modWheel = 0
    vi.mocked(useSynthStore).mockImplementation((selector) => {
      const mockState = createMockStore({
        lfoRate: createLfoRateRange(5),
        lfoWaveform: "triangle",
        filterContourAmount: createFilterContourRange(5),
        filterModulationOn: true,
        modWheel: createModWheelRange(0),
      });
      return selector ? selector(mockState) : mockState;
    });

    expect(() => {
      renderHook(() =>
        useModulation({
          audioContext: mockAudioContext,
          osc1: { getNode: vi.fn() },
          osc2: { getNode: vi.fn() },
          osc3: { getNode: vi.fn() },
          filterNode: mockAudioWorkletNode,
        })
      );
    }).not.toThrow();
  });

  it("handles different LFO rates without errors", () => {
    // Mock the store with lfoRate = 8
    vi.mocked(useSynthStore).mockImplementation((selector) => {
      const mockState = createMockStore({
        lfoRate: createLfoRateRange(8),
        lfoWaveform: "triangle",
        filterContourAmount: createFilterContourRange(5),
        filterModulationOn: true,
        modWheel: createModWheelRange(50),
      });
      return selector ? selector(mockState) : mockState;
    });

    expect(() => {
      renderHook(() =>
        useModulation({
          audioContext: mockAudioContext,
          osc1: { getNode: vi.fn() },
          osc2: { getNode: vi.fn() },
          osc3: { getNode: vi.fn() },
          filterNode: mockAudioWorkletNode,
        })
      );
    }).not.toThrow();
  });

  it("handles different LFO waveforms without errors", () => {
    // Mock the store with lfoWaveform = "square"
    vi.mocked(useSynthStore).mockImplementation((selector) => {
      const mockState = createMockStore({
        lfoRate: createLfoRateRange(5),
        lfoWaveform: "square",
        filterContourAmount: createFilterContourRange(5),
        filterModulationOn: true,
        modWheel: createModWheelRange(50),
      });
      return selector ? selector(mockState) : mockState;
    });

    expect(() => {
      renderHook(() =>
        useModulation({
          audioContext: mockAudioContext,
          osc1: { getNode: vi.fn() },
          osc2: { getNode: vi.fn() },
          osc3: { getNode: vi.fn() },
          filterNode: mockAudioWorkletNode,
        })
      );
    }).not.toThrow();
  });

  it("handles null audio context gracefully", () => {
    // Mock the store with all required properties
    vi.mocked(useSynthStore).mockImplementation((selector) => {
      const mockState = createMockStore({
        lfoRate: createLfoRateRange(5),
        lfoWaveform: "triangle",
        filterContourAmount: createFilterContourRange(5),
        filterModulationOn: true,
        modWheel: createModWheelRange(50),
      });
      return selector ? selector(mockState) : mockState;
    });

    expect(() => {
      renderHook(() =>
        useModulation({
          audioContext: null,
          osc1: { getNode: vi.fn() },
          osc2: { getNode: vi.fn() },
          osc3: { getNode: vi.fn() },
          filterNode: mockAudioWorkletNode,
        })
      );
    }).not.toThrow();
  });
});
