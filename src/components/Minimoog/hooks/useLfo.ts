import { useRef, useEffect } from "react";
import { calculateLfoFrequency } from "./utils/modulationUtils";

type UseLfoProps = {
  audioContext: AudioContext | null;
  lfoRate: number;
  lfoWaveform: "triangle" | "square";
};

export function useLfo({ audioContext, lfoRate, lfoWaveform }: UseLfoProps) {
  const lfoNodeRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!audioContext) return;

    const cleanup = () => {
      if (lfoNodeRef.current) {
        try {
          lfoNodeRef.current.stop();
          lfoNodeRef.current.disconnect();
        } catch {
          // Ignore cleanup errors
        }
        lfoNodeRef.current = null;
      }
      if (lfoGainRef.current) {
        try {
          lfoGainRef.current.disconnect();
        } catch {
          // Ignore cleanup errors
        }
        lfoGainRef.current = null;
      }
    };

    cleanup();

    try {
      const lfoFrequency = calculateLfoFrequency(lfoRate);
      const lfo = audioContext.createOscillator();
      lfo.type = lfoWaveform === "triangle" ? "triangle" : "square";
      lfo.frequency.setValueAtTime(lfoFrequency, audioContext.currentTime);
      lfo.start();
      lfoNodeRef.current = lfo;

      const lfoGain = audioContext.createGain();
      lfoGain.gain.setValueAtTime(1.0, audioContext.currentTime);
      lfoGainRef.current = lfoGain;
      lfo.connect(lfoGain);
    } catch {
      // Ignore LFO creation errors
    }

    return cleanup;
  }, [audioContext, lfoRate, lfoWaveform]);

  return {
    lfoNode: lfoNodeRef.current,
    lfoGain: lfoGainRef.current,
  };
}
