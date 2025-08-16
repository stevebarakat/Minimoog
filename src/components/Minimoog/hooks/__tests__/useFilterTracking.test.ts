import { renderHook } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useFilterTracking } from "../useFilterTracking";

describe("useFilterTracking", () => {
  let filterNode: null;

  beforeEach(() => {
    filterNode = null;
  });

  it("does nothing when called (filter system removed)", () => {
    // Since filter tracking is now a no-op, we just verify it doesn't throw
    expect(() => {
      renderHook(() =>
        useFilterTracking(
          window.AudioContext
            ? new window.AudioContext()
            : ({} as unknown as AudioContext),
          filterNode,
          "C4"
        )
      );
    }).not.toThrow();
  });

  it("does nothing when filterNode is null", () => {
    expect(() => {
      renderHook(() => useFilterTracking(null, null, "C4"));
    }).not.toThrow();
  });

  it("does nothing when audioContext is null", () => {
    expect(() => {
      renderHook(() => useFilterTracking(null, filterNode, "C4"));
    }).not.toThrow();
  });

  it("does nothing when no activeKeys", () => {
    expect(() => {
      renderHook(() =>
        useFilterTracking(
          window.AudioContext
            ? new window.AudioContext()
            : ({} as unknown as AudioContext),
          filterNode,
          null // No active keys
        )
      );
    }).not.toThrow();
  });
});
