import { log as logger } from "./index";

/**
 * Configuration for audio worklet optimization
 */
export type AudioWorkletOptimizationConfig = {
  /** Enable parameter batching optimization */
  enableParameterBatching: boolean;
  /** Enable memory pooling */
  enableMemoryPooling: boolean;
  /** Enable performance monitoring */
  enablePerformanceMonitoring: boolean;
  /** Maximum batch size for parameter updates */
  maxBatchSize: number;
  /** Memory pool size in MB */
  memoryPoolSize: number;
  /** Performance monitoring interval in ms */
  monitoringInterval: number;
  /** Log level for optimization events */
  logLevel: "none" | "warn" | "info" | "debug";
};

/**
 * Default configuration for audio worklet optimization
 */
export const DEFAULT_WORKLET_OPTIMIZATION_CONFIG: AudioWorkletOptimizationConfig =
  {
    enableParameterBatching: true,
    enableMemoryPooling: true,
    enablePerformanceMonitoring: true,
    maxBatchSize: 64,
    memoryPoolSize: 50, // 50MB pool
    monitoringInterval: 1000, // 1 second
    logLevel: "info",
  };

/**
 * Parameter update batch for efficient processing
 */
export type ParameterUpdateBatch = {
  /** Worklet instance ID */
  workletId: string;
  /** Parameter name */
  parameterName: string;
  /** Array of value-time pairs */
  updates: Array<{ value: number; time: number }>;
  /** Batch timestamp */
  timestamp: number;
  /** Processing priority */
  priority: "high" | "normal" | "low";
};

/**
 * Memory pool for audio worklet data structures
 */
export type MemoryPool = {
  /** Pool identifier */
  id: string;
  /** Available buffers */
  availableBuffers: Array<Float32Array | Float64Array>;
  /** Buffer size */
  bufferSize: number;
  /** Buffer type */
  bufferType: "float32" | "float64";
  /** Total allocated size in bytes */
  totalSizeBytes: number;
  /** Last access time */
  lastAccessed: number;
};

/**
 * Performance metrics for audio worklets
 */
export type WorkletPerformanceMetrics = {
  /** Worklet instance ID */
  workletId: string;
  /** Processing time in microseconds */
  processingTimeUs: number;
  /** CPU usage percentage */
  cpuUsage: number;
  /** Memory usage in bytes */
  memoryUsage: number;
  /** Parameter update count */
  parameterUpdates: number;
  /** Audio buffer underruns */
  underruns: number;
  /** Timestamp of measurement */
  timestamp: number;
};

/**
 * Audio worklet optimization manager
 */
export class AudioWorkletOptimizer {
  private config: AudioWorkletOptimizationConfig;
  private parameterBatches = new Map<string, ParameterUpdateBatch>();
  private memoryPools = new Map<string, MemoryPool>();
  private performanceMetrics = new Map<string, WorkletPerformanceMetrics>();
  private batchProcessingQueue: Array<() => void> = [];
  private isProcessingBatches = false;
  private monitoringInterval: number | null = null;

