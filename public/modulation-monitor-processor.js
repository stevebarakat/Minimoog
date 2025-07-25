// Audio constants for Modulation Monitor Processor
const AUDIO_CONSTANTS = {
  MODULATION_MONITOR: {
    BUFFER_SIZE: 256, // Match the original ScriptProcessor buffer size
  },
};

class ModulationMonitorProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.frameCount = 0;
    this.bufferSize = AUDIO_CONSTANTS.MODULATION_MONITOR.BUFFER_SIZE;
  }

  process(inputs, outputs) {
    const input = inputs[0];
    const output = outputs[0];

    if (input.length > 0) {
      const inputChannel = input[0];

      if (output.length > 0) {
        const outputChannel = output[0];
        for (let i = 0; i < inputChannel.length; i++) {
          outputChannel[i] = inputChannel[i];
        }
      }

      let sum = 0;
      for (let i = 0; i < inputChannel.length; i++) {
        sum += inputChannel[i];
      }
      const avg = sum / inputChannel.length;

      const scaledMod = Math.max(-1, Math.min(1, avg * 0.1));

      this.port.postMessage({ modValue: scaledMod });
    }

    return true;
  }
}

registerProcessor("modulation-monitor-processor", ModulationMonitorProcessor);
