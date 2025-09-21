/**
 * Simple test worklet processor to debug audio processing
 */
class SimpleTestProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.WEBEAUDIO_FRAME_SIZE = 128;
    this.frameCount = 0;

    // WASM-related properties
    this.inputStart = null;
    this.outputStart = null;
    this.inputBuffer = null;
    this.outputBuffer = null;

    // WASM export functions
    this.filter = null;
    this.setCutoff = null;
    this.setResonance = null;

    this.port.onmessage = (e) => {
      // Handle WASM instantiation
      if (e.data instanceof ArrayBuffer) {
        WebAssembly.instantiate(e.data)
          .then((result) => {
            const exports = result.instance.exports;

            // Verify required exports
            if (
              !exports.inputBufferPtr ||
              !exports.outputBufferPtr ||
              !exports.memory ||
              !exports.init ||
              !exports.filter ||
              !exports.setCutoff ||
              !exports.setResonance
            ) {
              throw new Error("Missing required exports");
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
          })
          .catch((error) => {
            console.error(
              "Simple test processor: WASM instantiation failed:",
              error
            );
            this.port.postMessage({
              error: "WASM instantiation failed",
              details: error.message,
            });
          });
      }
    };
  }

  process(inputList, outputList, parameters) {
    // Check if we have valid input and output
    if (!inputList?.[0]?.[0] || !outputList?.[0]?.[0]) {
      return true;
    }

    // If filter not ready, pass through
    if (!this.filter || !this.inputBuffer || !this.outputBuffer) {
      outputList[0][0].set(inputList[0][0]);
      return true;
    }

    // Copy input data
    this.inputBuffer.set(inputList[0][0]);

    // Process filter
    this.filter();

    // Copy output data
    outputList[0][0].set(this.outputBuffer);

    this.frameCount += this.WEBEAUDIO_FRAME_SIZE;
    return true;
  }
}

registerProcessor("simple-test-processor", SimpleTestProcessor);
