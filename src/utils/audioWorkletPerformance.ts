/**
 * AudioWorklet Performance Monitoring System
 * Provides real-time performance metrics for optimized AudioWorklets
 */

type PerformanceMetrics = {
  workletId: string;
  event: string;
  processingTimeUs: number;
  cpuUsage: number;
  memoryUsage: number;
  parameterUpdates: number;
  batchCount: number;
  batchEfficiency: number;
  memoryPoolSize: number;
  timestamp: number;
};

type PerformanceStats = {
  activeWorklets: Set<string>;
  totalCpuUsage: number;
  totalMemoryUsage: number;
  totalParameterUpdates: number;
  totalBatchCount: number;
  averageBatchEfficiency: number;
  memoryPoolStats: {
    totalSize: number;
    efficiency: number;
  };
};

class AudioWorkletPerformanceHandler {
  private metrics: Map<string, PerformanceMetrics> = new Map();
  private stats: PerformanceStats = {
    activeWorklets: new Set(),
    totalCpuUsage: 0,
    totalMemoryUsage: 0,
    totalParameterUpdates: 0,
    totalBatchCount: 0,
    averageBatchEfficiency: 0,
    memoryPoolStats: {
      totalSize: 0,
      efficiency: 0,
    },
  };
  private updateInterval: number | null = null;
  private onStatsUpdate?: (stats: PerformanceStats) => void;

  constructor() {
    this.setupMessageListener();
  }

  private setupMessageListener() {
    // Listen for performance metrics from worklets
    if (typeof window !== "undefined") {
      window.addEventListener("message", (event) => {
        if (event.data?.type === "performance-metrics") {
          this.handlePerformanceMetrics(event.data);
        }
      });
    }
  }

  private handlePerformanceMetrics(metrics: PerformanceMetrics) {
    metrics.timestamp = Date.now();
    this.metrics.set(metrics.workletId, metrics);
    this.updateStats();
  }

  private updateStats() {
    const workletIds = Array.from(this.metrics.keys());
    this.stats.activeWorklets = new Set(workletIds);

    if (workletIds.length === 0) {
      this.stats.totalCpuUsage = 0;
      this.stats.totalMemoryUsage = 0;
      this.stats.totalParameterUpdates = 0;
      this.stats.totalBatchCount = 0;
      this.stats.averageBatchEfficiency = 0;
      this.stats.memoryPoolStats.totalSize = 0;
      this.stats.memoryPoolStats.efficiency = 0;
    } else {
      let totalCpu = 0;
      let totalMemory = 0;
      let totalParams = 0;
      let totalBatches = 0;
      let totalEfficiency = 0;
      let totalPoolSize = 0;

      for (const workletId of workletIds) {
        const metrics = this.metrics.get(workletId);
        if (metrics) {
          totalCpu += metrics.cpuUsage;
          totalMemory += metrics.memoryUsage;
          totalParams += metrics.parameterUpdates;
          totalBatches += metrics.batchCount;
          totalEfficiency += metrics.batchEfficiency;
          totalPoolSize += metrics.memoryPoolSize;
        }
      }

      this.stats.totalCpuUsage = totalCpu / workletIds.length;
      this.stats.totalMemoryUsage = totalMemory;
      this.stats.totalParameterUpdates = totalParams;
      this.stats.totalBatchCount = totalBatches;
      this.stats.averageBatchEfficiency = totalEfficiency / workletIds.length;
      this.stats.memoryPoolStats.totalSize = totalPoolSize;
      this.stats.memoryPoolStats.efficiency =
        totalBatches > 0 ? totalParams / totalBatches : 0;
    }

    if (this.onStatsUpdate) {
      this.onStatsUpdate(this.stats);
    }
  }

  public getStats(): PerformanceStats {
    return { ...this.stats };
  }

  public getWorkletMetrics(workletId: string): PerformanceMetrics | undefined {
    return this.metrics.get(workletId);
  }

  public getAllMetrics(): PerformanceMetrics[] {
    return Array.from(this.metrics.values());
  }

  public setStatsUpdateCallback(callback: (stats: PerformanceStats) => void) {
    this.onStatsUpdate = callback;
  }

  public startMonitoring(intervalMs: number = 1000) {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
    }

    this.updateInterval = setInterval(() => {
      this.updateStats();
    }, intervalMs);
  }

  public stopMonitoring() {
    if (this.updateInterval) {
      clearInterval(this.updateInterval);
      this.updateInterval = null;
    }
  }

  public clearMetrics() {
    this.metrics.clear();
    this.updateStats();
  }

  public getStatus() {
    return {
      isMonitoring: this.updateInterval !== null,
      activeWorklets: this.stats.activeWorklets.size,
      lastUpdate:
        this.metrics.size > 0
          ? Math.max(
              ...Array.from(this.metrics.values()).map((m) => m.timestamp)
            )
          : 0,
    };
  }
}

// Singleton instance
let performanceHandler: AudioWorkletPerformanceHandler | null = null;

export function initializeAudioWorkletPerformanceHandler(): AudioWorkletPerformanceHandler {
  if (!performanceHandler) {
    performanceHandler = new AudioWorkletPerformanceHandler();
    performanceHandler.startMonitoring();
  }
  return performanceHandler;
}

export function getAudioWorkletPerformanceHandler(): AudioWorkletPerformanceHandler | null {
  return performanceHandler;
}

export function getAudioWorkletOptimizationStats(): PerformanceStats | null {
  return performanceHandler?.getStats() || null;
}

export type { PerformanceMetrics, PerformanceStats };
