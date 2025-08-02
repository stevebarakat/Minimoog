// Audio constants for Authentic Minimoog Filter Processor
const AUDIO_CONSTANTS = {
  MOOG_FILTER: {
    DEFAULT_CUTOFF: 1000,
    MIN_CUTOFF: 10, // Original Minimoog went down to 10Hz
    MAX_CUTOFF: 32000, // Original Minimoog went up to 32kHz
    DEFAULT_RESONANCE: 0.5,
    MIN_RESONANCE: 0,
    MAX_RESONANCE: 4.0,
    SMOOTHING_COEFFICIENT: 0.99,
    OVERSAMPLE_FACTOR: 2, // Reduced from 4 for more subtle processing
  },
  // Authentic Minimoog specific constants
  AUTHENTIC_STYLE: {
    FREQUENCY_SCALE: 1.16,
    INPUT_FACTOR_COEFF: 0.35013,
    RESONANCE_FREQ_DEPENDENCE: 0.15,
    POLE_COEFFICIENT: 0.3,
    // Original Minimoog emphasis characteristics (more subtle)
    EMPHASIS_BREAKPOINT_1: 0.6, // 6 on emphasis knob
    EMPHASIS_BREAKPOINT_2: 0.85, // 8.5 on emphasis knob
    EMPHASIS_RESONANCE_1: 1.8, // Reduced from 2.0 for more subtle resonance
    EMPHASIS_RESONANCE_2: 2.8, // Reduced from 3.2 for more subtle resonance
    // Analog characteristics (reduced for subtlety)
    THERMAL_NOISE_LEVEL: 0.00005, // Reduced from 0.0001
    TEMPERATURE_DRIFT_RATE: 0.00005, // Reduced from 0.0001
    COMPONENT_TOLERANCE: 0.0002, // Reduced from 0.0005
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

    // Authentic Minimoog state variables (4-pole ladder filter)
    this.in1 = this.in2 = this.in3 = this.in4 = 0.0;
    this.out1 = this.out2 = this.out3 = this.out4 = 0.0;

    // Oversampling
    this.oversampleFactor = AUDIO_CONSTANTS.MOOG_FILTER.OVERSAMPLE_FACTOR;

    // Analog characteristics simulation (reduced for subtlety)
    this.thermalNoise = AUDIO_CONSTANTS.AUTHENTIC_STYLE.THERMAL_NOISE_LEVEL;
    this.temperatureDrift = 0;
    this.temperatureDriftRate =
      AUDIO_CONSTANTS.AUTHENTIC_STYLE.TEMPERATURE_DRIFT_RATE;
    this.componentTolerance =
      AUDIO_CONSTANTS.AUTHENTIC_STYLE.COMPONENT_TOLERANCE;

    // Pre-allocated buffers for oversampling
    this.oversampleBuffer = new Float32Array(this.oversampleFactor);
  }

  // Authentic Minimoog saturation - more subtle transistor-like characteristics
  saturateAuthentic(x) {
    const absX = Math.abs(x);

    // Original Minimoog used transistor saturation characteristics
    // This creates the "warm" distortion that's characteristic of the original
    if (absX < 0.5) {
      return x; // Linear region (increased from 0.3 for more subtle saturation)
    } else if (absX < 0.9) {
      // Transition region - slight compression (transistor saturation)
      const sign = x >= 0 ? 1 : -1;
      const t = (absX - 0.5) / 0.4;
      return sign * (0.5 + t * (0.9 - 0.5) * (1 - 0.1 * t)); // Reduced compression
    } else {
      // Hard clipping region - more subtle than before
      const sign = x >= 0 ? 1 : -1;
      return sign * (0.9 + 0.1 * Math.tanh((absX - 0.9) * 1.5)); // Reduced aggression
    }
  }

  // Add subtle analog characteristics for more organic sound
  addAnalogCharacteristics(value) {
    // Add thermal noise (reduced)
    const noise = (Math.random() - 0.5) * this.thermalNoise;

    // Add temperature drift simulation (reduced)
    this.temperatureDrift += (Math.random() - 0.5) * this.temperatureDriftRate;
    this.temperatureDrift = Math.max(
      -0.005, // Reduced from -0.01
      Math.min(0.005, this.temperatureDrift) // Reduced from 0.01
    );

    // Add component tolerance variations (reduced)
    const tolerance = (Math.random() - 0.5) * this.componentTolerance;

    return value + noise + this.temperatureDrift + tolerance;
  }

  // Authentic Minimoog emphasis curve (more subtle non-linear resonance mapping)
  mapEmphasisToResonance(emphasis) {
    // Normalize emphasis to 0-1 range
    const normalizedEmphasis = Math.max(0, Math.min(1, emphasis / 10));

    // Authentic to original Minimoog emphasis behavior (more subtle)
    if (
      normalizedEmphasis < AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_BREAKPOINT_1
    ) {
      // Linear mapping for lower values (0-6 on emphasis = 0-1.8 resonance)
      return (
        normalizedEmphasis *
        (AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_RESONANCE_1 /
          AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_BREAKPOINT_1)
      );
    } else if (
      normalizedEmphasis < AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_BREAKPOINT_2
    ) {
      // Curved mapping for middle values (6-8.5 on emphasis = 1.8-2.8 resonance)
      const remaining =
        normalizedEmphasis -
        AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_BREAKPOINT_1;
      const curve = Math.pow(
        remaining /
          (AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_BREAKPOINT_2 -
            AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_BREAKPOINT_1),
        1.1 // Reduced from 1.2 for more subtle curve
      );
      return (
        AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_RESONANCE_1 +
        curve *
          (AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_RESONANCE_2 -
            AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_RESONANCE_1)
      );
    } else {
      // Steep curve for self-oscillation (8.5-10 on emphasis = 2.8-3.5 resonance)
      const remaining =
        normalizedEmphasis -
        AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_BREAKPOINT_2;
      const steepCurve = Math.pow(
        remaining / (1 - AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_BREAKPOINT_2),
        0.9 // Increased from 0.8 for more gradual curve
      );
      return (
        AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_RESONANCE_2 +
        steepCurve *
          (3.5 - AUDIO_CONSTANTS.AUTHENTIC_STYLE.EMPHASIS_RESONANCE_2) // Reduced max from 4.0
      );
    }
  }

  // Authentic Minimoog frequency scaling
  scaleFrequencyAuthentic(fc) {
    // Normalize frequency to 0-1 range (original Minimoog: 10Hz-32kHz)
    const normalizedFreq =
      (fc - AUDIO_CONSTANTS.MOOG_FILTER.MIN_CUTOFF) /
      (AUDIO_CONSTANTS.MOOG_FILTER.MAX_CUTOFF -
        AUDIO_CONSTANTS.MOOG_FILTER.MIN_CUTOFF);

    // Authentic frequency scaling from original Minimoog
    return (
      normalizedFreq * AUDIO_CONSTANTS.AUTHENTIC_STYLE.FREQUENCY_SCALE * 3.0
    );
  }

  // Smooth parameter changes to prevent artifacts
  smoothParameter(current, target, coeff) {
    return current * coeff + target * (1 - coeff);
  }

  // Main Authentic Minimoog processing (authentic 4-pole ladder filter)
  processAuthentic(inputSample, fc, res) {
    // Scale frequency like original Minimoog
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

    // Add analog characteristics for more organic sound
    const withAnalogChar = this.addAnalogCharacteristics(saturated);

    // Authentic Minimoog character boost (reduced for subtlety)
    return withAnalogChar * 1.1; // Reduced from 1.2
  }

  // Oversampled processing for better quality
  processOversampled(inputSample, fc, res) {
    let output = 0;

    for (let os = 0; os < this.oversampleFactor; os++) {
      const input = inputSample / this.oversampleFactor;
      output += this.processAuthentic(input, fc, res);
    }

    return output / this.oversampleFactor;
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

    // Map emphasis to authentic resonance curve
    const mappedResonance = this.mapEmphasisToResonance(
      this.smoothedResonance * 10
    );

    // Process each sample with oversampling
    for (let i = 0; i < inputChannel.length; i++) {
      const inputSample = inputChannel[i];

      // Apply Authentic Minimoog processing with oversampling
      outputChannel[i] = this.processOversampled(
        inputSample,
        this.smoothedCutoff,
        mappedResonance
      );
    }

    return true;
  }
}

registerProcessor("moog-authentic-processor", MoogAuthenticProcessor);
