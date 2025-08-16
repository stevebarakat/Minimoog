/**
 * @typedef {Object} WASMExports
 * @property {function(): number} inputBufferPtr
 * @property {function(): number} outputBufferPtr
 * @property {WebAssembly.Memory} memory
 * @property {function(): void} init
 * @property {function(): void} filter
 * @property {function(number): void} setCutoff
 * @property {function(number): void} setResonance
 * @property {function(number): void} setEnvelopeActive
 * @property {function(number): void} setEnvelopeCutoff
 * @property {function(number, number, number): void} setEnvelopeAttack
 * @property {function(number, number): void} setEnvelopeRelease
 * @property {function(number): void} setEnvelopeDecayTime
 * @property {function(number): void} setEnvelopeSustainLevel
 * @property {function(number): void} updateEnvelope
 */

/**
 * @typedef {Object} CutoffMessage
 * @property {number} cutOff
 */

/**
 * @typedef {Object} ResonanceMessage
 * @property {number} resonance
 */

/**
 * @typedef {Object} EnvelopeAttackMessage
 * @property {Object} envelopeAttack
 * @property {number} envelopeAttack.startCutoff
 * @property {number} envelopeAttack.peakCutoff
 * @property {number} envelopeAttack.attackTime
 * @property {number} envelopeAttack.decayTime
 * @property {number} envelopeAttack.sustainLevel
 */

/**
 * @typedef {Object} EnvelopeReleaseMessage
 * @property {Object} envelopeRelease
 * @property {number} envelopeRelease.targetCutoff
 * @property {number} envelopeRelease.releaseTime
 */

/**
 * @typedef {CutoffMessage|ResonanceMessage|EnvelopeAttackMessage|EnvelopeReleaseMessage} WorkletMessage
 */

/**
 * Optimized Huovilainen filter worklet processor with integrated performance optimizations
 */
class OptimizedHuovilainenWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.WEBEAUDIO_FRAME_SIZE = 128;
    this.frameCount = 0;
    this.lastTime = 0;
    this.workletId = `huovilainen-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;

    // Performance monitoring
    this.processingStartTime = 0;
    this.parameterUpdateCount = 0;
    this.underrunCount = 0;
    this.lastPerformanceReport = 0;

    // WASM-related properties
    this.inputStart = null;
    this.outputStart = null;
    this.inputBuffer = null;
    this.outputBuffer = null;

    // WASM export functions
    this.filter = null;
    this.setCutoff = null;
    this.setResonance = null;
    this.setEnvelopeActive = null;
    this.setEnvelopeCutoff = null;
    this.setEnvelopeAttack = null;
    this.setEnvelopeRelease = null;
    this.setEnvelopeDecayTime = null;
    this.setEnvelopeSustainLevel = null;
    this.updateEnvelope = null;

    // Parameter batching for efficient updates
    this.parameterBatch = new Map();
    this.batchSize = 0;
    this.maxBatchSize = 16;

    // Memory pool for temporary buffers
    this.tempBufferPool = new Map();
    this.tempBufferSize = this.WEBEAUDIO_FRAME_SIZE;

    this.port.onmessage = (e) => {
      // Handle WASM instantiation
      if (e.data instanceof ArrayBuffer) {
        WebAssembly.instantiate(e.data).then((result) => {
          const exports = result.instance.exports;

          this.inputStart = exports.inputBufferPtr();
          this.outputStart = exports.outputBufferPtr();

          this.inputBuffer = new Float32Array(
            exports.memory.buffer,
            this.inputStart,
            this.WEBEAUDIO_FRAME_SIZE
          );
          this.outputBuffer = new Float32Array(
            exports.memory.buffer,
            this.outputStart,
            this.WEBEAUDIO_FRAME_SIZE
          );

          exports.init();

          this.filter = exports.filter;
          this.setCutoff = exports.setCutoff;
          this.setResonance = exports.setResonance;
          this.setEnvelopeActive = exports.setEnvelopeActive;
          this.setEnvelopeCutoff = exports.setEnvelopeCutoff;
          this.setEnvelopeAttack = exports.setEnvelopeAttack;
          this.setEnvelopeRelease = exports.setEnvelopeRelease;
          this.setEnvelopeDecayTime = exports.setEnvelopeDecayTime;
          this.setEnvelopeSustainLevel = exports.setEnvelopeSustainLevel;
          this.updateEnvelope = exports.updateEnvelope;

          // Report successful initialization
          this.reportPerformance();
        });
      } else if ("cutOff" in e.data) {
        if (this.setCutoff) {
          this.batchParameterUpdate("cutoff", e.data.cutOff);
        }
      } else if ("resonance" in e.data) {
        if (this.setResonance) {
          this.batchParameterUpdate("resonance", e.data.resonance);
        }
      } else if ("envelopeAttack" in e.data) {
        if (
          this.setEnvelopeAttack &&
          this.setEnvelopeDecayTime &&
          this.setEnvelopeSustainLevel
        ) {
          const {
            startCutoff,
            peakCutoff,
            attackTime,
            decayTime,
            sustainLevel,
          } = e.data.envelopeAttack;

          // Batch envelope parameter updates
          this.batchParameterUpdate("envelopeAttack", {
            startCutoff,
            peakCutoff,
            attackTime,
          });
          this.batchParameterUpdate("envelopeDecayTime", decayTime);
          this.batchParameterUpdate("envelopeSustainLevel", sustainLevel);
        }
      } else if ("envelopeRelease" in e.data) {
        if (this.setEnvelopeRelease) {
          const { targetCutoff, releaseTime } = e.data.envelopeRelease;
          this.batchParameterUpdate("envelopeRelease", {
            targetCutoff,
            releaseTime,
          });
        }
      } else if ("setEnvelopeActive" in e.data) {
        if (this.setEnvelopeActive) {
          this.batchParameterUpdate("envelopeActive", e.data.setEnvelopeActive);
        }
      }
    };
  }

  /**
   * Batch parameter updates for efficiency
   */
  batchParameterUpdate(parameterName, value) {
    if (!this.parameterBatch.has(parameterName)) {
      this.parameterBatch.set(parameterName, []);
    }

    const batch = this.parameterBatch.get(parameterName);
    batch.push(value);
    this.batchSize++;

    // Process batch if it's full or if it's a critical parameter
    if (
      this.batchSize >= this.maxBatchSize ||
      parameterName === "cutoff" ||
      parameterName === "resonance"
    ) {
      this.processParameterBatch();
    }

    this.parameterUpdateCount++;
  }

  /**
   * Process batched parameter updates
   */
  processParameterBatch() {
    for (const [parameterName, values] of this.parameterBatch) {
      const latestValue = values[values.length - 1];

      switch (parameterName) {
        case "cutoff":
          this.setCutoff(latestValue);
          break;
        case "resonance":
          this.setResonance(latestValue);
          break;
        case "envelopeActive":
          this.setEnvelopeActive(latestValue);
          break;
        case "envelopeAttack":
          const { startCutoff, peakCutoff, attackTime } = latestValue;
          this.setEnvelopeAttack(startCutoff, peakCutoff, attackTime);
          break;
        case "envelopeDecayTime":
          this.setEnvelopeDecayTime(latestValue);
          break;
        case "envelopeSustainLevel":
          this.setEnvelopeSustainLevel(latestValue);
          break;
        case "envelopeRelease":
          const { targetCutoff, releaseTime } = latestValue;
          this.setEnvelopeRelease(targetCutoff, releaseTime);
          break;
      }
    }

    // Clear processed batches
    this.parameterBatch.clear();
    this.batchSize = 0;
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

    // WASM memory
    if (this.inputBuffer && this.outputBuffer) {
      totalMemory += this.inputBuffer.byteLength + this.outputBuffer.byteLength;
    }

    // Temporary buffer pool
    for (const [size, pool] of this.tempBufferPool) {
      totalMemory += pool.length * size * 4; // 4 bytes per float32
    }

    return totalMemory;
  }

  /**
   * Process audio inputs and outputs
   * @param {Float32Array[][]} inputList - Input audio channels
   * @param {Float32Array[][]} outputList - Output audio channels
   * @param {Object} parameters - Audio parameters
   * @returns {boolean} - Whether to continue processing
   */
  process(inputList, outputList, parameters) {
    this.processingStartTime = performance.now();

    // Check if we have valid input and output
    if (
      !inputList ||
      !inputList[0] ||
      !inputList[0][0] ||
      !outputList ||
      !outputList[0] ||
      !outputList[0][0]
    ) {
      return true;
    }

    // If filter not ready, pass through
    if (!this.filter || !this.inputBuffer || !this.outputBuffer) {
      outputList[0][0].set(inputList[0][0]);
      return true;
    }

    // Process any pending parameter batches
    if (this.batchSize > 0) {
      this.processParameterBatch();
    }

    // Update envelope timing with optimized time calculation
    if (this.updateEnvelope) {
      const currentTime = this.frameCount / 44100;
      // Only update if time has changed significantly
      if (Math.abs(currentTime - this.lastTime) > 0.001) {
        this.updateEnvelope(currentTime);
        this.lastTime = currentTime;
      }
    }

    // Use temporary buffer from pool for efficient copying
    const tempBuffer = this.getTempBuffer();

    try {
      // Copy input data efficiently
      tempBuffer.set(inputList[0][0]);
      this.inputBuffer.set(tempBuffer);

      // Process filter
      this.filter();

      // Copy output data efficiently
      tempBuffer.set(this.outputBuffer);
      outputList[0][0].set(tempBuffer);
    } finally {
      // Always return buffer to pool
      this.returnTempBuffer(tempBuffer);
    }

    this.frameCount += this.WEBEAUDIO_FRAME_SIZE;

    // Report performance periodically
    this.reportPerformance();

    return true;
  }
}

registerProcessor(
  "huovilainen-worklet-processor-optimized",
  OptimizedHuovilainenWorkletProcessor
);
