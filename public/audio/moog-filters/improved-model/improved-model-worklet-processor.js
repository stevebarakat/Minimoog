/**
 * Improved Model filter worklet processor
 */
class ImprovedModelWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.WEBAUDIO_FRAME_SIZE = 128;
    this.frameCount = 0;
    this.lastTime = 0;

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
        // Create memory instance that we'll use (reduced size to prevent memory leaks)
        const wasmMemory = new WebAssembly.Memory({
          initial: 64, // Reduced from 256 (4MB instead of 16MB)
          maximum: 128, // Reduced from 512 (8MB instead of 32MB)
        });

        // Store reference to memory for use in callbacks
        this.wasmMemory = wasmMemory;

        WebAssembly.instantiate(e.data, {
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
            // Additional math functions
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
            // Emscripten memory globals (expected in env section)
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
            __tls_base: new WebAssembly.Global(
              { value: "i32", mutable: true },
              0
            ),
            __tls_size: new WebAssembly.Global(
              { value: "i32", mutable: true },
              0
            ),
            __tls_align: new WebAssembly.Global(
              { value: "i32", mutable: true },
              0
            ),
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
          })
          .catch((error) => {
            console.error("Failed to instantiate WASM module:", error);
            // Fallback to pass-through mode
            this.filter = null;
          });
      } else if ("cutOff" in e.data) {
        if (this.setCutoff) {
          this.setCutoff(e.data.cutOff);
        }
      } else if ("resonance" in e.data) {
        if (this.setResonance) {
          this.setResonance(e.data.resonance);
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
          this.setEnvelopeAttack(startCutoff, peakCutoff, attackTime);
          this.setEnvelopeDecayTime(decayTime);
          this.setEnvelopeSustainLevel(sustainLevel);
        }
      } else if ("envelopeRelease" in e.data) {
        if (this.setEnvelopeRelease) {
          const { targetCutoff, releaseTime } = e.data.envelopeRelease;
          this.setEnvelopeRelease(targetCutoff, releaseTime);
        }
      } else if ("setEnvelopeActive" in e.data) {
        if (this.setEnvelopeActive) {
          this.setEnvelopeActive(e.data.setEnvelopeActive);
        }
      } else if (e.data.type === "cleanup") {
        // Handle cleanup message to free WASM memory
        this.cleanup();
      }
    };
  }

  /**
   * Cleanup method to free WASM memory and resources
   */
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
    this.outputBuffer = null;
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
      // Only update if time has changed significantly
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

    return true;
  }
}

registerProcessor(
  "improved-model-worklet-processor",
  ImprovedModelWorkletProcessor
);
