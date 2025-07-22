import { useEffect, useRef } from "react";
import { useSynthStore } from "@/store/synthStore";

export function useAuxOutput(
  audioContext: AudioContext | null,
  inputNode?: AudioNode | null
) {
  const { auxOutput } = useSynthStore();
  const gainRef = useRef<GainNode | null>(null);

  // Convert linear volume (0-10) to logarithmic gain (0-1)
  const linearToLogGain = (linearVolume: number) => {
    // Convert 0-10 to 0-1
    const normalizedVolume = linearVolume / 10;
    // Convert to logarithmic scale with more usable gain values
    // At volume 0.001: gain ≈ 0.001 (-60dB)
    // At volume 1: gain ≈ 0.1 (-20dB)
    // At volume 5: gain ≈ 0.5 (-6dB)
    // At volume 10: gain = 1.0 (0dB)
    return Math.pow(normalizedVolume, 1.5) * 0.9 + 0.1;
  };

  // Setup audio nodes
  useEffect(() => {
    if (!audioContext) {
      gainRef.current = null;
      return;
    }

    // Create gain node if it doesn't exist
    if (!gainRef.current) {
      gainRef.current = audioContext.createGain();
      gainRef.current.gain.value = 0; // Start muted
    }

    // Connect input node to aux output if provided
    if (inputNode && gainRef.current) {
      inputNode.connect(gainRef.current);
    }

    return () => {
      if (gainRef.current) {
        gainRef.current.disconnect();
        gainRef.current = null;
      }
    };
  }, [audioContext, inputNode]);

  // Update gain when aux output settings change
  useEffect(() => {
    if (gainRef.current && audioContext) {
      const newGain = auxOutput.enabled ? linearToLogGain(auxOutput.volume) : 0;
      // Guard against NaN and non-finite values
      if (isFinite(newGain)) {
        gainRef.current.gain.setValueAtTime(newGain, audioContext.currentTime);
      } else {
        gainRef.current.gain.setValueAtTime(0, audioContext.currentTime);
      }
    }
  }, [auxOutput.enabled, auxOutput.volume, audioContext]);

  return {
    auxOutputNode: gainRef.current,
  };
}
