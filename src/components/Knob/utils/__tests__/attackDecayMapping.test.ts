import { describe, it, expect } from "vitest";
import { knobPosToValue, valueToKnobPos } from "@/utils";

describe("attackDecayMapping", () => {
  describe("knobPosToValue", () => {
    it("should convert knob positions to 0-10 range values", () => {
      // Test key positions from the mapping
      expect(knobPosToValue(0)).toBeCloseTo(0, 1); // 0ms -> 0
      expect(knobPosToValue(1000)).toBeCloseTo(1, 1); // 10ms -> 1
      expect(knobPosToValue(2000)).toBeCloseTo(3, 1); // 200ms -> 3
      expect(knobPosToValue(4000)).toBeCloseTo(5, 1); // 600ms -> 5
      expect(knobPosToValue(6000)).toBeCloseTo(6, 1); // 1000ms -> 6
      expect(knobPosToValue(8000)).toBeCloseTo(8, 1); // 5000ms -> 8
      expect(knobPosToValue(10000)).toBeCloseTo(10, 1); // 10000ms -> 10
    });

    it("should handle intermediate positions", () => {
      // Test positions between the defined stops
      expect(knobPosToValue(500)).toBeGreaterThan(0);
      expect(knobPosToValue(500)).toBeLessThan(1);

      expect(knobPosToValue(1500)).toBeGreaterThan(1);
      expect(knobPosToValue(1500)).toBeLessThan(3);
    });

    it("should clamp values at boundaries", () => {
      expect(knobPosToValue(-1000)).toBeCloseTo(0, 1);
      expect(knobPosToValue(15000)).toBeCloseTo(10, 1);
    });
  });

  describe("valueToKnobPos", () => {
    it("should convert 0-10 range values back to knob positions", () => {
      // Test key values from the mapping
      expect(valueToKnobPos(0)).toBeCloseTo(0, 0); // 0 -> 0ms
      expect(valueToKnobPos(1)).toBeCloseTo(1000, 0); // 1 -> 10ms
      expect(valueToKnobPos(3)).toBeCloseTo(2000, 0); // 3 -> 200ms
      expect(valueToKnobPos(5)).toBeCloseTo(4000, 0); // 5 -> 600ms
      expect(valueToKnobPos(6)).toBeCloseTo(6000, 0); // 6 -> 1000ms
      expect(valueToKnobPos(8)).toBeCloseTo(8000, 0); // 8 -> 5000ms
      expect(valueToKnobPos(10)).toBeCloseTo(10000, 0); // 10 -> 10000ms
    });

    it("should handle intermediate values", () => {
      // Test values between the defined stops
      expect(valueToKnobPos(0.5)).toBeGreaterThan(0);
      expect(valueToKnobPos(0.5)).toBeLessThan(1000);

      expect(valueToKnobPos(2)).toBeGreaterThan(1000);
      expect(valueToKnobPos(2)).toBeLessThan(2000);
    });

    it("should clamp values at boundaries", () => {
      expect(valueToKnobPos(-1)).toBeCloseTo(0, 0);
      expect(valueToKnobPos(15)).toBeCloseTo(10000, 0);
    });
  });

  describe("round-trip conversion", () => {
    it("should maintain consistency between knobPosToValue and valueToKnobPos", () => {
      // Test that converting back and forth gives consistent results
      const testPositions = [0, 1000, 2000, 4000, 6000, 8000, 10000];

      testPositions.forEach((pos) => {
        const value = knobPosToValue(pos);
        const backToPos = valueToKnobPos(value);
        expect(backToPos).toBeCloseTo(pos, 0);
      });
    });

    it("should maintain consistency for intermediate values", () => {
      const testValues = [0.5, 2, 4, 7, 9];

      testValues.forEach((value) => {
        const pos = valueToKnobPos(value);
        const backToValue = knobPosToValue(pos);
        expect(backToValue).toBeCloseTo(value, 1);
      });
    });
  });
});
