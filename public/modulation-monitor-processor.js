class ModulationMonitorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.frameCount = 0;
    this.bufferSize = 256; // Match the original ScriptProcessor buffer size
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    if (input.length > 0) {
      const inputChannel = input[0];

      // Copy input to output (pass-through)
      if (output.length > 0) {
        const outputChannel = output[0];
        for (let i = 0; i < inputChannel.length; i++) {
          outputChannel[i] = inputChannel[i];
        }
      }

      // Calculate average modulation value
      let sum = 0;
      for (let i = 0; i < inputChannel.length; i++) {
        sum += inputChannel[i];
      }
      const avg = sum / inputChannel.length;

      // Scale and clamp the modulation value
      const scaledMod = Math.max(-1, Math.min(1, avg * 0.1));

      // Send the modulation value to the main thread
      this.port.postMessage({ modValue: scaledMod });
    }

    return true;
  }
}

registerProcessor("modulation-monitor-processor", ModulationMonitorProcessor);
