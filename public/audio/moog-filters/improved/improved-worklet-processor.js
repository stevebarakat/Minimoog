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
 * Improved Moog filter worklet processor
 * Based on D'Angelo and Valimaki's improved model with better stability
 * This implementation provides more stable operation and better musical quality
 */
class ImprovedWorkletProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.WEBEAUDIO_FRAME_SIZE = 128;
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
        WebAssembly.instantiate(e.data)
          .then((result) => {
            const exports = result.instance.exports;

            // Verify all required exports exist
            const requiredExports = [
              "inputBufferPtr",
              "outputBufferPtr",
              "memory",
              "init",
              "filter",
              "setCutoff",
              "setResonance",
              "setEnvelopeActive",
              "setEnvelopeCutoff",
              "setEnvelopeAttack",
              "setEnvelopeRelease",
              "setEnvelopeDecayTime",
              "setEnvelopeSustainLevel",
              "updateEnvelope",
            ];

            for (const exportName of requiredExports) {
              if (!exports[exportName]) {
                throw new Error(`Missing required export: ${exportName}`);
              }
            }

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

            // Store references to important values for debugging
            this.g = 0;
            this.resonance = 0;
          })
          .catch((error) => {
            console.error(
              "Improved processor: WASM instantiation failed:",
              error
            );
            // Send error back to main thread
            this.port.postMessage({
              error: "WASM instantiation failed",
              details: error.message,
            });
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
        if (this.setEnvelopeActive && this.setEnvelopeAttack) {
          this.setEnvelopeActive(1);
          this.setEnvelopeAttack(
            e.data.envelopeAttack.startCutoff,
            e.data.envelopeAttack.peakCutoff,
            e.data.envelopeAttack.attackTime
          );
        }
      } else if ("envelopeRelease" in e.data) {
        if (this.setEnvelopeRelease) {
          this.setEnvelopeRelease(
            e.data.envelopeRelease.targetCutoff,
            e.data.envelopeRelease.releaseTime
          );
        }
      } else if ("envelopeDecayTime" in e.data) {
        if (this.setEnvelopeDecayTime) {
          this.setEnvelopeDecayTime(e.data.envelopeDecayTime);
        }
      } else if ("envelopeSustainLevel" in e.data) {
        if (this.setEnvelopeSustainLevel) {
          this.setEnvelopeSustainLevel(e.data.envelopeSustainLevel);
        }
      } else if ("setEnvelopeActive" in e.data) {
        if (this.setEnvelopeActive) {
          this.setEnvelopeActive(e.data.setEnvelopeActive);
        }
      }
    };
  }

  /**
   * Process audio inputs and outputs
   * @param {Float32Array[][]} inputList - Input audio channels
   * @param {Float32Array[][]} outputList - Output audio channels
   * @param {Object} parameters - Audio parameters
   * @returns {boolean} - Whether to continue processing
   */
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

    this.frameCount += this.WEBEAUDIO_FRAME_SIZE;

    return true;
  }
}

registerProcessor("improved-worklet-processor", ImprovedWorkletProcessor);
