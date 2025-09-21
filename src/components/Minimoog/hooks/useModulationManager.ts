import { useRef, useCallback, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { calculateGradualModulation } from "@/utils/modulationUtils";

/**
 * Global modulation manager that can be used by both the modulation system and oscillators
 * Provides authentic Minimoog-style modulation with proper depth and frequency
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
   * Uses authentic Minimoog-style modulation parameters
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
        // Authentic Minimoog modulation depth: 100-200 cents (1-2 semitones)
        // This provides musical vibrato without being too extreme
        // Use a power curve to make small ModWheel values more subtle
        const maxCents = calculateGradualModulation(safeModWheel, 150, 2.0);

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

            // Use setValueAtTime for crisp, responsive modulation
            // This matches the authentic Minimoog's immediate response
            oscillatorNode.detune.setValueAtTime(detuneValue, time);
          } catch {
            // Oscillator might have been stopped, ignore errors
          }
        };

        // Update at 60Hz for smooth, musical modulation
        // This provides the right balance between responsiveness and performance
        const interval = setInterval(vibratoModulation, 16); // ~60 Hz

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

  // Set the modulation signal function when this hook is used
  useEffect(() => {
    // This will be set by the modulation system
    return () => {
      cleanupAll();
    };
  }, [cleanupAll]);

  return {
    applyModulation,
    cleanupAll,
    isModulationActive: oscillatorModulationOn && safeModWheel > 0,
    setModSignalFunction,
  };
}