  constructor(config: Partial<AudioWorkletOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_WORKLET_OPTIMIZATION_CONFIG, ...config };
    this.setupPerformanceMonitoring();
  }

  /**
   * Batch parameter updates for efficient processing
   */
  batchParameterUpdate(
    workletId: string,
    parameterName: string,
    value: number,
    time: number = 0,
    priority: "high" | "normal" | "low" = "normal"
  ): void {
    if (!this.config.enableParameterBatching) return;

    const batchKey = `${workletId}:${parameterName}`;
    let batch = this.parameterBatches.get(batchKey);

    if (!batch) {
      batch = {
        workletId,
        parameterName,
        updates: [],
        timestamp: Date.now(),
        priority,
      };
      this.parameterBatches.set(batchKey, batch);
    }

    batch.updates.push({ value, time });
    batch.timestamp = Date.now();

    // Process batch if it's full or high priority
    if (
      batch.updates.length >= this.config.maxBatchSize ||
      priority === "high"
    ) {
      this.processBatch(batchKey);
    }
  }

  /**
   * Process a parameter update batch
   */
  private processBatch(batchKey: string): void {
    const batch = this.parameterBatches.get(batchKey);
    if (!batch) return;

    this.batchProcessingQueue.push(() => {
      try {
        // Send batch to worklet via message port
        this.sendBatchToWorklet(batch);

        // Clear the batch
        this.parameterBatches.delete(batchKey);

        this.log(
          "debug",
          `Processed batch: ${batch.workletId}:${batch.parameterName} (${batch.updates.length} updates)`
        );
      } catch (error) {
        this.log("warn", "Batch processing failed:", error);
      }
    });

    this.processBatchQueue();
  }

  /**
   * Send batch to worklet via message port
   */
  private sendBatchToWorklet(batch: ParameterUpdateBatch): void {
    // This would typically send a message to the worklet
    // For now, we'll simulate the optimization
    const message = {
      type: "parameter-batch",
      workletId: batch.workletId,
      parameterName: batch.parameterName,
      updates: batch.updates,
      priority: batch.priority,
    };

    // In a real implementation, this would use postMessage to the worklet
    this.log("debug", "Sending batch to worklet:", message);
  }

  /**
   * Process the batch queue
   */
  private processBatchQueue(): void {
    if (this.isProcessingBatches || this.batchProcessingQueue.length === 0) {
      return;
    }

    this.isProcessingBatches = true;

    while (this.batchProcessingQueue.length > 0) {
      const task = this.batchProcessingQueue.shift();
      if (task) {
        try {
          task();
        } catch (error) {
          this.log("warn", "Batch queue task failed:", error);
        }
      }
    }

    this.isProcessingBatches = false;
  }

  /**
   * Get or create a memory pool for audio worklets
   */
  getMemoryPool(
    workletId: string,
    bufferSize: number,
    bufferType: "float32" | "float64" = "float32"
  ): Float32Array | Float64Array {
    if (!this.config.enableMemoryPooling) {
      // Return new buffer if pooling is disabled
      return bufferType === "float32"
        ? new Float32Array(bufferSize)
        : new Float64Array(bufferSize);
    }

    const poolKey = `${workletId}:${bufferSize}:${bufferType}`;
    let pool = this.memoryPools.get(poolKey);

    if (!pool) {
      pool = {
        id: poolKey,
        availableBuffers: [],
        bufferSize,
        bufferType,
        totalSizeBytes: 0,
        lastAccessed: Date.now(),
      };
      this.memoryPools.set(poolKey, pool);
    }

    pool.lastAccessed = Date.now();

    // Return available buffer or create new one
    if (pool.availableBuffers.length > 0) {
      const buffer = pool.availableBuffers.pop()!;
      this.log("debug", `Reused buffer from pool: ${poolKey}`);
      return buffer;
    } else {
      const buffer =
        bufferType === "float32"
          ? new Float32Array(bufferSize)
          : new Float64Array(bufferSize);

      pool.totalSizeBytes += buffer.byteLength;
      this.log("debug", `Created new buffer for pool: ${poolKey}`);
      return buffer;
    }
  }

  /**
   * Return a buffer to the memory pool
   */
  returnBufferToPool(
    workletId: string,
    buffer: Float32Array | Float64Array,
    bufferSize: number,
    bufferType: "float32" | "float64" = "float32"
  ): void {
    if (!this.config.enableMemoryPooling) return;

    const poolKey = `${workletId}:${bufferSize}:${bufferType}`;
    const pool = this.memoryPools.get(poolKey);

    if (pool) {
      // Reset buffer to zero
      buffer.fill(0);

      // Add to available buffers
      pool.availableBuffers.push(buffer);
      pool.lastAccessed = Date.now();

      this.log("debug", `Returned buffer to pool: ${poolKey}`);
    }
  }

  /**
   * Record performance metrics for a worklet
   */
  recordPerformanceMetrics(
    workletId: string,
    processingTimeUs: number,
    cpuUsage: number,
    memoryUsage: number,
    parameterUpdates: number,
    underruns: number = 0
  ): void {
    if (!this.config.enablePerformanceMonitoring) return;

    const metrics: WorkletPerformanceMetrics = {
      workletId,
      processingTimeUs,
      cpuUsage,
      memoryUsage,
      parameterUpdates,
      underruns,
      timestamp: Date.now(),
    };

    this.performanceMetrics.set(workletId, metrics);
  }

  /**
   * Get performance metrics for a specific worklet
   */
  getWorkletPerformanceMetrics(
    workletId: string
  ): WorkletPerformanceMetrics | null {
    return this.performanceMetrics.get(workletId) || null;
  }

  /**
   * Get aggregated performance statistics
   */
  getPerformanceStats() {
    const worklets = Array.from(this.performanceMetrics.values());

    if (worklets.length === 0) {
      return {
        totalWorklets: 0,
        averageProcessingTime: 0,
        averageCpuUsage: 0,
        totalMemoryUsage: 0,
        totalParameterUpdates: 0,
        totalUnderruns: 0,
      };
    }

    const totalProcessingTime = worklets.reduce(
      (sum, w) => sum + w.processingTimeUs,
      0
    );
    const totalCpuUsage = worklets.reduce((sum, w) => sum + w.cpuUsage, 0);
    const totalMemoryUsage = worklets.reduce(
      (sum, w) => sum + w.memoryUsage,
      0
    );
    const totalParameterUpdates = worklets.reduce(
      (sum, w) => sum + w.parameterUpdates,
      0
    );
    const totalUnderruns = worklets.reduce((sum, w) => sum + w.underruns, 0);

    return {
      totalWorklets: worklets.length,
      averageProcessingTime: totalProcessingTime / worklets.length,
      averageCpuUsage: totalCpuUsage / worklets.length,
      totalMemoryUsage,
      totalParameterUpdates,
      totalUnderruns,
    };
  }

  /**
   * Get memory pool statistics
   */
  getMemoryPoolStats() {
    const pools = Array.from(this.memoryPools.values());
    const totalPools = pools.length;
    const totalBuffers = pools.reduce(
      (sum, pool) => sum + pool.availableBuffers.length,
      0
    );
    const totalSizeBytes = pools.reduce(
      (sum, pool) => sum + pool.totalSizeBytes,
      0
    );

    return {
      totalPools,
      totalBuffers,
      totalSizeMB: (totalSizeBytes / (1024 * 1024)).toFixed(2),
      totalSizeBytes,
    };
  }

  /**
   * Get batch processing statistics
   */
  getBatchStats() {
    const totalBatches = this.parameterBatches.size;
    const totalQueuedTasks = this.batchProcessingQueue.length;
    const isProcessing = this.isProcessingBatches;

    return {
      totalBatches,
      totalQueuedTasks,
      isProcessing,
    };
  }

  /**
   * Setup performance monitoring
   */
  private setupPerformanceMonitoring(): void {
    if (!this.config.enablePerformanceMonitoring) return;

    this.monitoringInterval = window.setInterval(() => {
      this.cleanupOldMetrics();
      this.log("debug", "Performance monitoring tick");
    }, this.config.monitoringInterval);
  }

  /**
   * Clean up old performance metrics
   */
  private cleanupOldMetrics(): void {
    const now = Date.now();
    const maxAge = 5 * 60 * 1000; // 5 minutes

    for (const [workletId, metrics] of this.performanceMetrics.entries()) {
      if (now - metrics.timestamp > maxAge) {
        this.performanceMetrics.delete(workletId);
      }
    }
  }

  /**
   * Clear all optimization data
   */
  clear(): void {
    this.parameterBatches.clear();
    this.batchProcessingQueue.length = 0;
    this.performanceMetrics.clear();
    this.memoryPools.clear();
    this.log("info", "AudioWorklet optimization data cleared");
  }

  /**
   * Dispose the optimizer
   */
  dispose(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
    }
    this.clear();
  }

  /**
   * Log messages based on configured log level
   */
  private log(
    level: keyof AudioWorkletOptimizationConfig,
    message: string,
    ...args: unknown[]
  ): void {
    const logLevels = { none: 0, warn: 1, info: 2, debug: 3 };
    const currentLevel = logLevels[this.config.logLevel] || 0;
    const messageLevel = logLevels[level] || 0;

    if (messageLevel <= currentLevel) {
      switch (level) {
        case "warn":
          logger.warn(`[WorkletOpt] ${message}`, ...args);
          break;
        case "info":
          logger.info(`[WorkletOpt] ${message}`, ...args);
          break;
        case "debug":
          logger.debug(`[WorkletOpt] ${message}`, ...args);
          break;
      }
    }
  }
}

