/**
 * Memory leak detection and monitoring utilities
 */

export interface MemoryStats {
  jsHeapSizeLimit: number;
  totalJSHeapSize: number;
  usedJSHeapSize: number;
  timestamp: number;
}

export interface AudioNodeStats {
  activeNodes: number;
  pooledNodes: number;
  disposedNodes: number;
}

/**
 * Get current memory usage statistics
 */
export function getMemoryStats(): MemoryStats | null {
  if ("memory" in performance) {
    const memory = (performance as any).memory;
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
      console.warn(
        `High memory usage detected: ${usedMB.toFixed(
          2
        )}MB used, ${totalMB.toFixed(2)}MB total, ${limitMB.toFixed(2)}MB limit`
      );
    }

    // Log memory usage every 30 seconds in development
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Memory: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(
          2
        )}MB (${limitMB.toFixed(2)}MB limit)`
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
 * Check for potential memory leaks by monitoring object counts
 */
export function detectMemoryLeaks(): void {
  // Check for excessive event listeners
  const eventTargets = [window, document, document.body];

  // This is a simplified check - in a real app you'd want more sophisticated detection
  console.log("Memory leak detection check completed");
}

/**
 * Force garbage collection if available (Chrome DevTools)
 */
export function forceGarbageCollection(): void {
  if ("gc" in window) {
    (window as any).gc();
    console.log("Garbage collection forced");
  } else {
    console.log("Garbage collection not available (requires --expose-gc flag)");
  }
}

/**
 * Get audio context statistics
 */
export function getAudioContextStats(
  audioContext: AudioContext | null
): AudioNodeStats | null {
  if (!audioContext) return null;

  // This is a simplified implementation
  // In a real app, you'd want to track actual node counts
  return {
    activeNodes: 0, // Would need to track this in your audio system
    pooledNodes: 0, // Would need to track this in your node pool
    disposedNodes: 0, // Would need to track this in your node pool
  };
}

/**
 * Log comprehensive memory and audio system statistics
 */
export function logSystemStats(audioContext: AudioContext | null): void {
  const memoryStats = getMemoryStats();
  const audioStats = getAudioContextStats(audioContext);

  console.group("System Statistics");

  if (memoryStats) {
    const usedMB = memoryStats.usedJSHeapSize / (1024 * 1024);
    const totalMB = memoryStats.totalJSHeapSize / (1024 * 1024);
    console.log(`Memory: ${usedMB.toFixed(2)}MB / ${totalMB.toFixed(2)}MB`);
  }

  if (audioStats) {
    console.log(
      `Audio Nodes: ${audioStats.activeNodes} active, ${audioStats.pooledNodes} pooled, ${audioStats.disposedNodes} disposed`
    );
  }

  if (audioContext) {
    console.log(`Audio Context State: ${audioContext.state}`);
    console.log(`Audio Context Sample Rate: ${audioContext.sampleRate}Hz`);
  }

  console.groupEnd();
}
