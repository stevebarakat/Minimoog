/**
 * Memory leak detection and monitoring utilities
 */
import { log as logger } from "@/utils";

export type MemoryStats = {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
  timestamp: number;
};

export type AudioNodeStats = {
  activeNodes: number;
  pooledNodes: number;
  disposedNodes: number;
};

/**
 * Get current memory usage statistics
 */
export function getMemoryStats(): MemoryStats | null {
  if ("memory" in performance) {
    const memory = (performance as { memory: MemoryStats }).memory;
    return {
      jsHeapSizeLimit: memory.jsHeapSizeLimit,
      totalJSHeapSize: memory.totalJSHeapSize,
      usedJSHeapSize: memory.usedJSHeapSize,
      timestamp: Date.now(),
    };
  }
  return null;
}

/**
 * Monitor memory usage and log warnings if usage is high
 */
export function monitorMemoryUsage(thresholdMB = 100): void {
  const stats = getMemoryStats();
  if (stats) {
    const usedMB = stats.usedJSHeapSize / (1024 * 1024);
    const totalMB = stats.totalJSHeapSize / (1024 * 1024);
    const limitMB = stats.jsHeapSizeLimit / (1024 * 1024);

    if (usedMB > thresholdMB) {
      logger.warn(
        `High memory usage detected: ${usedMB.toFixed(
          2
        )}MB used, ${totalMB.toFixed(2)}MB total, ${limitMB.toFixed(2)}MB limit`
      );
    }
  }
}

/**
 * Start periodic memory monitoring
 */
export function startMemoryMonitoring(intervalMs = 30000): () => void {
  const interval = setInterval(monitorMemoryUsage, intervalMs);

  return () => {
    clearInterval(interval);
  };
}

/**
 * Get audio context statistics
 */
export function getAudioContextStats(
  audioContext: AudioContext | null
): AudioNodeStats | null {
  if (!audioContext) return null;

  // Basic audio context stats - more detailed tracking would require
  // instrumenting the audio node creation/disposal throughout the app
  const baseLatency = audioContext.baseLatency || 0;
  const outputLatency = audioContext.outputLatency || 0;

  return {
    activeNodes: Math.round((baseLatency + outputLatency) * 1000), // Rough estimate
    pooledNodes: 0, // Would need pooling implementation
    disposedNodes: 0, // Would need disposal tracking
  };
}

/**
 * Global function to manually log stats (accessible from browser console)
 */
declare global {
  interface Window {
    logMinimoogStats?: () => void;
  }
}

/**
 * Setup global stats logging function for development
 */
export function setupGlobalStatsLogging(
  audioContext: AudioContext | null
): void {
  if (process.env.NODE_ENV === "development" && typeof window !== "undefined") {
    window.logMinimoogStats = () => {
      const memoryStats = getMemoryStats();
      const audioStats = getAudioContextStats(audioContext);

      logger.info("=== SYSTEM PERFORMANCE STATS ===");

      if (memoryStats) {
        const usedMB = (memoryStats.usedJSHeapSize / (1024 * 1024)).toFixed(2);
        const totalMB = (memoryStats.totalJSHeapSize / (1024 * 1024)).toFixed(
          2
        );
        const limitMB = (memoryStats.jsHeapSizeLimit / (1024 * 1024)).toFixed(
          2
        );
        const usagePercent = (
          (memoryStats.usedJSHeapSize / memoryStats.totalJSHeapSize) *
          100
        ).toFixed(1);

        logger.info(
          `Memory Stats - Used: ${usedMB}MB (${usagePercent}%) | Total: ${totalMB}MB | Limit: ${limitMB}MB`
        );
      }

      if (audioStats) {
        logger.info(
          `Audio Stats - Est. Latency: ${audioStats.activeNodes}ms | Pooled: ${audioStats.pooledNodes} | Disposed: ${audioStats.disposedNodes}`
        );
      }

      if (audioContext) {
        const baseLatencyMs = (audioContext.baseLatency * 1000).toFixed(1);
        const outputLatencyMs = audioContext.outputLatency
          ? (audioContext.outputLatency * 1000).toFixed(1)
          : "N/A";
        logger.info(
          `Audio Context - State: ${audioContext.state} | Sample Rate: ${audioContext.sampleRate}Hz | Base Latency: ${baseLatencyMs}ms | Output Latency: ${outputLatencyMs}ms`
        );
      }

      logger.info("=== END STATS ===");
    };
  }
}
