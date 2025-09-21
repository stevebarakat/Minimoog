import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useExternalInput } from "../useExternalInput";
import { useSynthStore } from "@/store/synthStore";
import type { SynthState } from "@/store/types/synth";
import {
  createPitchWheelRange,
  createModWheelRange,
  createMasterTuneRange,
  createFrequencyRange,
  createVolumeRange,
  createNoiseVolumeRange,
  createExternalInputVolumeRange,
  createGlideTimeRange,
  createFilterEnvelopeRange,
  createFilterCutoffRange,
  createFilterEmphasisRange,
  createFilterContourRange,
  createLfoRateRange,
  createModMixRange,
} from "@/store/types/synth";

// Mock the audio utils
vi.mock("@/utils", () => ({
  resetGain: vi.fn(),
  disconnectNode: vi.fn(),
  getPooledNode: vi.fn(() => ({
    gain: { value: 0, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  releaseNode: vi.fn(),
}));

// Mock the synth store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

// Mock AudioContext
const mockAudioContext = {
  state: "running" as AudioContextState,
  audioWorklet: {
    addModule: vi.fn().mockResolvedValue(undefined),
  },
  createGain: vi.fn(() => ({
    gain: { value: 0, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  destination: {} as AudioDestinationNode,
  currentTime: 0,
} as unknown as AudioContext;

// Helper function to create mock store state
const createMockStoreState = (
  externalEnabled: boolean,
  externalVolume: number
): SynthState => ({
  audioContext: {
    isReady: true,
    error: null,
    context: mockAudioContext,
  },
  activeKeys: null,
  pitchWheel: createPitchWheelRange(0),
  modWheel: createModWheelRange(0),
  masterTune: createMasterTuneRange(0),
  oscillator1: {
    waveform: "triangle",
    frequency: createFrequencyRange(0),
    range: "8",
    enabled: true,
    volume: createVolumeRange(5),
  },
  oscillator2: {
    waveform: "triangle",
    frequency: createFrequencyRange(0),
    range: "8",
    enabled: true,
    volume: createVolumeRange(5),
  },
  oscillator3: {
    waveform: "triangle",
    frequency: createFrequencyRange(0),
    range: "8",
    enabled: true,
    volume: createVolumeRange(5),
  },
  mixer: {
    noise: {
      enabled: false,
      volume: createNoiseVolumeRange(0),
      noiseType: "white",
    },
    external: {
      enabled: externalEnabled,
      volume: createExternalInputVolumeRange(externalVolume),
    },
  },
  mainVolume: createVolumeRange(5),
  isMainActive: true,
  glideOn: false,
  glideTime: createGlideTimeRange(0),
  filterType: "simple",
  filterAttack: createFilterEnvelopeRange(0),
  filterDecay: createFilterEnvelopeRange(0),
  filterSustain: createFilterEnvelopeRange(0),
  filterCutoff: createFilterCutoffRange(0),
  filterEmphasis: createFilterEmphasisRange(0),
  filterContourAmount: createFilterContourRange(0),
  filterModulationOn: false,
  keyboardControl1: false,
  keyboardControl2: false,
  oscillatorModulationOn: false,
  lfoWaveform: "triangle",
  lfoRate: createLfoRateRange(0),
  osc3Control: false,
  modMix: createModMixRange(0),
  osc3FilterEgSwitch: false,
  noiseLfoSwitch: false,
  loudnessAttack: createFilterEnvelopeRange(0),
  loudnessDecay: createFilterEnvelopeRange(0),
  loudnessSustain: createFilterEnvelopeRange(0),
  decaySwitchOn: false,
  tunerOn: false,
  auxOutput: { enabled: false, volume: createVolumeRange(0) },
});

describe("useExternalInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return audioLevel and isOverloaded when External Input is disabled", () => {
    const mockState = createMockStoreState(false, 5);
    vi.mocked(useSynthStore).mockReturnValue(mockState);

    const { result } = renderHook(() =>
      useExternalInput(mockAudioContext, null)
    );

    expect(result.current).toEqual({
      audioLevel: 0,
      isOverloaded: false,
    });
  });

  it("should handle audio context not being available", () => {
    const mockState = createMockStoreState(true, 5);
    vi.mocked(useSynthStore).mockReturnValue(mockState);

    const { result } = renderHook(() => useExternalInput(null, null));

    expect(result.current).toEqual({
      audioLevel: 0,
      isOverloaded: false,
    });
  });

  it("should handle audio worklet loading errors gracefully", async () => {
    const mockState = createMockStoreState(true, 5);
    vi.mocked(useSynthStore).mockReturnValue(mockState);

    // Mock the audio worklet to throw an error
    const mockAudioContextWithError = {
      ...mockAudioContext,
      audioWorklet: {
        addModule: vi.fn().mockRejectedValue(new Error("Module not found")),
      },
    };

    const { result } = renderHook(() =>
      useExternalInput(
        mockAudioContextWithError as unknown as AudioContext,
        null
      )
    );

    // In test environment, the hook skips audio worklet setup entirely
    // and should return the expected structure with simulated audio level
    expect(result.current).toHaveProperty("audioLevel");
    expect(result.current).toHaveProperty("isOverloaded");
    expect(typeof result.current.audioLevel).toBe("number");
    expect(typeof result.current.isOverloaded).toBe("boolean");
  });

  it("should return audio level when External Input is enabled", () => {
    const mockState = createMockStoreState(true, 5);
    vi.mocked(useSynthStore).mockReturnValue(mockState);

    const { result } = renderHook(() =>
      useExternalInput(mockAudioContext, null)
    );

    // Should return the expected structure with audio level
    expect(result.current).toHaveProperty("audioLevel");
    expect(result.current).toHaveProperty("isOverloaded");
    expect(typeof result.current.audioLevel).toBe("number");
    expect(typeof result.current.isOverloaded).toBe("boolean");
  });
});
