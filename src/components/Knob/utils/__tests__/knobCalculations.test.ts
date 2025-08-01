import { describe, it, expect } from "vitest";
import {
  getRotation,
  calculateTickAngle,
  calculateLabelPosition,
} from "../knobCalculations";

describe("getRotation", () => {
  describe("attackDecay type", () => {
    it("should calculate rotation based on knob position range (0-10000)", () => {
      // Test that rotation is linear with respect to knob position
      const min = 0;
      const max = 10000;

      // At position 0, should be at minimum rotation
      const rotation0 = getRotation(0, min, max, "attackDecay");
      expect(rotation0).toBe(-145); // -145 degrees for radial knobs

      // At position 5000 (middle), should be at center rotation
      const rotation5000 = getRotation(5000, min, max, "attackDecay");
      expect(rotation5000).toBe(0); // 0 degrees for radial knobs

      // At position 10000, should be at maximum rotation
      const rotation10000 = getRotation(10000, min, max, "attackDecay");
      expect(rotation10000).toBe(145); // 145 degrees for radial knobs
    });

    it("should handle intermediate positions correctly", () => {
      const min = 0;
      const max = 10000;

      // Test a few intermediate positions to ensure smooth rotation
      const rotation2500 = getRotation(2500, min, max, "attackDecay");
      const rotation7500 = getRotation(7500, min, max, "attackDecay");

      // Should be between -145 and 0 for 2500
      expect(rotation2500).toBeGreaterThan(-145);
      expect(rotation2500).toBeLessThan(0);

      // Should be between 0 and 145 for 7500
      expect(rotation7500).toBeGreaterThan(0);
      expect(rotation7500).toBeLessThan(145);
    });
  });

  describe("other types", () => {
    it("should handle radial type with linear scaling", () => {
      const rotation = getRotation(50, 0, 100, "radial");
      expect(rotation).toBe(0); // 50% should be 0 degrees
    });

    it("should handle arrow type", () => {
      const rotation = getRotation(50, 0, 100, "arrow");
      expect(rotation).toBe(0); // 50% should be 0 degrees for arrow
    });
  });
});

describe("calculateTickAngle", () => {
  describe("attackDecay type", () => {
    it("should calculate tick angles based on knob position range (0-10000)", () => {
      // Test that tick angles are linear with respect to knob position
      const min = 0;
      const max = 10000;

      // At position 0, should be at minimum angle
      const angle0 = calculateTickAngle(0, min, max, "attackDecay");
      expect(angle0).toBe(-150); // -150 degrees for radial knobs

      // At position 5000 (middle), should be at center angle
      const angle5000 = calculateTickAngle(5000, min, max, "attackDecay");
      expect(angle5000).toBe(0); // 0 degrees for radial knobs

      // At position 10000, should be at maximum angle
      const angle10000 = calculateTickAngle(10000, min, max, "attackDecay");
      expect(angle10000).toBe(150); // 150 degrees for radial knobs
    });

    it("should handle intermediate positions correctly", () => {
      const min = 0;
      const max = 10000;

      // Test a few intermediate positions to ensure smooth distribution
      const angle2500 = calculateTickAngle(2500, min, max, "attackDecay");
      const angle7500 = calculateTickAngle(7500, min, max, "attackDecay");

      // Should be between -150 and 0 for 2500
      expect(angle2500).toBeGreaterThan(-150);
      expect(angle2500).toBeLessThan(0);

      // Should be between 0 and 150 for 7500
      expect(angle7500).toBeGreaterThan(0);
      expect(angle7500).toBeLessThan(150);
    });
  });

  describe("other types", () => {
    it("should handle radial type with linear scaling", () => {
      const angle = calculateTickAngle(50, 0, 100, "radial");
      expect(angle).toBe(0); // 50% should be 0 degrees
    });

    it("should handle arrow type", () => {
      const angle = calculateTickAngle(50, 0, 100, "arrow");
      expect(angle).toBe(0); // 50% should be 0 degrees for arrow
    });
  });
});

describe("calculateLabelPosition", () => {
  describe("attackDecay type", () => {
    it("should calculate label positions based on knob position range (0-10000)", () => {
      // Test that label positions are linear with respect to knob position
      const min = 0;
      const max = 10000;

      // At position 0, should be at minimum angle
      const pos0 = calculateLabelPosition(0, min, max, "medium", "attackDecay");
      expect(pos0.x).toBeCloseTo(10.0, 1);
      expect(pos0.y).toBeCloseTo(124.3, 1);

      // At position 5000 (middle), should be at center angle
      const pos5000 = calculateLabelPosition(
        5000,
        min,
        max,
        "medium",
        "attackDecay"
      );
      expect(pos5000.x).toBeCloseTo(50.0, 1);
      expect(pos5000.y).toBeCloseTo(-25.0, 1);

      // At position 10000, should be at maximum angle
      const pos10000 = calculateLabelPosition(
        10000,
        min,
        max,
        "medium",
        "attackDecay"
      );
      expect(pos10000.x).toBeCloseTo(90.0, 1);
      expect(pos10000.y).toBeCloseTo(124.3, 1);
    });
  });
});
