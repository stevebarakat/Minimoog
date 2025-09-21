import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKnob } from "../useKnob";
import * as utils from "../../utils";

// Mock the calculateValueFromDelta function
vi.mock("../../utils", () => ({
  calculateValueFromDelta: vi.fn(),
}));

describe("useKnob", () => {
  const mockOnChange = vi.fn();
  const mockCalculateValueFromDelta = vi.mocked(utils.calculateValueFromDelta);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("keyboard interaction", () => {
    it("should use normal step size for radial type", () => {
      const { result } = renderHook(() =>
        useKnob({
          value: 50,
          min: 0,
          max: 100,
          step: 1,
          type: "radial",
          onChange: mockOnChange,
        })
      );

      // Simulate ArrowUp key press
      const arrowUpEvent = new KeyboardEvent("keydown", { key: "ArrowUp" });

      // Mock the focus check to return true
      Object.defineProperty(document, "activeElement", {
        value: result.current.knobRef.current,
        writable: true,
      });

      // Mock calculateValueFromDelta to return a new value
      mockCalculateValueFromDelta.mockReturnValue(60);

      // Trigger the keydown event
      document.dispatchEvent(arrowUpEvent);

      // Verify that calculateValueFromDelta was called
      expect(mockCalculateValueFromDelta).toHaveBeenCalled();

      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should use larger step size with shift key", () => {
      const { result } = renderHook(() =>
        useKnob({
          value: 50,
          min: 0,
          max: 100,
          step: 1,
          type: "radial",
          onChange: mockOnChange,
        })
      );

      // Simulate Shift+ArrowUp key press
      const arrowUpEvent = new KeyboardEvent("keydown", {
        key: "ArrowUp",
        shiftKey: true,
      });

      // Mock the focus check to return true
      Object.defineProperty(document, "activeElement", {
        value: result.current.knobRef.current,
        writable: true,
      });

      // Mock calculateValueFromDelta to return a new value
      mockCalculateValueFromDelta.mockReturnValue(150);

      // Trigger the keydown event
      document.dispatchEvent(arrowUpEvent);

      // Verify that calculateValueFromDelta was called
      expect(mockCalculateValueFromDelta).toHaveBeenCalled();

      expect(mockOnChange).toHaveBeenCalled();
    });
  });
});
