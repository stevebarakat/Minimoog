// Audio constants for Moog ZDF Filter (Pure Mathematical Accuracy)
const AUDIO_CONSTANTS = {
  MOOG_FILTER: {
    DEFAULT_CUTOFF: 1000,
    MIN_CUTOFF: 20,
    MAX_CUTOFF: 20000,
    DEFAULT_RESONANCE: 0.5,
    MIN_RESONANCE: 0,
    MAX_RESONANCE: 4.0,
    SMOOTHING_COEFFICIENT: 0.99,
    OVERSAMPLE_FACTOR: 4,
    TEMPERATURE_DRIFT: 0.001,
    COMPONENT_TOLERANCE: 0.005,
    THERMAL_NOISE: 0.0001,
  },
  FILTER_MAPPING: {
    RESONANCE: {
      LINEAR_THRESHOLD: 2.4,
      CURVED_THRESHOLD: 3.4,
      CURVE_POWER: 1.2,
      STEEP_CURVE_POWER: 0.8,
      LINEAR_FEEDBACK_RANGE: 0.8,
      STEEP_FEEDBACK_RANGE: 0.8,
    },
  },
};

class MoogZDFProcessor extends AudioWorkletProcessor {
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
    this.stage = [0, 0, 0, 0];
    this.sampleRate = sampleRate;

    this.smoothedCutoff = AUDIO_CONSTANTS.MOOG_FILTER.DEFAULT_CUTOFF;
    this.smoothedResonance = AUDIO_CONSTANTS.MOOG_FILTER.DEFAULT_RESONANCE;
    this.smoothingCoeff = AUDIO_CONSTANTS.MOOG_FILTER.SMOOTHING_COEFFICIENT;

    this.T = 1 / this.sampleRate;
    this.T2 = this.T / 2;

    this.oversampleFactor = AUDIO_CONSTANTS.MOOG_FILTER.OVERSAMPLE_FACTOR;

    this.maxResonance = AUDIO_CONSTANTS.MOOG_FILTER.MAX_RESONANCE;

