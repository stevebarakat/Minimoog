import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import {
  AudioParamOptimizer,
  initializeAudioParamOptimizer,
  disposeAudioParamOptimizer,
  createOptimizedAudioParam,
  shouldUseNodeSwapping,
} from "../audioParamOptimization";

// Mock AudioParam
function createMockAudioParam(): AudioParam {
  const events: Array<{ type: string; args: unknown[] }> = [];

  return {
    value: 0,
    setValueAtTime: vi.fn((value: number, time: number) => {
      events.push({ type: "setValueAtTime", args: [value, time] });
    }),
    linearRampToValueAtTime: vi.fn((value: number, time: number) => {
      events.push({ type: "linearRampToValueAtTime", args: [value, time] });
    }),
    exponentialRampToValueAtTime: vi.fn((value: number, time: number) => {
      events.push({
        type: "exponentialRampToValueAtTime",
        args: [value, time],
      });
    }),
    setTargetAtTime: vi.fn(
      (value: number, time: number, timeConstant: number) => {
        events.push({
          type: "setTargetAtTime",
          args: [value, time, timeConstant],
        });
      }
    ),
    setValueCurveAtTime: vi.fn(
      (values: Float32Array, time: number, duration: number) => {
        events.push({
          type: "setValueCurveAtTime",
          args: [values, time, duration],
        });
      }
    ),
    cancelScheduledValues: vi.fn((time: number) => {
      events.push({ type: "cancelScheduledValues", args: [time] });
    }),
    cancelAndHoldAtTime: vi.fn((time: number) => {
      events.push({ type: "cancelAndHoldAtTime", args: [time] });
    }),
    events,
  } as unknown as AudioParam;
}

describe("AudioParamOptimization", () => {
  let optimizer: AudioParamOptimizer;

  beforeEach(() => {
    optimizer = new AudioParamOptimizer({
      maxEventsPerNode: 5, // Low threshold for testing
      minSwapInterval: 0.1, // Short interval for testing
      swapInterval: 0.2,
      enableNodeSwapping: true,
      logLevel: "none",
    });
  });

  afterEach(() => {
    optimizer.dispose();
    disposeAudioParamOptimizer();
  });

  describe("AudioParamOptimizer", () => {
    it("should track AudioParam events", () => {
      const param = createMockAudioParam();

      optimizer.trackEvent(param, "test");
      optimizer.trackEvent(param, "test");

      const stats = optimizer.getStats();
      expect(stats.totalParams).toBe(1);
      expect(stats.totalEvents).toBe(2);
    });

    it("should mark params for swap when event threshold is reached", () => {
      const param = createMockAudioParam();

      // Add events up to threshold
      for (let i = 0; i < 5; i++) {
        optimizer.trackEvent(param, "test");
      }

      expect(optimizer.needsSwap(param)).toBe(true);
    });

    it("should not swap too frequently", () => {
      const param = createMockAudioParam();

      // Mark for swap
      for (let i = 0; i < 5; i++) {
        optimizer.trackEvent(param, "test");
      }

      // Force swap
      optimizer.forceSwap(param);

      // Try to swap again immediately
      optimizer.forceSwap(param);

      const stats = optimizer.getStats();
      expect(stats.paramsNeedingSwap).toBe(0);
    });
  });

  describe("createOptimizedAudioParam", () => {
    it("should create a proxy that tracks events", () => {
      // Set the global optimizer to our test instance
      const globalOptimizer = initializeAudioParamOptimizer({
        maxEventsPerNode: 5,
        enableNodeSwapping: true,
        logLevel: "none",
      });

      const param = createMockAudioParam();
      const optimizedParam = createOptimizedAudioParam(param, "test");

      // Call methods that should be tracked
      optimizedParam.setValueAtTime(1, 0);
      optimizedParam.linearRampToValueAtTime(2, 1);

      const stats = globalOptimizer.getStats();
      expect(stats.totalEvents).toBe(2);
    });
  });

  describe("shouldUseNodeSwapping", () => {
    it("should return boolean value", () => {
      const result = shouldUseNodeSwapping();
      expect(typeof result).toBe("boolean");
    });
  });

  describe("Global optimizer", () => {
    it("should initialize global optimizer", () => {
      const globalOptimizer = initializeAudioParamOptimizer({
        maxEventsPerNode: 10,
        enableNodeSwapping: true,
      });

      expect(globalOptimizer).toBeDefined();
      expect(globalOptimizer.getStats().totalParams).toBe(0);
    });

    it("should dispose global optimizer", () => {
      initializeAudioParamOptimizer();
      disposeAudioParamOptimizer();

      // Should not throw error
      expect(() => disposeAudioParamOptimizer()).not.toThrow();
    });
  });
});
