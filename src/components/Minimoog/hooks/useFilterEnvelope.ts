import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import {
  mapContourAmount,
  mapEnvelopeTime,
  calculateKeyboardControlledCutoff,
} from "@/utils";
import { useKeyboardControl } from "./useKeyboardControl";

type FilterEnvelopeProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | BiquadFilterNode | null;
};

export function useFilterEnvelope({
  audioContext,
  filterNode,
}: FilterEnvelopeProps) {
  const {
    filterCutoff,
    filterContourAmount,
    filterAttack,
    filterDecay,
    filterSustain,
    activeKeys,
    filterModulationOn,
  } = useSynthStore();

  // Get keyboard control offset for filter tracking
  const keyboardControlOffset = useKeyboardControl(activeKeys);

  const filterEnvelope = useMemo(() => {
    return {
      triggerAttack: () => {
        if (!audioContext || !filterNode) {
          return;
        }

        // Only trigger envelope if contour amount is greater than 0
        if (filterContourAmount <= 0) {
          return;
        }

        // Apply keyboard control offset to the base cutoff
        // Use the single source of truth for keyboard-controlled cutoff calculation
        const baseCutoff = calculateKeyboardControlledCutoff(
          filterCutoff,
          keyboardControlOffset
        );
        const envelopeAmount = mapContourAmount(filterContourAmount);

        // Simple envelope calculation with smoothing
        const peakCutoff = baseCutoff * (1 + envelopeAmount / 10);
        const attackTime = Math.max(0.005, mapEnvelopeTime(filterAttack)); // Minimum attack to avoid pops
        const decayTime = Math.max(0.02, mapEnvelopeTime(filterDecay)); // Minimum decay to smooth transitions
        // Smooth sustain level - never go to exactly 0 to avoid abrupt cutoff changes
        const sustainLevel = Math.max(0.01, filterSustain / 10); // Convert 0-10 to 0.01-1

        if (filterNode instanceof AudioWorkletNode) {
          if (filterModulationOn) {
            // When modulation is ON, do NOT send any messages to the filter
            // The modulation system will handle everything
            return;
          } else {
            // Normal envelope operation when modulation is OFF
            filterNode.port.postMessage({
              envelopeAttack: {
                startCutoff: baseCutoff,
                peakCutoff,
                attackTime,
                decayTime,
                sustainLevel,
              },
            });
          }
        }
      },

      triggerRelease: () => {
        if (!audioContext || !filterNode) {
          return;
        }

        // Only trigger envelope if contour amount is greater than 0
        if (filterContourAmount <= 0) {
          return;
        }

        // Apply keyboard control offset to the base cutoff
        // Use the single source of truth for keyboard-controlled cutoff calculation
        const baseCutoff = calculateKeyboardControlledCutoff(
          filterCutoff,
          keyboardControlOffset
        );
        const releaseTime = mapEnvelopeTime(filterDecay);

        if (filterNode instanceof AudioWorkletNode) {
          if (filterModulationOn) {
            // When modulation is ON, do NOT send any messages to the filter
            // The modulation system will handle everything
            return;
          } else {
            // Normal envelope operation when modulation is OFF
            filterNode.port.postMessage({
              envelopeRelease: {
                targetCutoff: baseCutoff,
                releaseTime,
              },
            });
          }
        }
      },
    };
  }, [
    audioContext,
    filterNode,
    filterContourAmount,
    filterCutoff,
    filterAttack,
    filterDecay,
    filterSustain,
    keyboardControlOffset,
    filterModulationOn,
  ]);

  return filterEnvelope;
}
