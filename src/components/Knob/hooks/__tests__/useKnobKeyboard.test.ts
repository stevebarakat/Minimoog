import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook } from "@testing-library/react";
import { useKnobKeyboard } from "../useKnobKeyboard";
import * as utils from "../../utils";

// Mock the calculateValueFromDelta function
vi.mock("../../utils", () => ({
  calculateValueFromDelta: vi.fn(),
}));

describe("useKnobKeyboard", () => {
  const mockOnChange = vi.fn();
  const mockCalculateValueFromDelta = vi.mocked(utils.calculateValueFromDelta);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("keyboard interaction", () => {
    it("should use normal step size for radial type", () => {
      const { result } = renderHook(() =>
        useKnobKeyboard({
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

      // Verify that calculateValueFromDelta was called with the correct parameters
      expect(mockCalculateValueFromDelta).toHaveBeenCalledWith(
        10, // stepSize * 10 = 1 * 10 = 10 (normal behavior)
        50, // startValue
        1, // sensitivity
        0, // min
        100, // max
        1, // step
        "radial", // type
        false, // logarithmic
        undefined // size
      );

      expect(mockOnChange).toHaveBeenCalledWith(60);
    });

    it("should use larger step size with shift key", () => {
      const { result } = renderHook(() =>
        useKnobKeyboard({
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

      // Verify that calculateValueFromDelta was called with the correct parameters
      expect(mockCalculateValueFromDelta).toHaveBeenCalledWith(
        100, // stepSize * 10 = (1 * 10) * 10 = 100 (shift behavior)
        50, // startValue
        1, // sensitivity
        0, // min
        100, // max
        1, // step
        "radial", // type
        false, // logarithmic
        undefined // size
      );

      expect(mockOnChange).toHaveBeenCalledWith(150);
    });
  });
});
