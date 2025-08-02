// Audio constants for Moog Hybrid Filter (Best of Both Worlds)
const AUDIO_CONSTANTS = {
  MOOG_FILTER: {
    DEFAULT_CUTOFF: 1000,
    MIN_CUTOFF: 20,
    MAX_CUTOFF: 20000,
    DEFAULT_RESONANCE: 0.5,
    MIN_RESONANCE: 0,
    MAX_RESONANCE: 4.0,
    SMOOTHING_COEFFICIENT: 0.99,
    OVERSAMPLE_FACTOR: 2, // Reduced from 4 for efficiency
    BUFFER_SIZE: 128, // Optimal buffer size for processing
    PARAMETER_UPDATE_RATE: 4, // Update parameters every N samples
    VECTOR_SIZE: 4, // Process 4 samples at once when possible
  },
  // Authentic-style specific constants
  AUTHENTIC_STYLE: {
    FREQUENCY_SCALE: 1.16,
    INPUT_FACTOR_COEFF: 0.35013,
    RESONANCE_FREQ_DEPENDENCE: 0.15,
    POLE_COEFFICIENT: 0.3,
  },
  // ZDF-style constants
  ZDF_STYLE: {
    MAX_WARPED_FREQ_RATIO: 0.45, // 45% of Nyquist
  },
};

// Optimized saturation function using lookup table for better performance
const SATURATION_LOOKUP_SIZE = 1024;
const SATURATION_LOOKUP = new Float32Array(SATURATION_LOOKUP_SIZE);
for (let i = 0; i < SATURATION_LOOKUP_SIZE; i++) {
  const x = (i / (SATURATION_LOOKUP_SIZE - 1)) * 2 - 1; // -1 to 1
  const absX = Math.abs(x);
  if (absX < 0.1) {
    SATURATION_LOOKUP[i] = x;
  } else {
    const sign = x >= 0 ? 1 : -1;
    SATURATION_LOOKUP[i] = sign * (0.1 + 0.9 * Math.tanh((absX - 0.1) * 5));
  }
}

class MoogHybridProcessor extends AudioWorkletProcessor {
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

    // ZDF state variables
    this.stage = [0, 0, 0, 0];
    this.T = 1 / this.sampleRate;
    this.T2 = this.T / 2;

    // Oversampling
    this.oversampleFactor = AUDIO_CONSTANTS.MOOG_FILTER.OVERSAMPLE_FACTOR;

    // Authentic-style state variables (for fallback)
    this.in1 = this.in2 = this.in3 = this.in4 = 0.0;
    this.out1 = this.out2 = this.out3 = this.out4 = 0.0;

    // Efficient buffer processing
    this.bufferSize = AUDIO_CONSTANTS.MOOG_FILTER.BUFFER_SIZE;
    this.parameterUpdateRate =
      AUDIO_CONSTANTS.MOOG_FILTER.PARAMETER_UPDATE_RATE;
    this.sampleCounter = 0;
    this.vectorSize = AUDIO_CONSTANTS.MOOG_FILTER.VECTOR_SIZE;

    // Cached coefficients for efficiency
    this.cachedCoefficients = {
      g: 0,
      g2: 0,
      g3: 0,
      g4: 0,
      k: 0,
      k2: 0,
      k3: 0,
      k4: 0,
      a0: 1,
      a1: 0,
      a2: 0,
      a3: 0,
      a4: 0,
      b0: 1,
      b1: 0,
      b2: 0,
      b3: 0,
      b4: 0,
      lastCutoff: -1,
      lastResonance: -1,
    };

    // Pre-allocated buffers for oversampling and vector processing
    this.oversampleBuffer = new Float32Array(this.oversampleFactor);
    this.tempBuffer = new Float32Array(this.bufferSize);
    this.vectorBuffer = new Float32Array(this.vectorSize);

