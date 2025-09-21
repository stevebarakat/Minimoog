/**
 * Optimized Huovilainen filter worklet processor
 * Features: Parameter batching, memory pooling, performance monitoring
 */
class HuovilainenOptimizedWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.WEBAUDIO_FRAME_SIZE = 128;
    this.frameCount = 0;
    this.lastTime = 0;

    // Performance monitoring
    this.workletId = `huovilainen-optimized-${Date.now()}-${Math.random()
      .toString(36)
      .substr(2, 9)}`;
    this.processingStartTime = 0;
    this.lastPerformanceReport = 0;
    this.parameterUpdateCount = 0;
    this.batchCount = 0;

    // Parameter batching
    this.parameterBatch = new Map();
    this.batchSize = 0;
    this.maxBatchSize = 16;

    // Memory pooling
    this.tempBufferPool = new Map();
    this.memoryPoolSize = 0;
    this.maxMemoryPoolSize = 50 * 1024 * 1024; // 50MB

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

    this.port.onmessage = (e) => {
      // Handle WASM instantiation
      if (e.data instanceof ArrayBuffer) {
        this.initializeWasm(e.data);
      } else if (e.data.type === "parameter-update") {
        this.batchParameterUpdate(e.data.parameter, e.data.value);
      } else if (e.data.type === "cleanup") {
        this.cleanup();
      } else {
        // Handle legacy message format for backward compatibility
        this.handleLegacyMessage(e.data);
      }
    };
  }

  initializeWasm(wasmBuffer) {
    // Create memory instance with optimized size
    const wasmMemory = new WebAssembly.Memory({
      initial: 64, // 4MB
      maximum: 128, // 8MB
    });

    this.wasmMemory = wasmMemory;

    WebAssembly.instantiate(wasmBuffer, {
      env: {
        memory: wasmMemory,
        abort: () => {},
        seed: () => Math.floor(Math.random() * 1000000),
        // Math functions required by the WASM module
        fmin: Math.min,
        fmax: Math.max,
        fabs: Math.abs,
        sqrt: Math.sqrt,
        pow: Math.pow,
        exp: Math.exp,
        log: Math.log,
        sin: Math.sin,
        cos: Math.cos,
        tan: Math.tan,
        tanh: Math.tanh,
        sinh: Math.sinh,
        cosh: Math.cosh,
        asin: Math.asin,
        acos: Math.acos,
        atan: Math.atan,
        atan2: Math.atan2,
        floor: Math.floor,
        ceil: Math.ceil,
        round: Math.round,
        fmod: (x, y) => x % y,
        trunc: Math.trunc,
        nearbyint: Math.round,
        copysign: (x, y) => Math.sign(y) * Math.abs(x),
        // Constants
        PI: Math.PI,
        E: Math.E,
        LN2: Math.LN2,
        LN10: Math.LN10,
        LOG2E: Math.LOG2E,
        LOG10E: Math.LOG10E,
        SQRT1_2: Math.SQRT1_2,
        SQRT2: Math.SQRT2,
        // Emscripten memory globals
        __memory_base: 0,
        __table_base: 0,
        __indirect_function_table: new WebAssembly.Table({
          initial: 0,
          element: "anyfunc",
        }),
        __stack_pointer: new WebAssembly.Global(
          { value: "i32", mutable: true },
          0
        ),
        __stack_limit: new WebAssembly.Global(
          { value: "i32", mutable: true },
          0
        ),
        __tls_base: new WebAssembly.Global({ value: "i32", mutable: true }, 0),
        __tls_size: new WebAssembly.Global({ value: "i32", mutable: true }, 0),
        __tls_align: new WebAssembly.Global({ value: "i32", mutable: true }, 0),
        __table_size: new WebAssembly.Global(
          { value: "i32", mutable: true },
          0
        ),
        __table_align: new WebAssembly.Global(
          { value: "i32", mutable: true },
          0
        ),
        __memory_size: new WebAssembly.Global(
          { value: "i32", mutable: true },
          0
        ),
        __memory_align: new WebAssembly.Global(
          { value: "i32", mutable: true },
          0
        ),
      },
    })
      .then((result) => {
        const exports = result.instance.exports;

        this.inputStart = exports.inputBufferPtr();
        this.outputStart = exports.outputBufferPtr();

        this.inputBuffer = new Float32Array(
          this.wasmMemory.buffer,
          this.inputStart,
          this.WEBAUDIO_FRAME_SIZE
        );
        this.outputBuffer = new Float32Array(
          this.wasmMemory.buffer,
          this.outputStart,
          this.WEBAUDIO_FRAME_SIZE
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

        this.reportPerformance("initialized");
      })
      .catch((error) => {
        console.error("Failed to instantiate WASM module:", error);
        this.filter = null;
        this.reportPerformance("error", { error: error.message });
      });
  }

  batchParameterUpdate(parameter, value) {
    if (!this.parameterBatch.has(parameter)) {
      this.parameterBatch.set(parameter, []);
    }

    const batch = this.parameterBatch.get(parameter);
    batch.push(value);
    this.batchSize++;
    this.parameterUpdateCount++;

    // Process batch if it's full, otherwise process immediately
    // (simplified for AudioWorklet context without setTimeout)
    this.processParameterBatch();
  }

  processParameterBatch() {
    if (this.batchSize === 0) return;

    // Process batched parameters
    for (const [parameter, values] of this.parameterBatch) {
      if (values.length === 0) continue;

      const latestValue = values[values.length - 1];
      this.applyParameterUpdate(parameter, latestValue);
    }

    this.batchCount++;
    this.parameterBatch.clear();
    this.batchSize = 0;
  }

  applyParameterUpdate(parameter, value) {
    if (!this.filter) return;

    switch (parameter) {
      case "cutOff":
        if (this.setCutoff) this.setCutoff(value);
        break;
      case "resonance":
        if (this.setResonance) this.setResonance(value);
        break;
      case "envelopeAttack":
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
          } = value;
          this.setEnvelopeAttack(startCutoff, peakCutoff, attackTime);
          this.setEnvelopeDecayTime(decayTime);
          this.setEnvelopeSustainLevel(sustainLevel);
        }
        break;
      case "envelopeRelease":
        if (this.setEnvelopeRelease) {
          const { targetCutoff, releaseTime } = value;
          this.setEnvelopeRelease(targetCutoff, releaseTime);
        }
        break;
      case "setEnvelopeActive":
        if (this.setEnvelopeActive) {
          this.setEnvelopeActive(value);
        }
        break;
    }
  }

  handleLegacyMessage(data) {
    // Handle legacy message format for backward compatibility
    if ("cutOff" in data) {
      this.batchParameterUpdate("cutOff", data.cutOff);
    } else if ("resonance" in data) {
      this.batchParameterUpdate("resonance", data.resonance);
    } else if ("envelopeAttack" in data) {
      this.batchParameterUpdate("envelopeAttack", data.envelopeAttack);
    } else if ("envelopeRelease" in data) {
      this.batchParameterUpdate("envelopeRelease", data.envelopeRelease);
    } else if ("setEnvelopeActive" in data) {
      this.batchParameterUpdate("setEnvelopeActive", data.setEnvelopeActive);
    }
  }

  getTempBuffer(size) {
    if (!this.tempBufferPool.has(size)) {
      this.tempBufferPool.set(size, []);
    }

    const pool = this.tempBufferPool.get(size);
    if (pool.length > 0) {
      return pool.pop();
    }

    const buffer = new Float32Array(size);
    this.memoryPoolSize += buffer.byteLength;
    return buffer;
  }

  returnTempBuffer(buffer, size) {
    if (!this.tempBufferPool.has(size)) {
      this.tempBufferPool.set(size, []);
    }

    const pool = this.tempBufferPool.get(size);
    if (this.memoryPoolSize < this.maxMemoryPoolSize) {
      buffer.fill(0);
      pool.push(buffer);
    } else {
      this.memoryPoolSize -= buffer.byteLength;
    }
  }

  reportPerformance(event, data = {}) {
    // Simple performance reporting without timing in worklet context
    this.port.postMessage({
      type: "performance-metrics",
      workletId: this.workletId,
      event: event,
      processingTimeUs: 0, // Not available in worklet context
      cpuUsage: 0, // Not available in worklet context
      memoryUsage: this.calculateMemoryUsage(),
      parameterUpdates: this.parameterUpdateCount,
      batchCount: this.batchCount,
      batchEfficiency:
        this.batchCount > 0 ? this.parameterUpdateCount / this.batchCount : 0,
      memoryPoolSize: this.memoryPoolSize,
      ...data,
    });
  }

  estimateCpuUsage(processingTime) {
    // Estimate CPU usage based on processing time
    const frameTime = (this.WEBAUDIO_FRAME_SIZE / 44100) * 1000000; // microseconds
    return Math.min(100, (processingTime / frameTime) * 100);
  }

  calculateMemoryUsage() {
    let totalMemory = 0;
    for (const [size, buffers] of this.tempBufferPool) {
      totalMemory += buffers.length * size * 4; // 4 bytes per float32
    }
    return totalMemory;
  }

  cleanup() {
    // Clear WASM memory reference
    this.wasmMemory = null;

    // Clear WASM export functions
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

    // Clear buffers
    this.inputStart = null;
    this.outputStart = null;
    this.inputBuffer = null;
    this.outputBuffer = null;

    // Clear parameter batch
    this.parameterBatch.clear();
    this.batchSize = 0;

    // Clear memory pool
    this.tempBufferPool.clear();
    this.memoryPoolSize = 0;
  }

  process(inputList, outputList, parameters) {
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

    // Update envelope timing with optimized time calculation
    if (this.updateEnvelope) {
      const currentTime = this.frameCount / 44100;
      if (Math.abs(currentTime - this.lastTime) > 0.001) {
        this.updateEnvelope(currentTime);
        this.lastTime = currentTime;
      }
    }

    // Copy input data efficiently
    this.inputBuffer.set(inputList[0][0]);

    // Process filter
    this.filter();

    // Copy output data efficiently
    outputList[0][0].set(this.outputBuffer);

    this.frameCount += this.WEBAUDIO_FRAME_SIZE;

    // Report performance periodically (simplified for worklet context)
    if (this.frameCount % (44100 * 2) === 0) {
      // Every 2 seconds
      this.reportPerformance("processing");
    }

    return true;
  }
}

registerProcessor(
  "huovilainen-worklet-processor-optimized",
  HuovilainenOptimizedWorkletProcessor
);
