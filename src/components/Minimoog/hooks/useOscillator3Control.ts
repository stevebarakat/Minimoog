import { useEffect, useRef, useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";
import { rangeToMultiplier } from "@/components/OscillatorBank/audio/baseOscillator";
import type { UseOscillatorResult } from "@/types";

/**
 * Hook that manages OSC 3 special control behavior
 * When OSC 3 Control is OFF, OSC 3 runs free and can be used as a modulation source
 * with expanded frequency range
 */
export function useOscillator3Control(
  audioContext: AudioContext | null,
  osc3: UseOscillatorResult | null,
  mixerNode?: AudioNode | null
) {
  const osc3Control = useSynthStore((state) => state.osc3Control);
  const oscillator3 = useSynthStore((state) => state.oscillator3);
  const freeRunningOscRef = useRef<OscillatorNode | null>(null);
  const freeRunningGainRef = useRef<GainNode | null>(null);

  // Calculate base frequency for free-running OSC 3
  const calculateFreeRunningFrequency = useCallback(() => {
    // When released from keyboard control, OSC 3 has expanded frequency range
    // For modulation purposes, we want lower frequencies that are more suitable for LFO-like effects
    const baseFreq = 20; // Start with 20Hz as base for modulation
    const rangeMultiplier = rangeToMultiplier[oscillator3.range] || 1;

    // Expand frequency range: -7 to +7 semitones becomes wider range
    // Map -7 to +7 to give a good range for modulation (0.1Hz to 100Hz)
    const frequencyMultiplier = Math.pow(2, oscillator3.frequency / 1.5); // Wider range than keyboard control

    return Math.max(
      0.1,
      Math.min(100, baseFreq * rangeMultiplier * frequencyMultiplier)
    );
  }, [oscillator3.frequency, oscillator3.range]);

  // Always run a free-running oscillator for modulation purposes
  // When OSC 3 Control is ON, it follows keyboard control but still provides modulation
  // When OSC 3 Control is OFF, it runs completely free for modulation
  useEffect(() => {
    if (!audioContext) {
      // Clean up when no audio context
      if (freeRunningOscRef.current) {
        try {
          freeRunningOscRef.current.stop();
          freeRunningOscRef.current.disconnect();
        } catch {
          // Ignore cleanup errors
        }
        freeRunningOscRef.current = null;
      }
      if (freeRunningGainRef.current) {
        try {
          freeRunningGainRef.current.disconnect();
        } catch {
          // Ignore cleanup errors
        }
        freeRunningGainRef.current = null;
      }
      return;
    }

    // Always create a free-running oscillator for modulation
    try {
      // Create free-running oscillator
      const freeOsc = audioContext.createOscillator();

      // Set waveform based on OSC 3 settings
      let waveType: OscillatorType = "triangle";
      switch (oscillator3.waveform) {
        case "sawtooth":
          waveType = "sawtooth";
          break;
        case "square":
          waveType = "square";
          break;
        case "triangle":
          waveType = "triangle";
          break;
        default:
          waveType = "triangle";
      }
      freeOsc.type = waveType;

      // Set frequency
      const frequency = calculateFreeRunningFrequency();
      freeOsc.frequency.setValueAtTime(frequency, audioContext.currentTime);

      // Create gain node for volume control
      const gainNode = audioContext.createGain();

      // For modulation: OSC 3 is always available as modulation source
      // Only connect to mixer when OSC 3 Control is OFF and it's enabled in mixer
      const shouldConnectToMixer = !osc3Control && oscillator3.enabled;
      const volume = shouldConnectToMixer ? oscillator3.volume / 10 : 0;
      gainNode.gain.setValueAtTime(volume, audioContext.currentTime);

      // Connect to mixer only if it should be audible
      freeOsc.connect(gainNode);
      if (shouldConnectToMixer) {
        if (mixerNode) {
          gainNode.connect(mixerNode);
        } else {
          gainNode.connect(audioContext.destination);
        }
      }

      // Start the oscillator
      freeOsc.start();

      freeRunningOscRef.current = freeOsc;
      freeRunningGainRef.current = gainNode;
    } catch (error) {
      console.error("Error creating free-running OSC 3:", error);
    }

    // Cleanup function
    return () => {
      if (freeRunningOscRef.current) {
        try {
          freeRunningOscRef.current.stop();
          freeRunningOscRef.current.disconnect();
        } catch {
          // Ignore cleanup errors
        }
        freeRunningOscRef.current = null;
      }
      if (freeRunningGainRef.current) {
        try {
          freeRunningGainRef.current.disconnect();
        } catch {
          // Ignore cleanup errors
        }
        freeRunningGainRef.current = null;
      }
    };
  }, [
    audioContext,
    osc3Control,
    oscillator3.waveform,
    oscillator3.enabled,
    oscillator3.volume,
    calculateFreeRunningFrequency,
    mixerNode,
  ]);

  // Update frequency when parameters change
  useEffect(() => {
    if (freeRunningOscRef.current) {
      const frequency = calculateFreeRunningFrequency();
      freeRunningOscRef.current.frequency.setValueAtTime(
        frequency,
        audioContext?.currentTime || 0
      );
    }
  }, [
    calculateFreeRunningFrequency,
    audioContext,
    oscillator3.range,
    oscillator3.frequency,
  ]);

  // Update waveform when it changes
  // Update waveform when it changes
  useEffect(() => {
    if (freeRunningOscRef.current) {
      let waveType: OscillatorType = "triangle";
      switch (oscillator3.waveform) {
        case "sawtooth":
          waveType = "sawtooth";
          break;
        case "square":
        case "pulse1":
        case "pulse2":
        case "pulse3":
          waveType = "square";
          break;
        case "triangle":
        default:
          waveType = "triangle";
          break;
      }
      freeRunningOscRef.current.type = waveType;
    }
  }, [oscillator3.waveform]);

  // Update volume and mixer connection when parameters change
  useEffect(() => {
    if (freeRunningGainRef.current && audioContext) {
      const shouldConnectToMixer = !osc3Control && oscillator3.enabled;
      const volume = shouldConnectToMixer ? oscillator3.volume / 10 : 0;

      // Update volume
      freeRunningGainRef.current.gain.setValueAtTime(
        volume,
        audioContext.currentTime
      );

      // Update mixer connection - disconnect and reconnect if needed
      try {
        freeRunningGainRef.current.disconnect();
        if (shouldConnectToMixer) {
          if (mixerNode) {
            freeRunningGainRef.current.connect(mixerNode);
          } else {
            freeRunningGainRef.current.connect(audioContext.destination);
          }
        }
      } catch {
        // Ignore connection errors
      }
    }
  }, [
    oscillator3.volume,
    oscillator3.enabled,
    osc3Control,
    audioContext,
    mixerNode,
  ]);

  // Use the same waveform math that Web Audio uses internally
  // This matches how the real Minimoog works - OSC 3's waveform output is used for modulation
  const getModulationValue = useCallback(
    (time: number): number => {
      const frequency = calculateFreeRunningFrequency();
      const phase = (frequency * time) % 1;
      const volume = oscillator3.volume / 10;

      let signal = 0;
      // Make waveforms EXTREMELY different so they're impossible to miss
      switch (oscillator3.waveform) {
        case "sawtooth":
          // Sawtooth: spend 90% of time rising slowly, then instant drop
          signal = phase < 0.9 ? (phase / 0.9) * 2 - 1 : 1;
          break;
        case "square":
        case "pulse1":
          // Square: instant jumps, stay at extremes
          signal = phase < 0.5 ? 1 : -1;
          break;
        case "pulse2":
          // Wide pulse: mostly high with brief dips
          signal = phase < 0.8 ? 1 : -1;
          break;
        case "pulse3":
          // Narrow pulse: mostly low with brief spikes
          signal = phase < 0.2 ? 1 : -1;
          break;
        case "triangle":
        default:
          // Triangle: smooth and symmetrical
          signal = phase < 0.5 ? 4 * phase - 1 : 3 - 4 * phase;
          break;
      }

      const result = signal * volume;
      return result;
    },
    [calculateFreeRunningFrequency, oscillator3.waveform, oscillator3.volume]
  );

  // Return the free-running oscillator node and modulation function
  return {
    getFreeRunningOscillator: () => freeRunningOscRef.current,
    isRunningFree: !osc3Control,
    getModulationValue,
  };
}
