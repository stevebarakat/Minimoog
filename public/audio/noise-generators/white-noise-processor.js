/**
 * White noise processor for generating uniform frequency distribution noise
 */
class WhiteNoiseProcessor extends AudioWorkletProcessor {
  /**
   * Process audio inputs and outputs
   * @param {Float32Array[][]} inputs - Input audio channels
   * @param {Float32Array[][]} outputs - Output audio channels
   * @returns {boolean} - Whether to continue processing
   */
  process(inputs, outputs) {
    const output = outputs[0];
    const channel = output[0];

    for (let i = 0; i < channel.length; i++) {
      channel[i] = Math.random() * 2 - 1;
    }

    return true;
  }
}

registerProcessor("white-noise-processor", WhiteNoiseProcessor);
