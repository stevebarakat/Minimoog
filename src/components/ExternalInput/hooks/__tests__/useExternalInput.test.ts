import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useExternalInput } from "../useExternalInput";
import { useSynthStore } from "@/store/synthStore";

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
  state: "running",
  createGain: vi.fn(() => ({
    gain: { value: 0, setValueAtTime: vi.fn() },
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createAnalyser: vi.fn(() => ({
    fftSize: 256,
    frequencyBinCount: 128,
    getByteFrequencyData: vi.fn(),
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  createMediaStreamSource: vi.fn(() => ({
    connect: vi.fn(),
    disconnect: vi.fn(),
  })),
  destination: {},
  currentTime: 0,
};

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
  });

  it("should not request microphone access when External Input is disabled", async () => {
    const mockUseSynthStore = vi.mocked(useSynthStore);
    mockUseSynthStore.mockReturnValue({
      mixer: {
        external: {
          enabled: false,
          volume: 0,
        },
      },
    } as any);

    renderHook(() => useExternalInput(mockAudioContext as any, null));

    // Wait for effects to run
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    // Should not request microphone access
    expect(mockGetUserMedia).not.toHaveBeenCalled();
  });

  it("should request microphone access when External Input is enabled", async () => {
    const mockUseSynthStore = vi.mocked(useSynthStore);
    mockUseSynthStore.mockReturnValue({
      mixer: {
        external: {
          enabled: true,
          volume: 5,
        },
      },
    } as any);

    renderHook(() => useExternalInput(mockAudioContext as any, null));

    // Wait for effects to run
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    // Should request microphone access
    expect(mockGetUserMedia).toHaveBeenCalledWith({ audio: true });
  });

  it("should update microphone permission state when access is granted", async () => {
    const mockUseSynthStore = vi.mocked(useSynthStore);
    mockUseSynthStore.mockReturnValue({
      mixer: {
        external: {
          enabled: true,
          volume: 5,
        },
      },
    } as any);

    const { result } = renderHook(() =>
      useExternalInput(mockAudioContext as any, null)
    );

    // Wait for effects to run
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    // Should have granted permission
    expect(result.current.microphonePermission).toBe("granted");
  });

  it("should update microphone permission state when access is denied", async () => {
    const mockUseSynthStore = vi.mocked(useSynthStore);
    mockUseSynthStore.mockReturnValue({
      mixer: {
        external: {
          enabled: true,
          volume: 5,
        },
      },
    } as any);

    // Mock getUserMedia to reject
    mockGetUserMedia.mockRejectedValue(new Error("Permission denied"));

    const { result } = renderHook(() =>
      useExternalInput(mockAudioContext as any, null)
    );

    // Wait for effects to run
    await act(() => new Promise((resolve) => setTimeout(resolve, 0)));

    // Should have denied permission
    expect(result.current.microphonePermission).toBe("denied");
  });

  it("should not request microphone access if already granted", async () => {
    const mockUseSynthStore = vi.mocked(useSynthStore);
    mockUseSynthStore.mockReturnValue({
      mixer: {
        external: {
          enabled: true,
          volume: 5,
        },
      },
    } as any);

    const { rerender } = renderHook(() =>
      useExternalInput(mockAudioContext as any, null)
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
