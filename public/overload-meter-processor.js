class OverloadMeterProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.lastOverload = false;
  }

  process(inputs, outputs, parameters) {
    const input = inputs[0];
    if (!input || !input[0]) return true;
    const channel = input[0];
    let overload = false;
    for (let i = 0; i < channel.length; i++) {
      if (Math.abs(channel[i]) > 0.9) {
        overload = true;
        break;
      }
    }
    if (overload !== this.lastOverload) {
      this.port.postMessage({ overload });
      this.lastOverload = overload;
    }
    return true;
  }
}

registerProcessor("overload-meter-processor", OverloadMeterProcessor);
