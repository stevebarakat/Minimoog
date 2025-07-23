// Audio constants for Delay Processor
const AUDIO_CONSTANTS = {
  DELAY: {
    DEFAULT_TIME: 0.3, // 300ms
    MIN_TIME: 0.001,
    MAX_TIME: 1.0,
    DEFAULT_FEEDBACK: 0.3, // 30%
    MIN_FEEDBACK: 0.0,
    MAX_FEEDBACK: 0.9,
    DEFAULT_MIX: 0.2, // 20%
    MIN_MIX: 0.0,
    MAX_MIX: 1.0,
  },
};

class DelayProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.buffer = [];
    this.bufferSize = 0;
    this.writeIndex = 0;
    this.readIndex = 0;
    this.delayTime = AUDIO_CONSTANTS.DELAY.DEFAULT_TIME;
    this.feedback = AUDIO_CONSTANTS.DELAY.DEFAULT_FEEDBACK;
    this.mix = AUDIO_CONSTANTS.DELAY.DEFAULT_MIX;
  }

  static get parameterDescriptors() {
    return [
      {
        name: "delayTime",
        defaultValue: AUDIO_CONSTANTS.DELAY.DEFAULT_TIME,
        minValue: AUDIO_CONSTANTS.DELAY.MIN_TIME,
        maxValue: AUDIO_CONSTANTS.DELAY.MAX_TIME,
      },
      {
        name: "feedback",
        defaultValue: AUDIO_CONSTANTS.DELAY.DEFAULT_FEEDBACK,
        minValue: AUDIO_CONSTANTS.DELAY.MIN_FEEDBACK,
        maxValue: AUDIO_CONSTANTS.DELAY.MAX_FEEDBACK,
      },
      {
        name: "mix",
        defaultValue: AUDIO_CONSTANTS.DELAY.DEFAULT_MIX,
        minValue: AUDIO_CONSTANTS.DELAY.MIN_MIX,
        maxValue: AUDIO_CONSTANTS.DELAY.MAX_MIX,
      },
    ];
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    const output = outputs[0];

    if (!input || !input[0]) return true;

    const inputChannel = input[0];
    const outputChannel = output[0];

    const currentDelayTime = parameters.delayTime[0] || this.delayTime;
    const currentFeedback = parameters.feedback[0] || this.feedback;
    const currentMix = parameters.mix[0] || this.mix;

    const newBufferSize = Math.floor(currentDelayTime * sampleRate);

    if (newBufferSize !== this.bufferSize) {
      this.bufferSize = newBufferSize;
      this.buffer = new Float32Array(this.bufferSize);
      this.writeIndex = 0;
      this.readIndex = 0;
    }

    for (let i = 0; i < inputChannel.length; i++) {
      const inputSample = inputChannel[i];

      const delayedSample = this.buffer[this.readIndex] || 0;

      const drySignal = inputSample * (1 - currentMix);
      const wetSignal = delayedSample * currentMix;
      outputChannel[i] = drySignal + wetSignal;

      this.buffer[this.writeIndex] =
        inputSample + delayedSample * currentFeedback;

      this.writeIndex = (this.writeIndex + 1) % this.bufferSize;
      this.readIndex = (this.readIndex + 1) % this.bufferSize;
    }

    return true;
  }
}

registerProcessor("delay-processor", DelayProcessor);
