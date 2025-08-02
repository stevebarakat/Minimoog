// Audio constants for Authentic-style Moog Filter Processor
const AUDIO_CONSTANTS = {
  MOOG_FILTER: {
    DEFAULT_CUTOFF: 1000,
    MIN_CUTOFF: 20,
    MAX_CUTOFF: 20000,
    DEFAULT_RESONANCE: 0.5,
    MIN_RESONANCE: 0,
    MAX_RESONANCE: 4.0,
    SMOOTHING_COEFFICIENT: 0.99,
  },
  // Authentic-style specific constants
  AUTHENTIC_STYLE: {
    FREQUENCY_SCALE: 1.16,
    INPUT_FACTOR_COEFF: 0.35013,
    RESONANCE_FREQ_DEPENDENCE: 0.15,
    POLE_COEFFICIENT: 0.3,
  },
};

class MoogAuthenticProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "cutoff",
        defaultValue: AUDIO_CONSTANTS.MOOG_FILTER.DEFAULT_CUTOFF,
        minValue: AUDIO_CONSTANTS.MOOG_FILTER.MIN_CUTOFF,
        maxValue: AUDIO_CONSTANTS.MOOG_FILTER.MAX_CUTOFF,
        automationRate: "k-rate",
      },
      {
        name: "resonance",
        defaultValue: AUDIO_CONSTANTS.MOOG_FILTER.DEFAULT_RESONANCE,
        minValue: AUDIO_CONSTANTS.MOOG_FILTER.MIN_RESONANCE,
        maxValue: AUDIO_CONSTANTS.MOOG_FILTER.MAX_RESONANCE,
        automationRate: "k-rate",
      },
    ];
  }

  constructor() {
    super();
    this.sampleRate = sampleRate;

    // Smoothing for parameter changes
    this.smoothedCutoff = AUDIO_CONSTANTS.MOOG_FILTER.DEFAULT_CUTOFF;
    this.smoothedResonance = AUDIO_CONSTANTS.MOOG_FILTER.DEFAULT_RESONANCE;
    this.smoothingCoeff = AUDIO_CONSTANTS.MOOG_FILTER.SMOOTHING_COEFFICIENT;

    // Authentic-style state variables (4-pole ladder filter)
    this.in1 = this.in2 = this.in3 = this.in4 = 0.0;
    this.out1 = this.out2 = this.out3 = this.out4 = 0.0;
  }

  // Authentic-style saturation (authentic to original Minimoog)
  saturateAuthentic(x) {
    // Authentic saturation characteristics from original Minimoog
    const absX = Math.abs(x);
    if (absX < 0.1) {
      return x; // Linear region
    } else {
      const sign = x >= 0 ? 1 : -1;
      // Authentic soft clipping - characteristic of original transistor saturation
      return sign * (0.1 + 0.9 * Math.tanh((absX - 0.1) * 5));
    }
  }

  // Authentic-style frequency scaling
  scaleFrequencyAuthentic(fc) {
    // Normalize frequency to 0-1 range (assuming max 20kHz)
    const normalizedFreq = fc / 20000;
    // Authentic frequency scaling from Authentic implementation
    return (
      normalizedFreq * AUDIO_CONSTANTS.AUTHENTIC_STYLE.FREQUENCY_SCALE * 3.0
    );
  }

  // Smooth parameter changes to prevent artifacts
  smoothParameter(current, target, coeff) {
    return current * coeff + target * (1 - coeff);
  }

  // Main Authentic-style processing (authentic 4-pole ladder filter)
  processAuthentic(inputSample, fc, res) {
    // Scale frequency like Authentic does
    const f = this.scaleFrequencyAuthentic(fc);
    const inputFactor =
      AUDIO_CONSTANTS.AUTHENTIC_STYLE.INPUT_FACTOR_COEFF * (f * f) * (f * f);

    // Frequency-dependent resonance feedback (authentic to original)
    const fb =
      res *
      (1.0 - AUDIO_CONSTANTS.AUTHENTIC_STYLE.RESONANCE_FREQ_DEPENDENCE * f * f);

    // Apply input factor and feedback
    const processedInput = (inputSample - this.out4 * fb) * inputFactor;

    // 4-pole ladder filter (authentic Minimoog topology)
    this.out1 =
      processedInput +
      AUDIO_CONSTANTS.AUTHENTIC_STYLE.POLE_COEFFICIENT * this.in1 +
      (1 - f) * this.out1;
    this.in1 = processedInput;

    this.out2 =
      this.out1 +
      AUDIO_CONSTANTS.AUTHENTIC_STYLE.POLE_COEFFICIENT * this.in2 +
      (1 - f) * this.out2;
    this.in2 = this.out1;

    this.out3 =
      this.out2 +
      AUDIO_CONSTANTS.AUTHENTIC_STYLE.POLE_COEFFICIENT * this.in3 +
      (1 - f) * this.out3;
    this.in3 = this.out2;

    this.out4 =
      this.out3 +
      AUDIO_CONSTANTS.AUTHENTIC_STYLE.POLE_COEFFICIENT * this.in4 +
      (1 - f) * this.out4;
    this.in4 = this.out3;

    // Apply authentic saturation and slight boost for character
    const saturated = this.saturateAuthentic(this.out4);
    const output = saturated * 1.2;

    return output; // Authentic Minimoog character boost
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || !input[0]) return true;

    const inputChannel = input[0];
    const outputChannel = output[0];

    // Get current parameter values
    const currentCutoff = parameters.cutoff[0] ?? this.smoothedCutoff;
    const currentResonance = parameters.resonance[0] ?? this.smoothedResonance;

    // Smooth parameter changes
    this.smoothedCutoff = this.smoothParameter(
      this.smoothedCutoff,
      currentCutoff,
      this.smoothingCoeff
    );
    this.smoothedResonance = this.smoothParameter(
      this.smoothedResonance,
      currentResonance,
      this.smoothingCoeff
    );

    // Process each sample
    for (let i = 0; i < inputChannel.length; i++) {
      const inputSample = inputChannel[i];

      // Apply Authentic-style processing (authentic Minimoog)
      outputChannel[i] = this.processAuthentic(
        inputSample,
        this.smoothedCutoff,
        this.smoothedResonance
      );
    }

    return true;
  }
}

registerProcessor("moog-authentic-processor", MoogAuthenticProcessor);
