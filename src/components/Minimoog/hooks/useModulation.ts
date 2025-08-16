import { useRef, useEffect, useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import type { ModulationProps } from "@/types";
import { useFilterModulation } from "./useFilterModulation";
import { useOscillatorModulation } from "./useOscillatorModulation";
import { useModulationSources } from "./useModulationSources";

// Modulation system - focused only on sources and coordination
export function useModulation({
  audioContext,
  osc1,
  osc2,
  osc3,
  filterNode,
}: ModulationProps) {
  const lfoNodeRef = useRef<OscillatorNode | null>(null);
  const lfoGainRef = useRef<GainNode | null>(null);

  // Use the proper modulation sources hook
  const { getModulationSignal } = useModulationSources();

  // Individual selectors for stable dependencies
  const lfoRate = useSynthStore((state) => state.lfoRate);
  const lfoWaveform = useSynthStore((state) => state.lfoWaveform);

  // LFO frequency calculation
  const lfoFrequency = useMemo(() => {
    const minHz = 0.2;
    const maxHz = 20;
    const normalizedRate = lfoRate / 10;
    return minHz + normalizedRate * (maxHz - minHz);
  }, [lfoRate]);

  // LFO setup
  useEffect(() => {
    if (!audioContext) return;

    const cleanup = () => {
      if (lfoNodeRef.current) {
        try {
          lfoNodeRef.current.stop();
          lfoNodeRef.current.disconnect();
        } catch {
          // LFO cleanup error - ignore
        }
        lfoNodeRef.current = null;
      }
      if (lfoGainRef.current) {
        try {
          lfoGainRef.current.disconnect();
        } catch {
          // LFO gain cleanup error - ignore
        }
        lfoGainRef.current = null;
      }
    };

    cleanup();

    try {
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
      // Error creating LFO - ignore
    }

    return cleanup;
  }, [audioContext, lfoFrequency, lfoWaveform]);

  // Use specialized hooks for filter and oscillator modulation
  useFilterModulation({
    audioContext,
    filterNode: filterNode as AudioWorkletNode | null,
    getModSignal: getModulationSignal,
  });

  useOscillatorModulation({
    audioContext,
    osc1: osc1 as OscillatorNode | null,
    osc2: osc2 as OscillatorNode | null,
    osc3: osc3 as OscillatorNode | null,
    getModSignal: getModulationSignal,
  });

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (lfoNodeRef.current) {
        try {
          lfoNodeRef.current.stop();
          lfoNodeRef.current.disconnect();
        } catch {
          // Already cleaned up
        }
      }
      if (lfoGainRef.current) {
        try {
          lfoGainRef.current.disconnect();
        } catch {
          // Already cleaned up
        }
      }
    };
  }, []);
}
