import { log as logger } from "./index";

/**
 * Configuration for audio buffer optimization
 */
export type AudioBufferOptimizationConfig = {
  /** Enable pre-resampling optimization */
  enablePreResampling: boolean;
  /** Enable buffer caching */
  enableBufferCaching: boolean;
  /** Maximum cache size in MB */
  maxCacheSize: number;
  /** Resampling quality: 'fast' | 'balanced' | 'high' */
  resamplingQuality: "fast" | "balanced" | "high";
  /** Whether to use Web Workers for resampling (if available) */
  useWebWorkers: boolean;
  /** Log level for optimization events */
  logLevel: "none" | "warn" | "info" | "debug";
};

/**
 * Default configuration for audio buffer optimization
 */
export const DEFAULT_BUFFER_OPTIMIZATION_CONFIG: AudioBufferOptimizationConfig =
  {
    enablePreResampling: true,
    enableBufferCaching: true,
    maxCacheSize: 100, // 100MB cache limit
    resamplingQuality: "balanced",
    useWebWorkers: false, // Disabled by default for compatibility
    logLevel: "info",
  };

/**
 * Resampling quality presets
 */
export const RESAMPLING_PRESETS = {
  fast: {
    interpolation: "linear",
    oversampling: 1,
    filterQuality: "low",
  },
  balanced: {
    interpolation: "cubic",
    oversampling: 2,
    filterQuality: "medium",
  },
  high: {
    interpolation: "sinc",
    oversampling: 4,
    filterQuality: "high",
  },
} as const;

/**
 * Cached audio buffer with metadata
 */
export type CachedAudioBuffer = {
  /** The resampled AudioBuffer */
  buffer: AudioBuffer;
  /** Original sample rate */
  originalSampleRate: number;
  /** Target sample rate */
  targetSampleRate: number;
  /** Resampling quality used */
  quality: string;
  /** Size in bytes */
  sizeBytes: number;
  /** Last accessed time */
  lastAccessed: number;
  /** Access count for LRU eviction */
  accessCount: number;
};

/**
 * Audio buffer optimization manager
 */
export class AudioBufferOptimizer {
  private config: AudioBufferOptimizationConfig;
  private bufferCache = new Map<string, CachedAudioBuffer>();
  private cacheSizeBytes = 0;
  private resamplingQueue: Array<() => Promise<void>> = [];
  private isProcessing = false;