    // Performance tracking
    this.performanceStats = {
      coefficientUpdates: 0,
      samplesProcessed: 0,
      fallbackCount: 0,
    };
  }

  // Optimized saturation using lookup table
  saturateOptimized(x) {
    const absX = Math.abs(x);
    if (absX >= 1.0) {
      // Handle values outside lookup range
      const sign = x >= 0 ? 1 : -1;
      return sign * (0.1 + 0.9 * Math.tanh((absX - 0.1) * 5));
    }

    // Use lookup table for values in range
    const index = Math.floor(((x + 1) * (SATURATION_LOOKUP_SIZE - 1)) / 2);
    return SATURATION_LOOKUP[
      Math.max(0, Math.min(SATURATION_LOOKUP_SIZE - 1, index))
    ];
  }

  // ZDF frequency warping for bilinear transform
  prewarpFrequency(fc) {
    const omega = 2 * Math.PI * fc;
    const tanOmegaT2 = Math.tan(omega * this.T2);
    let warped = (2 / this.T) * tanOmegaT2;

    // Clamp to prevent instability
    const nyquist = this.sampleRate / 2;
    const maxWarped = AUDIO_CONSTANTS.ZDF_STYLE.MAX_WARPED_FREQ_RATIO * nyquist;
    if (warped > maxWarped) warped = maxWarped;

    return warped;
  }

  // Authentic-style frequency scaling
  scaleFrequencyAuthentic(fc) {
    const normalizedFreq = fc / 20000;
    return (
      normalizedFreq * AUDIO_CONSTANTS.AUTHENTIC_STYLE.FREQUENCY_SCALE * 3.0
    );
  }

  // Smooth parameter changes to prevent artifacts
  smoothParameter(current, target, coeff) {
    return current * coeff + target * (1 - coeff);
  }

  // Update cached coefficients only when parameters change
  updateCoefficients(fc, res) {
    // Check if parameters have changed significantly
    const cutoffChanged =
      Math.abs(fc - this.cachedCoefficients.lastCutoff) > 0.1;
    const resonanceChanged =
      Math.abs(res - this.cachedCoefficients.lastResonance) > 0.01;

    if (!cutoffChanged && !resonanceChanged) {
      return; // Use cached coefficients
    }

    this.performanceStats.coefficientUpdates++;

    // Update cached values
    this.cachedCoefficients.lastCutoff = fc;
    this.cachedCoefficients.lastResonance = res;

    // Use ZDF for mathematical accuracy
    const warpedFreq = this.prewarpFrequency(fc);

    // Simplified resonance mapping (not as complex as pure ZDF)
    let resonance = res;
    if (res > 2.4) {
      // Simple curve for high resonance
      const excess = res - 2.4;
      const range = 4.0 - 2.4;
      const normalizedExcess = excess / range;
      resonance = 2.4 + range * Math.pow(normalizedExcess, 0.8);
    }

    // Cache ZDF filter coefficients
    const g = warpedFreq * this.T2;
    const g2 = g * g;
    const g3 = g2 * g;
    const g4 = g3 * g;

    // Resonance feedback
    const k = resonance * 4;
    const k2 = k * k;
    const k3 = k2 * k;
    const k4 = k3 * k;

    // Cache ZDF filter equations
    this.cachedCoefficients.g = g;
    this.cachedCoefficients.g2 = g2;
    this.cachedCoefficients.g3 = g3;
    this.cachedCoefficients.g4 = g4;
    this.cachedCoefficients.k = k;
    this.cachedCoefficients.k2 = k2;
    this.cachedCoefficients.k3 = k3;
    this.cachedCoefficients.k4 = k4;

    this.cachedCoefficients.a0 = 1 + g;
    this.cachedCoefficients.a1 = -4 * g;
    this.cachedCoefficients.a2 = 6 * g2;
    this.cachedCoefficients.a3 = -4 * g3;
    this.cachedCoefficients.a4 = g4;

    this.cachedCoefficients.b0 = 1 + k * g + k2 * g2 + k3 * g3 + k4 * g4;
    this.cachedCoefficients.b1 =
      -4 * g - 4 * k * g2 - 4 * k2 * g3 - 4 * k3 * g4;
    this.cachedCoefficients.b2 = 6 * g2 + 6 * k * g3 + 6 * k2 * g4;
    this.cachedCoefficients.b3 = -4 * g3 - 4 * k * g4;
    this.cachedCoefficients.b4 = g4;
  }

  // Efficient single sample processing using cached coefficients
  processSampleEfficient(inputSample) {
    const coeff = this.cachedCoefficients;

    // Oversampling for better quality
    let output = 0;
    for (let os = 0; os < this.oversampleFactor; os++) {
      // Process sample using cached coefficients
      const input = inputSample / this.oversampleFactor;
      const outputSample =
        (coeff.b0 * input +
          coeff.b1 * this.stage[0] +
          coeff.b2 * this.stage[1] +
          coeff.b3 * this.stage[2] +
          coeff.b4 * this.stage[3]) /
        coeff.a0;

      // Update state efficiently
      this.stage[3] = this.stage[2];
      this.stage[2] = this.stage[1];
      this.stage[1] = this.stage[0];
      this.stage[0] = outputSample;

      output += outputSample;
    }

    // Average oversampled output
    output /= this.oversampleFactor;

    // Apply optimized saturation for character
    const saturated = this.saturateOptimized(output);

    // Add slight boost for authentic character (like original)
    return saturated * 1.1;
  }

  // Vector processing for multiple samples (SIMD-like optimization)
  processVectorEfficient(inputSamples, outputSamples, count) {
    const coeff = this.cachedCoefficients;

    for (let i = 0; i < count; i++) {
      const inputSample = inputSamples[i];

      // Oversampling for better quality
      let output = 0;
      for (let os = 0; os < this.oversampleFactor; os++) {
        const input = inputSample / this.oversampleFactor;
        const outputSample =
          (coeff.b0 * input +
            coeff.b1 * this.stage[0] +
            coeff.b2 * this.stage[1] +
            coeff.b3 * this.stage[2] +
            coeff.b4 * this.stage[3]) /
          coeff.a0;

        // Update state efficiently
        this.stage[3] = this.stage[2];
        this.stage[2] = this.stage[1];
        this.stage[1] = this.stage[0];
        this.stage[0] = outputSample;

        output += outputSample;
      }

      output /= this.oversampleFactor;
      const saturated = this.saturateOptimized(output);
      outputSamples[i] = saturated * 1.1;
    }
  }

  // Fallback to authentic processing if ZDF becomes unstable
  processAuthentic(inputSample, fc, res) {
    const f = this.scaleFrequencyAuthentic(fc);
    const inputFactor =
      AUDIO_CONSTANTS.AUTHENTIC_STYLE.INPUT_FACTOR_COEFF * (f * f) * (f * f);

    const fb =
      res *
      (1.0 - AUDIO_CONSTANTS.AUTHENTIC_STYLE.RESONANCE_FREQ_DEPENDENCE * f * f);

    const processedInput = (inputSample - this.out4 * fb) * inputFactor;

    // 4-pole ladder filter
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

    const saturated = this.saturateOptimized(this.out4);
    return saturated * 1.2;
  }

  // Efficient buffer processing with vector optimizations
  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || !input[0]) return true;

    const inputChannel = input[0];
    const outputChannel = output[0];
    const bufferLength = inputChannel.length;

    // Get current parameter values (only once per buffer)
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

    // Update coefficients only when needed
    this.updateCoefficients(this.smoothedCutoff, this.smoothedResonance);

    // Process samples with vector optimization when possible
    let i = 0;
    while (i < bufferLength) {
      const remainingSamples = bufferLength - i;
      const vectorCount = Math.min(this.vectorSize, remainingSamples);

      if (vectorCount === this.vectorSize) {
        // Use vector processing for full vectors
        for (let j = 0; j < vectorCount; j++) {
          this.vectorBuffer[j] = inputChannel[i + j];
        }

        this.processVectorEfficient(
          this.vectorBuffer,
          this.tempBuffer,
          vectorCount
        );

        for (let j = 0; j < vectorCount; j++) {
          const processedSample = this.tempBuffer[j];

          // Debug logging for invalid or extreme values
          if (
            !isFinite(processedSample) ||
            Math.abs(processedSample) > 1e6 ||
            isNaN(processedSample)
          ) {
            this.performanceStats.fallbackCount++;
            // Fallback to authentic processing if ZDF fails
            outputChannel[i + j] = this.processAuthentic(
              inputChannel[i + j],
              this.smoothedCutoff,
              this.smoothedResonance
            );
          } else {
            outputChannel[i + j] = processedSample;
          }
        }
      } else {
        // Process remaining samples individually
        for (let j = 0; j < vectorCount; j++) {
          const inputSample = inputChannel[i + j];
          const processedSample = this.processSampleEfficient(inputSample);

          // Debug logging for invalid or extreme values
          if (
            !isFinite(processedSample) ||
            Math.abs(processedSample) > 1e6 ||
            isNaN(processedSample)
          ) {
            this.performanceStats.fallbackCount++;
            // Fallback to authentic processing if ZDF fails
            outputChannel[i + j] = this.processAuthentic(
              inputSample,
              this.smoothedCutoff,
              this.smoothedResonance
            );
          } else {
            outputChannel[i + j] = processedSample;
          }
        }
      }

      i += vectorCount;
    }

    this.performanceStats.samplesProcessed += bufferLength;

    return true;
  }
}

registerProcessor("moog-hybrid-processor", MoogHybridProcessor);
