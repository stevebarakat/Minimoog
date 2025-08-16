/**
 * Optimized white noise processor with integrated performance optimizations
 */
class OptimizedWhiteNoiseProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.workletId = `white-noise-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Performance monitoring
    this.processingStartTime = 0;
    this.parameterUpdateCount = 0;
    this.underrunCount = 0;
    this.lastPerformanceReport = 0;

    // Memory pool for temporary buffers
    this.tempBufferPool = new Map();
    this.tempBufferSize = 128; // Default buffer size

    // Pre-computed noise values for efficiency
    this.noiseCache = new Float32Array(1024);
    this.noiseIndex = 0;
    this.precomputeNoise();
  }

  /**
   * Pre-compute noise values for efficiency
   */
  precomputeNoise() {
    for (let i = 0; i < this.noiseCache.length; i++) {
      this.noiseCache[i] = Math.random() * 2 - 1;
    }
  }

  /**
   * Get temporary buffer from pool
   */
  getTempBuffer(size = this.tempBufferSize) {
    if (!this.tempBufferPool.has(size)) {
      this.tempBufferPool.set(size, []);
    }

    const pool = this.tempBufferPool.get(size);
    if (pool.length > 0) {
      return pool.pop();
    }

    return new Float32Array(size);
  }

  /**
   * Return temporary buffer to pool
   */
  returnTempBuffer(buffer, size = this.tempBufferSize) {
    if (!this.tempBufferPool.has(size)) {
      this.tempBufferPool.set(size, []);
    }

    const pool = this.tempBufferPool.get(size);
    buffer.fill(0); // Reset buffer
    pool.push(buffer);
  }

  /**
   * Report performance metrics
   */
  reportPerformance() {
    const now = performance.now();

    // Report every 1000ms to avoid excessive messaging
    if (now - this.lastPerformanceReport > 1000) {
      const processingTime = this.processingStartTime
        ? (now - this.processingStartTime) * 1000
        : 0; // Convert to microseconds

      // Estimate CPU usage based on processing time
      const estimatedCpuUsage = Math.min(100, (processingTime / 1000) * 100); // Rough estimate

      // Calculate memory usage
      const memoryUsage = this.calculateMemoryUsage();

      this.port.postMessage({
        type: "performance-metrics",
        workletId: this.workletId,
        processingTimeUs: processingTime,
        cpuUsage: estimatedCpuUsage,
        memoryUsage: memoryUsage,
        parameterUpdates: this.parameterUpdateCount,
        underruns: this.underrunCount,
      });

      this.lastPerformanceReport = now;
      this.parameterUpdateCount = 0;
      this.underruns = 0;
    }
  }

  /**
   * Calculate current memory usage
   */
  calculateMemoryUsage() {
    let totalMemory = 0;

    // Noise cache
    totalMemory += this.noiseCache.byteLength;

    // Temporary buffer pool
    for (const [size, pool] of this.tempBufferPool) {
      totalMemory += pool.length * size * 4; // 4 bytes per float32
    }

    return totalMemory;
  }

  /**
   * Process audio inputs and outputs
   * @param {Float32Array[][]} inputs - Input audio channels
   * @param {Float32Array[][]} outputs - Output audio channels
   * @returns {boolean} - Whether to continue processing
   */
  process(inputs, outputs) {
    this.processingStartTime = performance.now();

    const output = outputs[0];
    const channel = output[0];
    const bufferSize = channel.length;

    // Use temporary buffer from pool for efficient processing
    const tempBuffer = this.getTempBuffer(bufferSize);

    try {
      // Generate noise using pre-computed values for efficiency
      for (let i = 0; i < bufferSize; i++) {
        // Use cached noise value
        tempBuffer[i] = this.noiseCache[this.noiseIndex];

        // Update index and regenerate cache if needed
        this.noiseIndex = (this.noiseIndex + 1) % this.noiseCache.length;

        // Regenerate cache periodically to maintain randomness
        if (this.noiseIndex === 0) {
          this.precomputeNoise();
        }
      }

      // Copy to output channel
      channel.set(tempBuffer);
    } finally {
      // Always return buffer to pool
      this.returnTempBuffer(tempBuffer, bufferSize);
    }

    // Report performance periodically
    this.reportPerformance();

    return true;
  }
}

registerProcessor(
  "white-noise-processor-optimized",
  OptimizedWhiteNoiseProcessor
);
