/**
 * @typedef {Object} OverloadMessage
 * @property {boolean} overload
 */

/**
 * @typedef {Object} DebugMessage
 * @property {true} debug
 * @property {string} maxLevel
 * @property {boolean} overload
 */

/**
 * @typedef {OverloadMessage|DebugMessage} WorkletMessage
 */

/**
 * Overload meter processor for detecting audio clipping
 */
class OverloadMeterProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastOverload = false;
    this.frameCount = 0;
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

    for (let i = 0; i < channel.length; i++) {
      const level = Math.abs(channel[i]);
      maxLevel = Math.max(maxLevel, level);
      if (level > 0.3) {
        // Much lower threshold - easier to trigger
        overload = true;
        break;
      }
    }

    // Debug logging every 100 frames (about every 2 seconds at 48kHz)
    this.frameCount++;
    if (this.frameCount % 100 === 0) {
      this.port.postMessage({
        debug: true,
        maxLevel: maxLevel.toFixed(3),
        overload: overload,
      });
    }

    if (overload !== this.lastOverload) {
      this.port.postMessage({ overload });
      this.lastOverload = overload;
    }

    return true;
  }
}

registerProcessor("overload-meter-processor", OverloadMeterProcessor);
