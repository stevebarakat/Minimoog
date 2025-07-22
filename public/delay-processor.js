class DelayProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.bufferSize = 0;
    this.writeIndex = 0;
    this.readIndex = 0;
    this.delayTime = 0.3; // 300ms default
    this.feedback = 0.3; // 30% feedback default
    this.mix = 0.2; // 20% wet signal default
  }

  static get parameterDescriptors() {
    return [
      {
        name: "delayTime",
        defaultValue: 0.3,
        minValue: 0.001,
        maxValue: 1.0,
      },
      {
        name: "feedback",
        defaultValue: 0.3,
        minValue: 0.0,
        maxValue: 0.9,
      },
      {
        name: "mix",
        defaultValue: 0.2,
        minValue: 0.0,
        maxValue: 1.0,
      },
    ];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || !input[0]) return true;

    const inputChannel = input[0];
    const outputChannel = output[0];

    // Get current parameter values
    const currentDelayTime = parameters.delayTime[0] || this.delayTime;
    const currentFeedback = parameters.feedback[0] || this.feedback;
    const currentMix = parameters.mix[0] || this.mix;

    // Calculate buffer size based on delay time
    const newBufferSize = Math.floor(currentDelayTime * sampleRate);

    // Resize buffer if needed
    if (newBufferSize !== this.bufferSize) {
      this.bufferSize = newBufferSize;
      this.buffer = new Float32Array(this.bufferSize);
      this.writeIndex = 0;
      this.readIndex = 0;
    }

    for (let i = 0; i < inputChannel.length; i++) {
      const inputSample = inputChannel[i];

      // Read from delay buffer
      const delayedSample = this.buffer[this.readIndex] || 0;

      // Calculate output (dry + wet)
      const drySignal = inputSample * (1 - currentMix);
      const wetSignal = delayedSample * currentMix;
      outputChannel[i] = drySignal + wetSignal;

      // Write to delay buffer with feedback
      this.buffer[this.writeIndex] =
        inputSample + delayedSample * currentFeedback;

      // Update indices
      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
      this.readIndex = (this.readIndex + 1) % this.bufferSize;
    }

    return true;
  }
}

registerProcessor("delay-processor", DelayProcessor);
