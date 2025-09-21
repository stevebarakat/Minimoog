/**
 * @typedef {Object} OverloadMessage
 * @property {boolean} overload
 */

/**
 * @typedef {Object} LevelMessage
 * @property {number} level
 */

/**
 * @typedef {Object} DebugMessage
 * @property {true} debug
 * @property {string} maxLevel
 * @property {boolean} overload
 */

/**
 * @typedef {OverloadMessage|LevelMessage|DebugMessage} WorkletMessage
 */

/**
 * Overload meter processor for detecting audio clipping and monitoring levels
 */
class OverloadMeterProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastOverload = false;
    this.levelUpdateCounter = 0;
    this.lastLevel = 0;
  }

  /**
   * Process audio inputs and outputs
   * @param {Float32Array[][]} inputs - Input audio channels
   * @param {Float32Array[][]} outputs - Output audio channels
   * @param {Object} parameters - Audio parameters
   * @returns {boolean} - Whether to continue processing
   */
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;

    const channel = input[0];
    let overload = false;
    let maxLevel = 0;
    let rmsLevel = 0;

    // Calculate RMS level and check for overload
    for (let i = 0; i < channel.length; i++) {
      const level = Math.abs(channel[i]);
      maxLevel = Math.max(maxLevel, level);
      rmsLevel += level * level;

      if (level > 0.3) {
        // Much lower threshold - easier to trigger
        overload = true;
      }
    }

    // Calculate RMS (Root Mean Square) for more accurate level representation
    rmsLevel = Math.sqrt(rmsLevel / channel.length);

    // Update level counter for smoother level updates
    this.levelUpdateCounter++;

    // Send level updates every frame for maximum responsiveness
    const normalizedLevel = Math.min(1, rmsLevel * 2); // Scale for better visual representation
    if (Math.abs(normalizedLevel - this.lastLevel) > 0.001) {
      // Much smaller threshold for more responsive updates
      this.port.postMessage({ level: normalizedLevel });
      this.lastLevel = normalizedLevel;
    }

    if (overload !== this.lastOverload) {
      this.port.postMessage({ overload });
      this.lastOverload = overload;
    }

    // Pass through audio to output (copy input to output)
    const output = outputs[0];
    if (output && output[0]) {
      for (let i = 0; i < channel.length; i++) {
        output[0][i] = channel[i];
      }
    }

    return true;
  }
}

registerProcessor("overload-meter-processor", OverloadMeterProcessor);
