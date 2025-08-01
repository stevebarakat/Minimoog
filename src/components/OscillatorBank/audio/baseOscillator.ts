import { getPooledNode, releaseNode } from "@/utils";

export type BaseOscillatorParams = {
  audioContext: AudioContext;
  waveform: string;
  range: "32" | "16" | "8" | "4" | "2" | "lo";
  gain?: number;
};

export type BaseOscillatorInstance = {
  start: (frequency: number) => void;
  stop: () => void;
  update: (
    params: Partial<Pick<BaseOscillatorParams, "waveform" | "range" | "gain">>
  ) => void;
  getNode: () => OscillatorNode | null;
  getGainNode: () => GainNode;
  setFrequency: (frequency: number) => void;
};

export const rangeToMultiplier: Record<BaseOscillatorParams["range"], number> =
  {
    "32": 0.25,
    "16": 0.5,
    "8": 1,
    "4": 2,
    "2": 4,
    lo: 0.01,
  };

/**
 * Creates a pulse wave with specified duty cycle for custom oscillator waveforms
 * @param {AudioContext} audioContext - The Web Audio API context
 * @param {number} dutyCycle - Duty cycle of the pulse wave (0-1)
 * @returns {PeriodicWave} The generated pulse wave
 */
export function createPulseWave(
  audioContext: AudioContext,
  dutyCycle: number
): PeriodicWave {
  const real = new Float32Array(4096);
  const imag = new Float32Array(4096);
  for (let i = 1; i < 4096; i++) {
    const theta = Math.PI * i * dutyCycle;
    real[i] = (2 / (i * Math.PI)) * Math.sin(theta);
    imag[i] = 0;
  }
  return audioContext.createPeriodicWave(real, imag);
}

/**
 * Creates a base oscillator instance with full lifecycle management
 * Handles oscillator creation, parameter updates, frequency changes, and cleanup
 *
 * @param {BaseOscillatorParams} params - Initial oscillator parameters
 * @param {Function} getCustomWave - Function to generate custom waveforms
 * @param {AudioNode} [mixerNode] - Optional mixer node to connect to (defaults to destination)
 * @returns {BaseOscillatorInstance} Oscillator instance with start/stop/update methods
 */
export function createBaseOscillator(
  params: BaseOscillatorParams,
  getCustomWave: (audioContext: AudioContext, waveform: string) => PeriodicWave,
  mixerNode?: AudioNode
): BaseOscillatorInstance {
  let osc: OscillatorNode | null = null;
  let currentParams = { ...params };
  const gainNode = getPooledNode("gain", params.audioContext) as GainNode;
  gainNode.gain.setValueAtTime(
    params.gain ?? 1,
    params.audioContext.currentTime
  );
  if (mixerNode) {
    gainNode.connect(mixerNode);
  } else {
    gainNode.connect(params.audioContext.destination);
  }

  /**
   * Starts the oscillator with the specified frequency
   * Creates the oscillator node if it doesn't exist and sets up the waveform
   * @param {number} frequency - The frequency in Hz to start the oscillator at
   */
  function start(frequency: number): void {
    if (!osc) {
      osc = getPooledNode("oscillator", params.audioContext) as OscillatorNode;
      let oscType: OscillatorType = "triangle";
      if (currentParams.waveform === "triangle") {
        oscType = "triangle";
      } else if (currentParams.waveform === "sawtooth") {
        oscType = "sawtooth";
      } else if (currentParams.waveform === "pulse1") {
        oscType = "square";
      } else {
        oscType = "custom";
      }
      if (oscType === "custom") {
        osc.setPeriodicWave(
          getCustomWave(params.audioContext, currentParams.waveform)
        );
      } else {
        osc.type = oscType;
      }
      osc.connect(gainNode);
      osc.start();
    }
    setFrequency(frequency);
  }

  /**
   * Sets the oscillator frequency, applying the current range multiplier
   * @param {number} frequency - The base frequency in Hz
   */
  function setFrequency(frequency: number): void {
    if (osc) {
      const freq = frequency * rangeToMultiplier[currentParams.range];
      osc.frequency.setValueAtTime(
        isFinite(freq) ? freq : 440,
        params.audioContext.currentTime
      );
    }
  }

  /**
   * Stops the oscillator and releases it back to the node pool
   */
  function stop(): void {
    if (osc) {
      osc.stop();
      releaseNode(osc);
      osc = null;
    }
  }

  /**
   * Updates oscillator parameters (waveform, range, gain) in real-time
   * @param {Object} newParams - Partial parameters to update
   * @param {string} [newParams.waveform] - New waveform type
   * @param {"32"|"16"|"8"|"4"|"2"|"lo"} [newParams.range] - New frequency range
   * @param {number} [newParams.gain] - New gain value
   */
  function update(
    newParams: Partial<
      Pick<BaseOscillatorParams, "waveform" | "range" | "gain">
    >
  ): void {
    currentParams = { ...currentParams, ...newParams };
    if (osc) {
      let oscType: OscillatorType = "triangle";
      if (currentParams.waveform === "triangle") {
        oscType = "triangle";
      } else if (currentParams.waveform === "sawtooth") {
        oscType = "sawtooth";
      } else if (currentParams.waveform === "pulse1") {
        oscType = "square";
      } else {
        oscType = "custom";
      }
      if (oscType === "custom") {
        osc.setPeriodicWave(
          getCustomWave(params.audioContext, currentParams.waveform)
        );
      } else {
        osc.type = oscType;
      }
    }
    if (typeof newParams.gain === "number") {
      gainNode.gain.setValueAtTime(
        newParams.gain,
        params.audioContext.currentTime
      );
    }
  }

  /**
   * Gets the current oscillator node (may be null if not started)
   * @returns {OscillatorNode | null} The oscillator node or null if not created
   */
  function getNode(): OscillatorNode | null {
    return osc;
  }

  /**
   * Gets the gain node associated with this oscillator
   * @returns {GainNode} The gain node for volume control
   */
  function getGainNode(): GainNode {
    return gainNode;
  }

  return {
    start,
    stop,
    update,
    getNode,
    getGainNode,
    setFrequency,
  };
}
