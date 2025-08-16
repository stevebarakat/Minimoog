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
  getRangeMultiplier: () => number;
  cleanup: () => void;
};

export const rangeToMultiplier: Record<BaseOscillatorParams["range"], number> =
  {
    "32": 0.25,
    "16": 0.5,
    "8": 1,
    "4": 2,
    "2": 4,
    lo: 0.5, // Low frequency range, same as 16'
  };

/**
 * Creates a pulse wave with specified duty cycle for custom oscillator waveforms
 * Enhanced with Minimoog-style warmth and analog characteristics
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
    let harmonic = (2 / (i * Math.PI)) * Math.sin(theta);

    // Add more aggressive saturation to higher harmonics for buzz
    if (i > 8) {
      const saturationAmount = Math.min(0.2, 1 / (i * 0.05));
      harmonic *= 1 + saturationAmount * Math.tanh(harmonic * 4);
    }

    // Enhance specific harmonics that contribute to Minimoog buzz character
    if (i === 2) harmonic *= 1.35; // Strong 2nd harmonic for warmth
    if (i === 3) harmonic *= 1.45; // Strong 3rd harmonic for buzz
    if (i === 5) harmonic *= 1.3; // 5th harmonic
    if (i === 7) harmonic *= 1.25; // 7th harmonic
    if (i === 9) harmonic *= 1.15; // 9th harmonic

    // Add more aggressive even harmonic content for warmth
    if (i % 2 === 0 && i <= 25) {
      const evenBoost = 0.12 / Math.sqrt(i);
      harmonic += evenBoost * Math.sin(theta * 0.5);
    }

    // Add subtle intermodulation for analog character
    if (i > 3 && i <= 15) {
      harmonic += (0.03 * Math.sin(theta * 1.5)) / i;
    }

    real[i] = harmonic;
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
  let currentFrequency = 440; // Store current frequency for drift
  let baseFrequency: number | null = null; // Store the base frequency (without range multiplier)

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
      // Create oscillator directly - they're single-use and can't be pooled
      osc = params.audioContext.createOscillator();
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

      // Drift disabled for now to prevent noise issues
      // startDrift();
    }
    setFrequency(frequency);
  }

  /**
   * Sets the oscillator frequency, applying the current range multiplier
   * @param {number} frequency - The base frequency in Hz
   */
  function setFrequency(frequency: number): void {
    if (osc) {
      baseFrequency = frequency; // Store the base frequency
      const multiplier = rangeToMultiplier[currentParams.range];
      const freq = frequency * multiplier;
      currentFrequency = isFinite(freq) ? freq : 440; // Store for drift

      osc.frequency.setValueAtTime(
        currentFrequency,
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
      // Don't release oscillator to pool - they're single-use only
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
    const oldRange = currentParams.range;
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

      // If range changed, reapply current frequency with new range multiplier
      if (newParams.range && newParams.range !== oldRange && baseFrequency) {
        setFrequency(baseFrequency); // Use stored base frequency
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

  /**
   * Gets the current range multiplier
   * @returns {number} The current range multiplier
   */
  function getRangeMultiplier(): number {
    return rangeToMultiplier[currentParams.range];
  }

  /**
   * Cleanup function to release the gain node back to the pool
   */
  function cleanup(): void {
    if (osc) {
      osc.stop();
      osc = null;
    }
    releaseNode(gainNode);
  }

  return {
    start,
    stop,
    update,
    getNode,
    getGainNode,
    setFrequency,
    getRangeMultiplier,
    cleanup,
  };
}
