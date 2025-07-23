import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useExternalInput } from "../useExternalInput";
import { useSynthStore } from "@/store/synthStore";
import type { SynthState } from "@/store/types/synth";
import { AUDIO } from "@/config";

// Mock the audio utils
vi.mock("@/utils/audioUtils", () => ({
  resetGain: vi.fn(),
}));

// Mock the synth store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

// Mock navigator.mediaDevices
const mockGetUserMedia = vi.fn();
Object.defineProperty(navigator, "mediaDevices", {
  value: {
    getUserMedia: mockGetUserMedia,
  },
  writable: true,
});

// Mock AudioContext
const mockAudioContext = {
  state: "running" as AudioContextState,
  createGain: vi.fn(() => ({
    gain: { value: 0, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createAnalyser: vi.fn(() => ({
    fftSize: AUDIO.EXTERNAL_INPUT_FFT_SIZE,
    frequencyBinCount: AUDIO.EXTERNAL_INPUT_FREQUENCY_BIN_COUNT,
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createMediaStreamSource: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  destination: {} as AudioDestinationNode,
  currentTime: 0,
  baseLatency: 0,
  outputLatency: 0,
  close: vi.fn(),
  createMediaElementSource: vi.fn(),
  createOscillator: vi.fn(),
  createBufferSource: vi.fn(),
  createBiquadFilter: vi.fn(),
  createIIRFilter: vi.fn(),
  createWaveShaper: vi.fn(),
  createPanner: vi.fn(),
  createStereoPanner: vi.fn(),
  createConvolver: vi.fn(),
  createDynamicsCompressor: vi.fn(),
  createScriptProcessor: vi.fn(),
  createChannelSplitter: vi.fn(),
  createChannelMerger: vi.fn(),
  createDelay: vi.fn(),
  createPeriodicWave: vi.fn(),
  decodeAudioData: vi.fn(),
  resume: vi.fn(),
  suspend: vi.fn(),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
  dispatchEvent: vi.fn(),
} as unknown as AudioContext;

// Helper function to create mock store state
const createMockStoreState = (
  externalEnabled: boolean,
  externalVolume: number
): SynthState => ({
  isDisabled: false,
  activeKeys: null,
  keyboardRef: { synth: null },
  pitchWheel: 0,
  modWheel: 0,
  masterTune: 0,
  oscillator1: {
    waveform: "triangle",
    frequency: 0,
    range: "8",
    enabled: true,
  },
  oscillator2: {
    waveform: "triangle",
    frequency: 0,
    range: "8",
    enabled: true,
  },
  oscillator3: {
    waveform: "triangle",
    frequency: 0,
    range: "8",
    enabled: true,
  },
  mixer: {
    osc1: { enabled: true, volume: 5 },
    osc2: { enabled: true, volume: 5 },
    osc3: { enabled: true, volume: 5 },
    noise: { enabled: false, volume: 0, noiseType: "white" },
    external: {
      enabled: externalEnabled,
      volume: externalVolume,
      overload: false,
    },
  },
  mainVolume: 5,
  isMainActive: true,
  glideOn: false,
  glideTime: 0,
  filterAttack: 0,
  filterDecay: 0,
  filterSustain: 0,
  filterCutoff: 0,
  filterEmphasis: 0,
  filterContourAmount: 0,
  filterModulationOn: false,
  keyboardControl1: false,
  keyboardControl2: false,
  oscillatorModulationOn: false,
  lfoWaveform: "triangle",
  lfoRate: 0,
  osc3Control: false,
  modMix: 0,
  osc3FilterEgSwitch: false,
  noiseLfoSwitch: false,
  loudnessAttack: 0,
  loudnessDecay: 0,
  loudnessSustain: 0,
  decaySwitchOn: false,
  tunerOn: false,
  auxOutput: { enabled: false, volume: 0 },
});

describe("useExternalInput", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserMedia.mockResolvedValue({});

    // Mock requestAnimationFrame
    global.requestAnimationFrame = vi.fn((cb) => {
      setTimeout(cb, 16);
      return 1;
    });

    global.cancelAnimationFrame = vi.fn();

    // Ensure navigator.mediaDevices is properly mocked
    Object.defineProperty(navigator, "mediaDevices", {
      value: {
        getUserMedia: mockGetUserMedia,
      },
      writable: true,
    });
  });

  it("should not request microphone access when External Input is disabled", async () => {
    const mockUseSynthStore = vi.mocked(useSynthStore);
    mockUseSynthStore.mockReturnValue(createMockStoreState(false, 0));

    renderHook(() => useExternalInput(mockAudioContext, undefined));

    // Wait for effects to run
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    // Should not request microphone access
    expect(mockGetUserMedia).not.toHaveBeenCalled();
  });

  it("should return audio level when External Input is enabled", async () => {
    const mockUseSynthStore = vi.mocked(useSynthStore);
    mockUseSynthStore.mockReturnValue(createMockStoreState(true, 5));

    const { result } = renderHook(() =>
      useExternalInput(mockAudioContext, undefined)
    );

    // Wait for effects to run
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    // Should have audio level property
    expect(result.current.audioLevel).toBeDefined();
    expect(typeof result.current.audioLevel).toBe("number");
  });

  it("should handle microphone access denial gracefully", async () => {
    const mockUseSynthStore = vi.mocked(useSynthStore);
    mockUseSynthStore.mockReturnValue(createMockStoreState(true, 5));

    // Mock getUserMedia to reject
    mockGetUserMedia.mockRejectedValue(new Error("Permission denied"));

    const { result } = renderHook(() =>
      useExternalInput(mockAudioContext, undefined)
    );

    // Wait for effects to run
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    // Should still return audio level (will be 0 when disabled)
    expect(result.current.audioLevel).toBeDefined();
    expect(typeof result.current.audioLevel).toBe("number");
  });

  it("should not request microphone access if already granted", async () => {
    const mockUseSynthStore = vi.mocked(useSynthStore);
    mockUseSynthStore.mockReturnValue(createMockStoreState(true, 5));

    const { rerender } = renderHook(() =>
      useExternalInput(mockAudioContext, undefined)
    );

    // Wait for first effect to run
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    // Clear the mock to track subsequent calls
    mockGetUserMedia.mockClear();

    // Rerender with same enabled state
    rerender();

    // Wait for effects to run again
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    // Should not request microphone access again
    expect(mockGetUserMedia).not.toHaveBeenCalled();
  });
});
