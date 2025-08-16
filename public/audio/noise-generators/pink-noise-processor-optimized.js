/**
 * Audio constants for Optimized Pink Noise Processor
 */
const AUDIO_CONSTANTS = {
  PINK_NOISE: {
    B0_COEFF: 0.99886,
    B1_COEFF: 0.99332,
    B2_COEFF: 0.969,
    B3_COEFF: 0.8665,
    B4_COEFF: 0.55,
    B5_COEFF: -0.7616,
    B6_COEFF: 0.5362,
    WHITE_NOISE_WEIGHT: 0.11,
  },
};

/**
 * Optimized pink noise processor with integrated performance optimizations
 */
class OptimizedPinkNoiseProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.workletId = `pink-noise-${Date.now()}-${Math.random()
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

    // Pink noise state variables
    this.b0 = 0;
    this.b1 = 0;
    this.b2 = 0;
    this.b3 = 0;
    this.b4 = 0;
    this.b5 = 0;
    this.b6 = 0;
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
      // Generate pink noise using optimized algorithm
      for (let i = 0; i < bufferSize; i++) {
        // Use cached white noise value for efficiency
        const white = this.noiseCache[this.noiseIndex];

        // Update pink noise state variables
        this.b0 =
          AUDIO_CONSTANTS.PINK_NOISE.B0_COEFF * this.b0 + white * 0.0555179;
        this.b1 =
          AUDIO_CONSTANTS.PINK_NOISE.B1_COEFF * this.b1 + white * 0.0750759;
        this.b2 =
          AUDIO_CONSTANTS.PINK_NOISE.B2_COEFF * this.b2 + white * 0.153852;
        this.b3 =
          AUDIO_CONSTANTS.PINK_NOISE.B3_COEFF * this.b3 + white * 0.3104856;
        this.b4 =
          AUDIO_CONSTANTS.PINK_NOISE.B4_COEFF * this.b4 + white * 0.5329522;
        this.b5 =
          AUDIO_CONSTANTS.PINK_NOISE.B5_COEFF * this.b5 - white * 0.016898;
        const b6 = white * AUDIO_CONSTANTS.PINK_NOISE.B6_COEFF;

        // Calculate pink noise output
        tempBuffer[i] =
          (this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + b6) *
          AUDIO_CONSTANTS.PINK_NOISE.WHITE_NOISE_WEIGHT;

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
  "pink-noise-processor-optimized",
  OptimizedPinkNoiseProcessor
);