  constructor(config: Partial<AudioBufferOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_BUFFER_OPTIMIZATION_CONFIG, ...config };
    this.setupPeriodicCleanup();
  }

  /**
   * Pre-resample an audio buffer to match the target sample rate
   */
  async preResampleBuffer(
    inputBuffer: AudioBuffer,
    targetSampleRate: number,
    quality: keyof typeof RESAMPLING_PRESETS = "balanced"
  ): Promise<AudioBuffer> {
    if (!this.config.enablePreResampling) {
      return inputBuffer;
    }

    // Check if resampling is needed
    if (inputBuffer.sampleRate === targetSampleRate) {
      return inputBuffer;
    }

    // Check cache first
    const cacheKey = this.generateCacheKey(
      inputBuffer,
      targetSampleRate,
      quality
    );
    const cached = this.bufferCache.get(cacheKey);
    if (cached) {
      cached.lastAccessed = Date.now();
      cached.accessCount++;
      return cached.buffer;
    }

    // Queue for resampling
    return new Promise((resolve, reject) => {
      this.resamplingQueue.push(async () => {
        try {
          const resampled = await this.performResampling(
            inputBuffer,
            targetSampleRate,
            quality
          );

          // Cache the result
          if (this.config.enableBufferCaching) {
            this.cacheBuffer(
              cacheKey,
              resampled,
              inputBuffer.sampleRate,
              targetSampleRate,
              quality
            );
          }

          resolve(resampled);
        } catch (error) {
          reject(error);
        }
      });

      this.processQueue();
    });
  }

  /**
   * Perform the actual resampling using OfflineAudioContext
   */
  private async performResampling(
    inputBuffer: AudioBuffer,
    targetSampleRate: number,
    quality: keyof typeof RESAMPLING_PRESETS
  ): Promise<AudioBuffer> {
    const ratio = inputBuffer.sampleRate / targetSampleRate;
    const newLength = Math.round(inputBuffer.length * ratio);

    // Create offline context for resampling
    const offlineCtx = new OfflineAudioContext(
      inputBuffer.numberOfChannels,
      newLength,
      targetSampleRate
    );

    // Create source and connect
    const source = offlineCtx.createBufferSource();
    source.buffer = inputBuffer;
    source.connect(offlineCtx.destination);
    source.start(0);

    // Render the resampled audio
    const renderedBuffer = await offlineCtx.startRendering();

    this.log(
      "info",
      `Resampled buffer: ${inputBuffer.sampleRate}Hz → ${targetSampleRate}Hz (${quality} quality)`
    );

    return renderedBuffer;
  }

  /**
   * Generate a unique cache key for a buffer
   */
  private generateCacheKey(
    buffer: AudioBuffer,
    targetSampleRate: number,
    quality: string
  ): string {
    // Create a hash of the buffer content and parameters
    const contentHash = this.hashBufferContent(buffer);
    return `${contentHash}_${buffer.sampleRate}_${targetSampleRate}_${quality}`;
  }

  /**
   * Simple hash function for buffer content
   */
  private hashBufferContent(buffer: AudioBuffer): string {
    let hash = 0;
    const sampleCount = Math.min(buffer.length, 1000); // Sample first 1000 samples

    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < sampleCount; i += 10) {
        // Sample every 10th sample
        hash = ((hash << 5) - hash + data[i]) | 0;
      }
    }

    return hash.toString(36);
  }

  /**
   * Cache a resampled buffer
   */
  private cacheBuffer(
    key: string,
    buffer: AudioBuffer,
    originalSampleRate: number,
    targetSampleRate: number,
    quality: string
  ): void {
    if (!this.config.enableBufferCaching) return;

    const sizeBytes = buffer.length * buffer.numberOfChannels * 4; // 4 bytes per float32

    // Check cache size limit
    if (
      this.cacheSizeBytes + sizeBytes >
      this.config.maxCacheSize * 1024 * 1024
    ) {
      this.evictOldestBuffers(sizeBytes);
    }

    const cached: CachedAudioBuffer = {
      buffer,
      originalSampleRate,
      targetSampleRate,
      quality,
      sizeBytes,
      lastAccessed: Date.now(),
      accessCount: 1,
    };

    this.bufferCache.set(key, cached);
    this.cacheSizeBytes += sizeBytes;

    this.log(
      "debug",
      `Cached buffer: ${key} (${(sizeBytes / 1024).toFixed(1)}KB)`
    );
  }

  /**
   * Evict oldest buffers to make room
   */
  private evictOldestBuffers(requiredSpace: number): void {
    const entries = Array.from(this.bufferCache.entries());

    // Sort by last accessed time and access count (LRU)
    entries.sort((a, b) => {
      const aScore = a[1].lastAccessed * 0.7 + a[1].accessCount * 0.3;
      const bScore = b[1].lastAccessed * 0.7 + b[1].accessCount * 0.3;
      return aScore - bScore;
    });

    let freedSpace = 0;
    for (const [key, cached] of entries) {
      if (freedSpace >= requiredSpace) break;

      this.bufferCache.delete(key);
      freedSpace += cached.sizeBytes;
      this.cacheSizeBytes -= cached.sizeBytes;

      this.log(
        "debug",
        `Evicted buffer: ${key} (${(cached.sizeBytes / 1024).toFixed(1)}KB)`
      );
    }
  }

  /**
   * Process the resampling queue
   */
  private async processQueue(): Promise<void> {
    if (this.isProcessing || this.resamplingQueue.length === 0) return;

    this.isProcessing = true;

    while (this.resamplingQueue.length > 0) {
      const task = this.resamplingQueue.shift();
      if (task) {
        try {
          await task();
        } catch (error) {
          this.log("warn", "Resampling task failed:", error);
        }
      }
    }

    this.isProcessing = false;
  }

  /**
   * Get optimization statistics
   */
  getStats() {
    const totalBuffers = this.bufferCache.size;
    const totalSizeMB = (this.cacheSizeBytes / (1024 * 1024)).toFixed(2);
    const queueLength = this.resamplingQueue.length;

    return {
      totalBuffers,
      totalSizeMB: parseFloat(totalSizeMB),
      cacheSizeBytes: this.cacheSizeBytes,
      queueLength,
      isProcessing: this.isProcessing,
      config: this.config,
    };
  }

  /**
   * Clear the buffer cache
   */
  clearCache(): void {
    this.bufferCache.clear();
    this.cacheSizeBytes = 0;
    this.log("info", "Buffer cache cleared");
  }

  /**
   * Set up periodic cache cleanup
   */
  private setupPeriodicCleanup(): void {
    if (!this.config.enableBufferCaching) return;

    setInterval(() => {
      const now = Date.now();
      const maxAge = 30 * 60 * 1000; // 30 minutes

      for (const [key, cached] of this.bufferCache.entries()) {
        if (now - cached.lastAccessed > maxAge) {
          this.bufferCache.delete(key);
          this.cacheSizeBytes -= cached.sizeBytes;
          this.log("debug", `Cleaned up old buffer: ${key}`);
        }
      }
    }, 5 * 60 * 1000); // Every 5 minutes
  }

  /**
   * Log messages based on configured log level
   */
  private log(
    level: keyof AudioBufferOptimizationConfig,
    message: string,
    ...args: unknown[]
  ): void {
    const logLevels = { none: 0, warn: 1, info: 2, debug: 3 };
    const currentLevel = logLevels[this.config.logLevel] || 0;
    const messageLevel = logLevels[level] || 0;

    if (messageLevel <= currentLevel) {
      switch (level) {
        case "warn":
          logger.warn(`[BufferOpt] ${message}`, ...args);
          break;
        case "info":
          logger.info(`[BufferOpt] ${message}`, ...args);
          break;
        case "debug":
          logger.debug(`[BufferOpt] ${message}`, ...args);
          break;
      }
    }
  }
}

