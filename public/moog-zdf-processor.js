// Audio constants for Moog ZDF Filter
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
      // Hard clipping region - more aggressive than before
      const sign = x >= 0 ? 1 : -1;
      return sign * (0.85 + 0.15 * Math.tanh((absX - 0.8) * 2));
    }
  }

  // Optimized frequency warping for bilinear transform
  prewarpFrequency(fc) {
    const wd = 2 * Math.PI * fc;
    const wa = (2 / this.T) * Math.tan(wd * this.T2);
    return (wa * this.T2) / (1.0 + wa * this.T2);
  }

  // Smooth parameter changes to prevent audio artifacts
  smoothParameter(current, target, coeff) {
    return current * coeff + target * (1 - coeff);
  }

  // Add subtle analog characteristics
  addAnalogCharacteristics(value) {
    // Add thermal noise
    const noise = (Math.random() - 0.5) * this.thermalNoise;

    // Add temperature drift simulation
    this.temperatureDrift += (Math.random() - 0.5) * 0.0001;
    this.temperatureDrift = Math.max(
      -0.01,
      Math.min(0.01, this.temperatureDrift)
    );

    // Add component tolerance variations
    const tolerance = (Math.random() - 0.5) * this.componentTolerance;

    return value + noise + this.temperatureDrift + tolerance;
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

    // Pre-compute filter coefficient if parameters are constant
    let G = null;
    if (isCutoffConstant && isResonanceConstant) {
      G = this.prewarpFrequency(this.smoothedCutoff);
    }

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

      const currentG = G !== null ? G : this.prewarpFrequency(fc);
      let resonanceValue;

      if (res < AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.LINEAR_THRESHOLD) {
        // Linear mapping for lower values (0-2.4 resonance = 0-2.4 feedback)
        resonanceValue = res;
      } else if (
        res < AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.CURVED_THRESHOLD
      ) {
        // Curved mapping for middle values (2.4-3.4 resonance = 2.4-3.2 feedback)
        const remaining =
          res - AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.LINEAR_THRESHOLD;
        const curve = Math.pow(
          remaining / 1.0,
          AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.CURVE_POWER
        );
        resonanceValue =
          AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.LINEAR_THRESHOLD +
          curve *
            AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.LINEAR_FEEDBACK_RANGE;
      } else {
        // Steep curve for self-oscillation (3.4-4.0 resonance = 3.2-4.0 feedback)
        const remaining =
          res - AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.CURVED_THRESHOLD;
        const steepCurve = Math.pow(
          remaining / 0.6,
          AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.STEEP_CURVE_POWER
        );
        resonanceValue =
          3.2 +
          steepCurve *
            AUDIO_CONSTANTS.FILTER_MAPPING.RESONANCE.STEEP_FEEDBACK_RANGE;
      }

      const feedback = resonanceValue * this.stage[3];

      // Apply oversampling for better audio quality
      let oversampledInput = inputSample - feedback;

      for (
        let oversample = 0;
        oversample < this.oversampleFactor;
        oversample++
      ) {
        // Apply saturation to input with analog characteristics
        const x = this.saturate(
          this.addAnalogCharacteristics(oversampledInput)
        );

        this.stage[0] += currentG * (x - this.stage[0]);
        this.stage[1] +=
          currentG *
          (this.saturate(this.addAnalogCharacteristics(this.stage[0])) -
            this.stage[1]);
        this.stage[2] +=
          currentG *
          (this.saturate(this.addAnalogCharacteristics(this.stage[1])) -
            this.stage[2]);
        this.stage[3] +=
          currentG *
          (this.saturate(this.addAnalogCharacteristics(this.stage[2])) -
            this.stage[3]);

        if (oversample < this.oversampleFactor - 1) {
          oversampledInput = inputSample - resonanceValue * this.stage[3];
        }
      }

      output[i] = this.saturate(this.addAnalogCharacteristics(this.stage[3]));
    }

    return true;
  }
}

registerProcessor("moog-zdf-processor", MoogZDFProcessor);
