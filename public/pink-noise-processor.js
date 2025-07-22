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

  process(inputs, outputs) {
    const output = outputs[0];
    const channel = output[0];

    for (let i = 0; i < channel.length; i++) {
      const white = Math.random() * 2 - 1;
      this.b0 = 0.99886 * this.b0 + white * 0.0555179;
      this.b1 = 0.99332 * this.b1 + white * 0.0750759;
      this.b2 = 0.969 * this.b2 + white * 0.153852;
      this.b3 = 0.8665 * this.b3 + white * 0.3104856;
      this.b4 = 0.55 * this.b4 + white * 0.5329522;
      this.b5 = -0.7616 * this.b5 - white * 0.016898;
      const b6 = white * 0.5362;
      channel[i] =
        (this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + b6) * 0.11;
    }

    return true;
  }
}

registerProcessor("pink-noise-processor", PinkNoiseProcessor);
