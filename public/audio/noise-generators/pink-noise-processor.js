/**
 * Audio constants for Pink Noise Processor
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
 * Pink noise processor for generating 1/f frequency distribution noise
 */
class PinkNoiseProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();
    this.b0 = 0;
    this.b1 = 0;
    this.b2 = 0;
    this.b3 = 0;
    this.b4 = 0;
    this.b5 = 0;
    this.b6 = 0;
  }

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
      const white = Math.random() * 2 - 1;
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
      channel[i] =
        (this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + b6) *
        AUDIO_CONSTANTS.PINK_NOISE.WHITE_NOISE_WEIGHT;
    }

    return true;
  }
}

registerProcessor("pink-noise-processor", PinkNoiseProcessor);
