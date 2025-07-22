import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFilterTracking } from "../useFilterTracking";
import * as synthStore from "@/store/synthStore";

// Mock mapCutoff and noteNameToMidi
vi.mock("../utils/synthUtils", () => ({
  mapCutoff: vi.fn(() => 1234),
  noteNameToMidi: vi.fn(() => 60),
}));

describe("useFilterTracking", () => {
  let setValueAtTime: ReturnType<typeof vi.fn>;
  let filterNode: AudioWorkletNode;
  let parameters: Map<string, { setValueAtTime: typeof setValueAtTime }>;

  beforeEach(() => {
    setValueAtTime = vi.fn();
    parameters = new Map([["cutoff", { setValueAtTime }]]);
    filterNode = {
      parameters,
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

  it("sets cutoff parameter when activeKeys changes", () => {
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

  it("does not set cutoff if filterNode or audioContext is null", () => {
    renderHook(() => useFilterTracking(null, null, "C4"));
    expect(setValueAtTime).not.toHaveBeenCalled();
  });
});
