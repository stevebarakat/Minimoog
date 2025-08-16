import { useRef, useCallback, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { SYNTH_CONFIG } from "@/config";

/**
 * Global modulation manager that can be used by both the modulation system and oscillators
 */
export function useModulationManager(audioContext: AudioContext | null) {
  const modulationCleanupRef = useRef<Map<string, () => void>>(new Map());
  const getModSignalRef = useRef<((time: number) => number) | null>(null);

  const { oscillatorModulationOn, modWheel } = useSynthStore();
  const safeModWheel = modWheel || 0;

  /**
   * Set the modulation signal function (called by the modulation system)
   */
  const setModSignalFunction = useCallback((fn: (time: number) => number) => {
    getModSignalRef.current = fn;
  }, []);

  /**
   * Apply modulation to a specific oscillator node
   */
  const applyModulation = useCallback(
    (oscillatorNode: OscillatorNode, oscillatorId: string): (() => void) => {
      // Clean up any existing modulation for this oscillator
      const existingCleanup = modulationCleanupRef.current.get(oscillatorId);
      if (existingCleanup) {
        existingCleanup();
        modulationCleanupRef.current.delete(oscillatorId);
      }

      // Don't apply modulation if conditions aren't met
      if (
        !audioContext ||
        !oscillatorModulationOn ||
        safeModWheel === 0 ||
        !getModSignalRef.current
      ) {
        return () => {};
      }

      try {
        // Use our clean detune-based modulation with much more dramatic depth
        const maxCents =
          (safeModWheel / SYNTH_CONFIG.CONTROLLERS.MOD_WHEEL.MAX) * 300; // Max 300 cents (3 semitones) for obvious effect

        const vibratoModulation = () => {
          if (
            !oscillatorNode ||
            oscillatorNode.context.state !== "running" ||
            !getModSignalRef.current
          )
            return;

          try {
            const time = audioContext.currentTime;
            const modVal = getModSignalRef.current(time);
            const detuneValue = maxCents * modVal;

            // Try instant changes instead of smooth transitions - maybe smoothing is killing the waveform differences
            oscillatorNode.detune.setValueAtTime(detuneValue, time);
          } catch {
            // Oscillator might have been stopped, ignore errors
          }
        };

        // VERY fast update rate to catch abrupt waveform changes
        const interval = setInterval(vibratoModulation, 2); // ~500 Hz - should catch all waveform transitions

        const cleanup = () => {
          clearInterval(interval);
          modulationCleanupRef.current.delete(oscillatorId);
        };

        // Store cleanup function
        modulationCleanupRef.current.set(oscillatorId, cleanup);

        return cleanup;
      } catch (error) {
        console.error("Error applying oscillator modulation:", error);
        return () => {};
      }
    },
    [audioContext, oscillatorModulationOn, safeModWheel]
  );

  /**
   * Clean up all modulation for all oscillators
   */
  const cleanupAll = useCallback(() => {
    modulationCleanupRef.current.forEach((cleanup) => cleanup());
    modulationCleanupRef.current.clear();
  }, []);

  // Clean up on unmount
  useEffect(() => {
    return cleanupAll;
  }, [cleanupAll]);

  return {
    setModSignalFunction,
    applyModulation,
    cleanupAll,
    isModulationActive: oscillatorModulationOn && safeModWheel > 0,
  };
}
