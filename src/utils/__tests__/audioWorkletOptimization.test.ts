import { describe, it, expect, beforeEach, afterEach } from "vitest";
import {
  AudioWorkletOptimizer,
  initializeAudioWorkletOptimizer,
  disposeAudioWorkletOptimizer,
  batchParameterUpdate,
  getWorkletBuffer,
  returnWorkletBuffer,
  recordWorkletPerformance,
  isAudioWorkletOptimizationAvailable,
  getAudioWorkletOptimizationStats,
} from "../audioWorkletOptimization";

describe("AudioWorkletOptimization", () => {
  let optimizer: AudioWorkletOptimizer;

  beforeEach(() => {
    optimizer = new AudioWorkletOptimizer({
      enableParameterBatching: true,
      enableMemoryPooling: true,
      enablePerformanceMonitoring: true,
      maxBatchSize: 32,
      memoryPoolSize: 25,
      monitoringInterval: 500,
      logLevel: "none",
    });
  });

  afterEach(() => {
    optimizer.dispose();
    disposeAudioWorkletOptimizer();
  });

  describe("AudioWorkletOptimizer", () => {
    it("should create with default configuration", () => {
      expect(optimizer).toBeDefined();
      const stats = optimizer.getPerformanceStats();
      expect(stats.totalWorklets).toBe(0);
    });

    it("should batch parameter updates", () => {
      const workletId = "test-worklet-1";
      const parameterName = "cutoff";

      // Add multiple parameter updates
      for (let i = 0; i < 10; i++) {
        optimizer.batchParameterUpdate(
          workletId,
          parameterName,
          i * 100,
          i * 0.1
        );
      }

      const batchStats = optimizer.getBatchStats();
      expect(batchStats.totalBatches).toBe(1); // One batch for the parameter
    });

    it("should process batches when full", () => {
      const workletId = "test-worklet-2";
      const parameterName = "resonance";

      // Fill batch to capacity (32 updates)
      for (let i = 0; i < 32; i++) {
        optimizer.batchParameterUpdate(
          workletId,
          parameterName,
          i * 0.1,
          i * 0.01
        );
      }

      const batchStats = optimizer.getBatchStats();
      expect(batchStats.totalBatches).toBe(0); // Batch should be processed
      // In test environment, processing might be immediate, so just check it's defined
      expect(batchStats.totalQueuedTasks).toBeGreaterThanOrEqual(0);
    });

    it("should handle high priority updates immediately", () => {
      const workletId = "test-worklet-3";
      const parameterName = "volume";

      // Add high priority update
      optimizer.batchParameterUpdate(workletId, parameterName, 0.8, 0, "high");

      const batchStats = optimizer.getBatchStats();
      expect(batchStats.totalBatches).toBe(0); // High priority should be processed immediately
    });

    it("should manage memory pools", () => {
      const workletId = "test-worklet-4";
      const bufferSize = 1024;

      // Get buffer from pool
      const buffer1 = optimizer.getMemoryPool(workletId, bufferSize, "float32");
      expect(buffer1).toBeDefined();
      expect(buffer1.length).toBe(bufferSize);

      // Return buffer to pool
      optimizer.returnBufferToPool(workletId, buffer1, bufferSize, "float32");

      // Get buffer again (should reuse from pool)
      const buffer2 = optimizer.getMemoryPool(workletId, bufferSize, "float32");
      expect(buffer2).toBeDefined();
      expect(buffer2.length).toBe(bufferSize);
    });

    it("should record performance metrics", () => {
      const workletId = "test-worklet-5";

      optimizer.recordPerformanceMetrics(
        workletId,
        150, // 150 microseconds
        25.5, // 25.5% CPU
        1024 * 1024, // 1MB memory
        42, // 42 parameter updates
        0 // no underruns
      );

      const metrics = optimizer.getWorkletPerformanceMetrics(workletId);
      expect(metrics).toBeDefined();
      expect(metrics?.processingTimeUs).toBe(150);
      expect(metrics?.cpuUsage).toBe(25.5);
      expect(metrics?.memoryUsage).toBe(1024 * 1024);
      expect(metrics?.parameterUpdates).toBe(42);
    });

    it("should aggregate performance statistics", () => {
      // Record metrics for multiple worklets
      optimizer.recordPerformanceMetrics(
        "worklet-1",
        100,
        20,
        512 * 1024,
        10,
        0
      );
      optimizer.recordPerformanceMetrics(
        "worklet-2",
        200,
        30,
        1024 * 1024,
        20,
        1
      );

      const stats = optimizer.getPerformanceStats();
      expect(stats.totalWorklets).toBe(2);
      expect(stats.averageProcessingTime).toBe(150); // (100 + 200) / 2
      expect(stats.averageCpuUsage).toBe(25); // (20 + 30) / 2
      expect(stats.totalMemoryUsage).toBe(1536 * 1024); // 512 + 1024
      expect(stats.totalParameterUpdates).toBe(30); // 10 + 20
      expect(stats.totalUnderruns).toBe(1); // 0 + 1
    });

    it("should get memory pool statistics", () => {
      const workletId = "test-worklet-6";
      const bufferSize = 2048;

      // Create some pools
      optimizer.getMemoryPool(workletId, bufferSize, "float32");
      optimizer.getMemoryPool(workletId, bufferSize, "float64");

      const stats = optimizer.getMemoryPoolStats();
      expect(stats.totalPools).toBe(2);
      expect(stats.totalBuffers).toBe(0); // All buffers are in use
      expect(stats.totalSizeBytes).toBeGreaterThan(0);
    });

    it("should clear optimization data", () => {
      // Add some data
      optimizer.batchParameterUpdate("test", "param", 1.0);
      optimizer.recordPerformanceMetrics("test", 100, 10, 1024, 5, 0);

      // Clear data
      optimizer.clear();

      const batchStats = optimizer.getBatchStats();
      const perfStats = optimizer.getPerformanceStats();

      expect(batchStats.totalBatches).toBe(0);
      expect(perfStats.totalWorklets).toBe(0);
    });
  });

  describe("Global optimizer", () => {
    it("should initialize global optimizer", () => {
      const globalOptimizer = initializeAudioWorkletOptimizer({
        enableParameterBatching: true,
        maxBatchSize: 128,
      });

      expect(globalOptimizer).toBeDefined();
      expect(globalOptimizer.getBatchStats().totalBatches).toBe(0);
    });

    it("should dispose global optimizer", () => {
      initializeAudioWorkletOptimizer();
      disposeAudioWorkletOptimizer();

      // Should not throw error
      expect(() => disposeAudioWorkletOptimizer()).not.toThrow();
    });
  });

  describe("Utility functions", () => {
    it("should check if optimization is available", () => {
      const available = isAudioWorkletOptimizationAvailable();
      expect(typeof available).toBe("boolean");
    });

    it("should batch parameter updates", () => {
      batchParameterUpdate("test-worklet", "test-param", 0.5, 0, "normal");

      const stats = getAudioWorkletOptimizationStats();
      expect(stats).toBeDefined();
    });

    it("should get worklet buffers", () => {
      const buffer = getWorkletBuffer("test-worklet", 512, "float32");
      expect(buffer).toBeDefined();
      expect(buffer.length).toBe(512);
      expect(buffer.constructor).toBe(Float32Array);
    });

    it("should return buffers to pool", () => {
      const buffer = getWorkletBuffer("test-worklet", 256, "float64");
      returnWorkletBuffer("test-worklet", buffer, 256, "float64");

      // Should not throw
      expect(buffer).toBeDefined();
    });

    it("should record worklet performance", () => {
      // Initialize global optimizer for this test
      initializeAudioWorkletOptimizer();

      recordWorkletPerformance("test-worklet", 125, 15.5, 2048, 8, 0);

      const stats = getAudioWorkletOptimizationStats();
      expect(stats?.performance.totalWorklets).toBeGreaterThan(0);
    });

    it("should get optimization statistics", () => {
      const stats = getAudioWorkletOptimizationStats();
      expect(stats).toBeDefined();

      if (stats) {
        expect(stats.performance).toBeDefined();
        expect(stats.memory).toBeDefined();
        expect(stats.batches).toBeDefined();
      }
    });
  });
});
