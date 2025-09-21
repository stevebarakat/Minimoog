class DelayProcessor extends AudioWorkletProcessor {
  constructor(options) {
    super();

    // Initialize delay buffer
    this.bufferSize = 44100 * 2; // 2 seconds max delay
    this.delayBuffer = new Float32Array(this.bufferSize);
    this.writeIndex = 0;
    this.readIndex = 0;

    // Default parameters
    this.delayTime = options.delayTime || 0.1; // seconds
    this.feedback = options.feedback || 0.3; // 0-1
    this.wetLevel = options.wetLevel || 0.5; // 0-1
    this.dryLevel = options.dryLevel || 0.5; // 0-1
    this.enabled = options.enabled !== false;

    // Calculate read index offset
    this.updateReadIndex();
  }

  updateReadIndex() {
    const delaySamples = Math.floor(this.delayTime * sampleRate);
    this.readIndex =
      (this.writeIndex - delaySamples + this.bufferSize) % this.bufferSize;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || !input[0] || !output || !output[0]) {
      return true;
    }

    const inputChannel = input[0];
    const outputChannel = output[0];

    // Get current parameter values
    const currentDelayTime = parameters.delayTime
      ? parameters.delayTime[0]
      : this.delayTime;
    const currentFeedback = parameters.feedback
      ? parameters.feedback[0]
      : this.feedback;
    const currentWetLevel = parameters.wetLevel
      ? parameters.wetLevel[0]
      : this.wetLevel;
    const currentDryLevel = parameters.dryLevel
      ? parameters.dryLevel[0]
      : this.dryLevel;
    const currentEnabled = parameters.enabled
      ? parameters.enabled[0] > 0
      : this.enabled;

    // Update delay time if changed
    if (currentDelayTime !== this.delayTime) {
      this.delayTime = currentDelayTime;
      this.updateReadIndex();
    }

    // Update other parameters
    this.feedback = currentFeedback;
    this.wetLevel = currentWetLevel;
    this.dryLevel = currentDryLevel;
    this.enabled = currentEnabled;

    for (let i = 0; i < inputChannel.length; i++) {
      const inputSample = inputChannel[i];

      if (this.enabled) {
        // Read delayed sample
        const delayedSample = this.delayBuffer[this.readIndex];

        // Mix input with feedback
        const feedbackSample = inputSample + delayedSample * this.feedback;

        // Write to delay buffer
        this.delayBuffer[this.writeIndex] = feedbackSample;

        // Mix dry and wet signals
        const drySignal = inputSample * this.dryLevel;
        const wetSignal = delayedSample * this.wetLevel;
        outputChannel[i] = drySignal + wetSignal;

        // Update indices
        this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
        this.readIndex = (this.readIndex + 1) % this.bufferSize;
      } else {
        // Bypass mode - just pass through input
        outputChannel[i] = inputSample;
      }
    }

    return true;
  }

  static get parameterDescriptors() {
    return [
      {
        name: "delayTime",
        defaultValue: 0.1,
        minValue: 0.001,
        maxValue: 2.0,
        automationRate: "k-rate",
      },
      {
        name: "feedback",
        defaultValue: 0.3,
        minValue: 0.0,
        maxValue: 0.95,
        automationRate: "k-rate",
      },
      {
        name: "wetLevel",
        defaultValue: 0.5,
        minValue: 0.0,
        maxValue: 1.0,
        automationRate: "k-rate",
      },
      {
        name: "dryLevel",
        defaultValue: 0.5,
        minValue: 0.0,
        maxValue: 1.0,
        automationRate: "k-rate",
      },
      {
        name: "enabled",
        defaultValue: 1,
        minValue: 0,
        maxValue: 1,
        automationRate: "k-rate",
      },
    ];
  }
}

registerProcessor("delay-processor", DelayProcessor);