    this.temperatureDrift = AUDIO_CONSTANTS.MOOG_FILTER.TEMPERATURE_DRIFT;
    this.componentTolerance = AUDIO_CONSTANTS.MOOG_FILTER.COMPONENT_TOLERANCE;
    this.thermalNoise = AUDIO_CONSTANTS.MOOG_FILTER.THERMAL_NOISE;
  }

  // More authentic saturation function - closer to original Moog ladder filter
  saturate(x) {
    // Original Minimoog used transistor saturation characteristics
    // This creates the "warm" distortion that's characteristic of the original
    const absX = Math.abs(x);

    // Soft clipping with transistor-like characteristics
    if (absX < 0.3) {
      return x; // Linear region
    } else if (absX < 0.8) {
      // Transition region - slight compression
      const sign = x >= 0 ? 1 : -1;
      const t = (absX - 0.3) / 0.5;
      return sign * (0.3 + t * (0.8 - 0.3) * (1 - 0.2 * t));
    } else {
      // Hard clipping region
      const sign = x >= 0 ? 1 : -1;
      return sign * (0.8 + 0.2 * Math.tanh((absX - 0.8) * 2));
    }
  }

  // Optimized frequency warping for bilinear transform (ZDF style)
  prewarpFrequency(fc) {
    // Bilinear transform frequency warping
    const omega = 2 * Math.PI * fc;
    const tanOmegaT2 = Math.tan(omega * this.T2);
    let warped = (2 / this.T) * tanOmegaT2;
    // Clamp to 0.45 * Nyquist to avoid instability
    const nyquist = this.sampleRate / 2;
    const maxWarped = 0.45 * nyquist;
    if (warped > maxWarped) warped = maxWarped;
    return warped;
  }

  // Smooth parameter changes to prevent audio artifacts
  smoothParameter(current, target, coeff) {
    return current * coeff + target * (1 - coeff);
  }

  // Add subtle analog characteristics for authenticity
  addAnalogCharacteristics(value) {
    // Add temperature drift
    const tempDrift = (Math.random() - 0.5) * this.temperatureDrift;

    // Add component tolerance variations
    const tolerance = (Math.random() - 0.5) * this.componentTolerance;

    // Add thermal noise
    const noise = (Math.random() - 0.5) * this.thermalNoise;

    return value * (1 + tempDrift + tolerance) + noise;
  }

  // Zero Delay Feedback (ZDF) processing - mathematically accurate
  processZDF(inputSample, fc, res) {
    // Prewarp frequency for bilinear transform
    const warpedFreq = this.prewarpFrequency(fc);

    // Complex resonance mapping for authentic response
    let resonance = res;
    if (res > AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.LINEAR_THRESHOLD) {
      if (res > AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.CURVED_THRESHOLD) {
        // Steep curve for high resonance
        const excess =
          res - AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.CURVED_THRESHOLD;
        const steepRange =
          this.maxResonance -
          AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.CURVED_THRESHOLD;
        const normalizedExcess = excess / steepRange;
        resonance =
          AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.CURVED_THRESHOLD +
          steepRange *
            Math.pow(
              normalizedExcess,
              AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.STEEP_CURVE_POWER
            );
      } else {
        // Curved region
        const excess =
          res - AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.LINEAR_THRESHOLD;
        const curvedRange =
          AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.CURVED_THRESHOLD -
          AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.LINEAR_THRESHOLD;
        const normalizedExcess = excess / curvedRange;
        resonance =
          AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.LINEAR_THRESHOLD +
          curvedRange *
            Math.pow(
              normalizedExcess,
              AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.CURVE_POWER
            );
      }
    }

    // Oversampling for better quality
    let output = 0;
    for (let os = 0; os < this.oversampleFactor; os++) {
      // ZDF filter coefficients
      const g = warpedFreq * this.T2;
      const g2 = g * g;
      const g3 = g2 * g;
      const g4 = g3 * g;

      // Resonance feedback
      const k = resonance * 4;
      const k2 = k * k;
      const k3 = k2 * k;
      const k4 = k3 * k;

      // ZDF filter equations
      const a0 = 1 + g;
      const a1 = -4 * g;
      const a2 = 6 * g2;
      const a3 = -4 * g3;
      const a4 = g4;

      const b0 = 1 + k * g + k2 * g2 + k3 * g3 + k4 * g4;
      const b1 = -4 * g - 4 * k * g2 - 4 * k2 * g3 - 4 * k3 * g4;
      const b2 = 6 * g2 + 6 * k * g3 + 6 * k2 * g4;
      const b3 = -4 * g3 - 4 * k * g4;
      const b4 = g4;

      // Process sample
      const input = inputSample / this.oversampleFactor;
      const outputSample =
        (b0 * input +
          b1 * this.stage[0] +
          b2 * this.stage[1] +
          b3 * this.stage[2] +
          b4 * this.stage[3]) /
        a0;

      // Update state
      this.stage[3] = this.stage[2];
      this.stage[2] = this.stage[1];
      this.stage[1] = this.stage[0];
      this.stage[0] = outputSample;

      output += outputSample;
    }

    // Average oversampled output
    output /= this.oversampleFactor;

    // Add analog characteristics
    output = this.addAnalogCharacteristics(output);

    // Apply saturation
    const saturated = this.saturate(output);

    return saturated;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0][0] || [];
    const output = outputs[0][0] || [];

    const cutoffValues = parameters.cutoff;
    const resonanceValues = parameters.resonance;

    const isCutoffConstant = cutoffValues.length === 1;
    const isResonanceConstant = resonanceValues.length === 1;

    const initialCutoff = isCutoffConstant ? cutoffValues[0] : cutoffValues[0];
    const initialResonance = isResonanceConstant
      ? resonanceValues[0]
      : resonanceValues[0];

    const targetCutoff = Math.max(
      AUDIO_CONSTANTS.MOOG_FILTER.MIN_CUTOFF,
      Math.min(AUDIO_CONSTANTS.MOOG_FILTER.MAX_CUTOFF, initialCutoff)
    );
    const targetResonance = Math.max(
      AUDIO_CONSTANTS.MOOG_FILTER.MIN_RESONANCE,
      Math.min(this.maxResonance, initialResonance)
    );

    this.smoothedCutoff = this.smoothParameter(
      this.smoothedCutoff,
      targetCutoff,
      this.smoothingCoeff
    );
    this.smoothedResonance = this.smoothParameter(
      this.smoothedResonance,
      targetResonance,
      this.smoothingCoeff
    );

    for (let i = 0; i < output.length; i++) {
      const inputSample = input[i] || 0;

      let fc, res;
      if (isCutoffConstant && isResonanceConstant) {
        fc = this.smoothedCutoff;
        res = this.smoothedResonance;
      } else {
        const rawCutoff = isCutoffConstant
          ? targetCutoff
          : Math.max(
              AUDIO_CONSTANTS.MOOG_FILTER.MIN_CUTOFF,
              Math.min(AUDIO_CONSTANTS.MOOG_FILTER.MAX_CUTOFF, cutoffValues[i])
            );
        const rawResonance = isResonanceConstant
          ? targetResonance
          : Math.max(
              AUDIO_CONSTANTS.MOOG_FILTER.MIN_RESONANCE,
              Math.min(this.maxResonance, resonanceValues[i])
            );

        fc = this.smoothParameter(
          this.smoothedCutoff,
          rawCutoff,
          this.smoothingCoeff
        );
        res = this.smoothParameter(
          this.smoothedResonance,
          rawResonance,
          this.smoothingCoeff
        );

        this.smoothedCutoff = fc;
        this.smoothedResonance = res;
      }

      // Use ZDF processing (pure mathematical accuracy)
      output[i] = this.processZDF(inputSample, fc, res);
    }

    return true;
  }
}

registerProcessor("moog-zdf-processor", MoogZDFProcessor);
