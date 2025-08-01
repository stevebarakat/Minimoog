import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFilterTracking } from "../useFilterTracking";
import * as synthStore from "@/store/synthStore";

// Mock mapCutoff and noteToMidiNote
vi.mock("@/utils", () => ({
  noteToMidiNote: vi.fn(() => 60),
  mapCutoff: vi.fn(() => 1234),
}));

describe("useFilterTracking", () => {
  let setValueAtTime: ReturnType<typeof vi.fn>;
  let filterNode: AudioWorkletNode;

  beforeEach(() => {
    setValueAtTime = vi.fn();
    filterNode = {
      parameters: {
        get: vi.fn(() => ({
          setValueAtTime,
        })),
      },
    } as unknown as AudioWorkletNode;

    vi.spyOn(synthStore, "useSynthStore").mockImplementation(() => ({
      filterCutoff: 3,
      keyboardControl1: false,
      keyboardControl2: false,
    }));

    // Mock getState for useSynthStore
    (
      synthStore.useSynthStore as unknown as {
        getState: () => {
          filterCutoff: number;
          keyboardControl1: boolean;
          keyboardControl2: boolean;
        };
      }
    ).getState = () => ({
      filterCutoff: 3,
      keyboardControl1: false,
      keyboardControl2: false,
    });
  });

  it("sets frequency when activeKeys changes and keyboard control is enabled", () => {
    // Enable keyboard control
    (
      synthStore.useSynthStore as unknown as {
        getState: () => {
          filterCutoff: number;
          keyboardControl1: boolean;
          keyboardControl2: boolean;
        };
      }
    ).getState = () => ({
      filterCutoff: 3,
      keyboardControl1: true, // Enable keyboard control
      keyboardControl2: false,
    });

    renderHook(() =>
      useFilterTracking(
        window.AudioContext
          ? new window.AudioContext()
          : ({} as unknown as AudioContext),
        filterNode,
        "C4"
      )
    );
    expect(setValueAtTime).toHaveBeenCalled();
  });

  it("does not set frequency when keyboard control is disabled", () => {
    renderHook(() =>
      useFilterTracking(
        window.AudioContext
          ? new window.AudioContext()
          : ({} as unknown as AudioContext),
        filterNode,
        "C4"
      )
    );
    expect(setValueAtTime).not.toHaveBeenCalled();
  });

  it("does not set frequency if filterNode or audioContext is null", () => {
    renderHook(() => useFilterTracking(null, null, "C4"));
    expect(setValueAtTime).not.toHaveBeenCalled();
  });

  it("does not set frequency if no activeKeys", () => {
    // Enable keyboard control
    (
      synthStore.useSynthStore as unknown as {
        getState: () => {
          filterCutoff: number;
          keyboardControl1: boolean;
          keyboardControl2: boolean;
        };
      }
    ).getState = () => ({
      filterCutoff: 3,
      keyboardControl1: true,
      keyboardControl2: false,
    });

    renderHook(() =>
      useFilterTracking(
        window.AudioContext
          ? new window.AudioContext()
          : ({} as unknown as AudioContext),
        filterNode,
        null // No active keys
      )
    );
    expect(setValueAtTime).not.toHaveBeenCalled();
  });
});
