import { useRef, useCallback, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { SYNTH_CONFIG } from "@/config";
import { log as logger } from "@/utils/logUtils";

type OscillatorModulationProps = {
  audioContext: AudioContext | null;
  osc1: OscillatorNode | null;
  osc2: OscillatorNode | null;
  osc3: OscillatorNode | null;
  getModSignal: (time: number) => number;
};

export function useOscillatorModulation({
  audioContext,
  osc1,
  osc2,
  osc3,
  getModSignal,
}: OscillatorModulationProps) {
  const vibratoIntervalsRef = useRef<ReturnType<typeof setInterval>[]>([]);
  const modulationCleanupRef = useRef<Map<string, () => void>>(new Map());

  // Individual selectors for stable dependencies
  const oscillatorModulationOn = useSynthStore(
    (state) => state.oscillatorModulationOn
  );
  const modWheel = useSynthStore((state) => state.modWheel);
  const safeModWheel = modWheel || 0;

  useEffect(() => {
    const cleanup = () => {
      vibratoIntervalsRef.current.forEach((interval) => {
        clearInterval(interval);
      });
      vibratoIntervalsRef.current = [];
    };

    // Always cleanup first
    cleanup();

    if (!audioContext || !oscillatorModulationOn || safeModWheel === 0) {
      return cleanup;
    }

    try {
      const oscillators = [
        { node: osc1, id: "osc1" },
        { node: osc2, id: "osc2" },
        { node: osc3, id: "osc3" },
      ];

      oscillators.forEach(({ node }) => {
        if (!node) return;

        const modWheelAmount =
          safeModWheel / SYNTH_CONFIG.CONTROLLERS.MOD_WHEEL.MAX;
        const maxCents = modWheelAmount * 300; // Max 300 cents

        const vibratoModulation = () => {
          if (!node || !audioContext || audioContext.state !== "running")
            return;

          try {
            const time = audioContext.currentTime;
            const modVal = getModSignal ? getModSignal(time) : 0;

            // Validate modulation value
            if (isNaN(modVal) || !isFinite(modVal)) {
              return; // Skip invalid values
            }

            const detuneValue = maxCents * modVal;

            // Check if node has detune parameter before using it
            if (
              node.detune &&
              typeof node.detune.setValueAtTime === "function"
            ) {
              node.detune.setValueAtTime(detuneValue, time);
            }
          } catch {
            // Oscillator might have been stopped, ignore errors
          }
        };

        const interval = setInterval(vibratoModulation, 16); // ~60fps
        vibratoIntervalsRef.current.push(interval);
      });
    } catch (error) {
      console.error("Oscillator modulation setup error:", error);
    }

    return cleanup;
  }, [
    audioContext,
    oscillatorModulationOn,
    safeModWheel,
    getModSignal,
    osc1,
    osc2,
    osc3,
  ]);

  /**
   * Legacy method for backwards compatibility
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
      if (!audioContext || !oscillatorModulationOn || safeModWheel === 0) {
        return () => {};
      }

      try {
        // Use Web Audio's built-in modulation with detune parameter (much smoother)
        const maxCents =
          (safeModWheel / SYNTH_CONFIG.CONTROLLERS.MOD_WHEEL.MAX) * 50; // Max 50 cents (0.5 semitones)

        // Create a gain node to control modulation depth
        const modGain = audioContext.createGain();
        modGain.gain.setValueAtTime(maxCents, audioContext.currentTime);

        const vibratoModulation = () => {
          if (!oscillatorNode || oscillatorNode.context.state !== "running")
            return;

          try {
            const time = audioContext.currentTime;
            const modVal = getModSignal ? getModSignal(time) : 0;

            // Validate modulation value
            if (isNaN(modVal) || !isFinite(modVal)) {
              return; // Skip invalid values
            }

            // Apply modulation to detune parameter (much smoother than frequency)
            const detuneValue = maxCents * modVal;
            oscillatorNode.detune.setTargetAtTime(detuneValue, time, 0.01);
          } catch (error) {
            logger.error("Error applying oscillator modulation:", error);
            // Oscillator might have been stopped, ignore errors
          }
        };

        // Update at 30 Hz for smooth modulation
        const interval = setInterval(vibratoModulation, 33);

        const cleanup = () => {
          clearInterval(interval);
          modulationCleanupRef.current.delete(oscillatorId);
        };

        // Store cleanup function
        modulationCleanupRef.current.set(oscillatorId, cleanup);

        return cleanup;
      } catch {
        console.error("Error applying oscillator modulation");
        return () => {};
      }
    },
    [audioContext, oscillatorModulationOn, safeModWheel, getModSignal]
  );

  /**
   * Clean up all modulation for all oscillators
   */
  const cleanupAll = useCallback(() => {
    modulationCleanupRef.current.forEach((cleanup) => cleanup());
    modulationCleanupRef.current.clear();
  }, []);

  return {
    applyModulation,
    cleanupAll,
    isModulationActive: oscillatorModulationOn && safeModWheel > 0,
  };
}
