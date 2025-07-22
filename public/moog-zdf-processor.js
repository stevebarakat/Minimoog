class MoogZDFProcessor extends AudioWorkletProcessor {
  static get parameterDescriptors() {
    return [
      {
        name: "cutoff",
        defaultValue: 1000,
        minValue: 20, // Practical lower limit for digital audio
        maxValue: 20000, // Practical upper limit for digital audio
        automationRate: "k-rate",
      },
      {
        name: "resonance",
        defaultValue: 0.5,
        minValue: 0,
        maxValue: 4,
        automationRate: "k-rate",
      },
    ];
  }

  constructor() {
    super();
    // Filter states for the 4-pole ladder filter
    this.stage = [0, 0, 0, 0];
    this.sampleRate = sampleRate;

    // Parameter smoothing to prevent zipper noise
    this.smoothedCutoff = 1000;
    this.smoothedResonance = 0.5;
    this.smoothingCoeff = 0.99; // Adjust for faster/slower smoothing

    // Pre-compute constants
    this.T = 1 / this.sampleRate;
    this.T2 = this.T / 2;

    // Oversampling factor - increased for better quality
    this.oversampleFactor = 4; // Increased from 2x to 4x for better quality

    // Safety limits - more authentic to original
    this.maxResonance = 4.0; // Allow full self-oscillation like original

    // Original Minimoog characteristics
    this.temperatureDrift = 0.001; // Simulate component temperature variations
    this.componentTolerance = 0.005; // Simulate component tolerances
    this.thermalNoise = 0.0001; // Subtle thermal noise for authenticity
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

    // Optimize parameter access - only check length once per buffer
    const cutoffValues = parameters.cutoff;
    const resonanceValues = parameters.resonance;
    const isCutoffConstant = cutoffValues.length === 1;
    const isResonanceConstant = resonanceValues.length === 1;

    // Get initial values with validation - use original Minimoog range
    const initialCutoff = isCutoffConstant ? cutoffValues[0] : cutoffValues[0];
    const initialResonance = isResonanceConstant
      ? resonanceValues[0]
      : resonanceValues[0];

    // Validate and smooth parameters - practical digital audio range
    const targetCutoff = Math.max(20, Math.min(20000, initialCutoff));
    const targetResonance = Math.max(
      0,
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

      // Get current parameter values (handle both constant and variable rates)
      let fc, res;
      if (isCutoffConstant && isResonanceConstant) {
        fc = this.smoothedCutoff;
        res = this.smoothedResonance;
      } else {
        const rawCutoff = isCutoffConstant
          ? targetCutoff
          : Math.max(20, Math.min(20000, cutoffValues[i]));
        const rawResonance = isResonanceConstant
          ? targetResonance
          : Math.max(0, Math.min(this.maxResonance, resonanceValues[i]));

        // Apply smoothing for variable rate parameters
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

        // Update smoothed values for next iteration
        this.smoothedCutoff = fc;
        this.smoothedResonance = res;
      }

      // Compute filter coefficient if needed
      const currentG = G !== null ? G : this.prewarpFrequency(fc);

      // Authentic to original Minimoog emphasis behavior
      // Apply non-linear curve to resonance for more musical control
      let resonanceValue;

      if (res < 2.4) {
        // Linear mapping for lower values (0-2.4 resonance = 0-2.4 feedback)
        resonanceValue = res;
      } else if (res < 3.4) {
        // Curved mapping for middle values (2.4-3.4 resonance = 2.4-3.2 feedback)
        const remaining = res - 2.4;
        const curve = Math.pow(remaining / 1.0, 1.2);
        resonanceValue = 2.4 + curve * 0.8;
      } else {
        // Steep curve for self-oscillation (3.4-4.0 resonance = 3.2-4.0 feedback)
        const remaining = res - 3.4;
        const steepCurve = Math.pow(remaining / 0.6, 0.8);
        resonanceValue = 3.2 + steepCurve * 0.8;
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

        // Four cascaded one-pole filters (Topology-Preserving Transform)
        // This implements the classic Moog ladder filter structure
        // Each stage has slightly different characteristics for authenticity
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

        // Update input for next oversample iteration
        if (oversample < this.oversampleFactor - 1) {
          oversampledInput = inputSample - resonanceValue * this.stage[3];
        }
      }

      // Output is the last stage with final saturation and analog characteristics
      output[i] = this.saturate(this.addAnalogCharacteristics(this.stage[3]));
    }

    return true;
  }
}

registerProcessor("moog-zdf-processor", MoogZDFProcessor);