/**
 * Global audio worklet optimizer instance
 */
let globalWorkletOptimizer: AudioWorkletOptimizer | null = null;

/**
 * Initialize the global audio worklet optimizer
 */
export function initializeAudioWorkletOptimizer(
  config: Partial<AudioWorkletOptimizationConfig> = {}
): AudioWorkletOptimizer {
  if (!globalWorkletOptimizer) {
    globalWorkletOptimizer = new AudioWorkletOptimizer(config);
  }
  return globalWorkletOptimizer;
}

/**
 * Get the global audio worklet optimizer instance
 */
export function getAudioWorkletOptimizer(): AudioWorkletOptimizer | null {
  return globalWorkletOptimizer;
}

/**
 * Dispose the global audio worklet optimizer
 */
export function disposeAudioWorkletOptimizer(): void {
  if (globalWorkletOptimizer) {
    globalWorkletOptimizer.dispose();
    globalWorkletOptimizer = null;
  }
}

/**
 * Utility function to batch parameter updates
 */
export function batchParameterUpdate(
  workletId: string,
  parameterName: string,
  value: number,
  time: number = 0,
  priority: "high" | "normal" | "low" = "normal"
): void {
  const optimizer = getAudioWorkletOptimizer();
  if (optimizer) {
    optimizer.batchParameterUpdate(
      workletId,
      parameterName,
      value,
      time,
      priority
    );
  } else {
    console.warn(
      "[AudioWorkletOpt] batchParameterUpdate called but optimizer not initialized"
    );
  }
}