/**
 * Global audio buffer optimizer instance
 */
let globalBufferOptimizer: AudioBufferOptimizer | null = null;

/**
 * Initialize the global audio buffer optimizer
 */
export function initializeAudioBufferOptimizer(
  config: Partial<AudioBufferOptimizationConfig> = {}
): AudioBufferOptimizer {
  if (!globalBufferOptimizer) {
    globalBufferOptimizer = new AudioBufferOptimizer(config);
  }
  return globalBufferOptimizer;
}

/**
 * Get the global audio buffer optimizer instance
 */
export function getAudioBufferOptimizer(): AudioBufferOptimizer | null {
  return globalBufferOptimizer;
}

/**
 * Dispose the global audio buffer optimizer
 */
export function disposeAudioBufferOptimizer(): void {
  if (globalBufferOptimizer) {
    globalBufferOptimizer.clearCache();
    globalBufferOptimizer = null;
  }
}

/**
 * Utility function to pre-resample a buffer
 */
export async function preResampleBuffer(
  inputBuffer: AudioBuffer,
  targetSampleRate: number,
  quality: keyof typeof RESAMPLING_PRESETS = "balanced"
): Promise<AudioBuffer> {
  const optimizer = getAudioBufferOptimizer();
  if (!optimizer) {
    // Fallback: return original buffer if optimizer not available
    return inputBuffer;
  }

  return optimizer.preResampleBuffer(inputBuffer, targetSampleRate, quality);
}

/**
 * Check if audio buffer optimization is available
 */
export function isAudioBufferOptimizationAvailable(): boolean {
  return getAudioBufferOptimizer() !== null;
}

/**
 * Get current optimization statistics
 */
export function getAudioBufferOptimizationStats() {
  const optimizer = getAudioBufferOptimizer();
  return optimizer ? optimizer.getStats() : null;
}