/**
 * Utility function to get memory pool buffer
 */
export function getWorkletBuffer(
  workletId: string,
  bufferSize: number,
  bufferType: "float32" | "float64" = "float32"
): Float32Array | Float64Array {
  const optimizer = getAudioWorkletOptimizer();
  if (optimizer) {
    return optimizer.getMemoryPool(workletId, bufferSize, bufferType);
  }

  // Fallback to new buffer if optimizer not available
  return bufferType === "float32"
    ? new Float32Array(bufferSize)
    : new Float64Array(bufferSize);
}

/**
 * Utility function to return buffer to pool
 */
export function returnWorkletBuffer(
  workletId: string,
  buffer: Float32Array | Float64Array,
  bufferSize: number,
  bufferType: "float32" | "float64" = "float32"
): void {
  const optimizer = getAudioWorkletOptimizer();
  if (optimizer) {
    optimizer.returnBufferToPool(workletId, buffer, bufferSize, bufferType);
  }
}

/**
 * Utility function to record performance metrics
 */
export function recordWorkletPerformance(
  workletId: string,
  processingTimeUs: number,
  cpuUsage: number,
  memoryUsage: number,
  parameterUpdates: number,
  underruns: number = 0
): void {
  const optimizer = getAudioWorkletOptimizer();
  if (optimizer) {
    optimizer.recordPerformanceMetrics(
      workletId,
      processingTimeUs,
      cpuUsage,
      memoryUsage,
      parameterUpdates,
      underruns
    );
  }
}

/**
 * Check if audio worklet optimization is available
 */
export function isAudioWorkletOptimizationAvailable(): boolean {
  return getAudioWorkletOptimizer() !== null;
}

/**
 * Get current optimization statistics
 */
export function getAudioWorkletOptimizationStats() {
  const optimizer = getAudioWorkletOptimizer();
  if (!optimizer) return null;

  return {
    performance: optimizer.getPerformanceStats(),
    memory: optimizer.getMemoryPoolStats(),
    batches: optimizer.getBatchStats(),
  };
}
