import { useRef, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { SYNTH_CONFIG } from "@/config";
import { mapCutoff, mapContourAmount } from "@/utils";

type FilterModulationProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | null;
  getModSignal: (time: number) => number;
};

export function useFilterModulation({
  audioContext,
  filterNode,
  getModSignal,
}: FilterModulationProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const getModSignalRef = useRef(getModSignal);
  const filterModulationOn = useSynthStore((state) => state.filterModulationOn);

  // Add smoothing state to prevent audio artifacts
  const lastCutoffRef = useRef<number>(0);

  // Always keep the ref current
  getModSignalRef.current = getModSignal;

  useEffect(() => {
    // Clear existing interval and timeout
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Exit early if modulation is off or dependencies are missing
    if (!filterModulationOn || !audioContext || !filterNode) {
      return;
    }

    // Small delay to ensure cleanup is complete before creating new interval
    timeoutRef.current = setTimeout(() => {
      // Get current state for base calculations
      const state = useSynthStore.getState();
      const baseCutoff = mapCutoff(state.filterCutoff);

      // Initialize the last cutoff for smoothing
      lastCutoffRef.current = baseCutoff;

      // When modulation is ON, we need to disable the WASM envelope
      // to prevent conflicts, but we'll simulate the envelope behavior
      // in our modulation calculations
      filterNode.port.postMessage({ setEnvelopeActive: 0 });
      filterNode.port.postMessage({ cutOff: baseCutoff });

      // Small delay before starting modulation to ensure setup is complete
      setTimeout(() => {
        intervalRef.current = setInterval(() => {
          if (!filterNode?.port) return;

          try {
            const time = audioContext.currentTime;
            const modVal = getModSignalRef.current
              ? getModSignalRef.current(time)
              : 0;

            // Get current state
            const state = useSynthStore.getState();
            const filterCutoff = state.filterCutoff;
            const modWheel = state.modWheel || 0;
            const activeKeys = state.activeKeys;
            const keyboardControl1 = state.keyboardControl1;
            const keyboardControl2 = state.keyboardControl2;
            const filterContourAmount = state.filterContourAmount;

            // Calculate keyboard control offset
            let keyboardControlOffset = 0;
            if (
              activeKeys &&
              activeKeys instanceof Set &&
              activeKeys.size > 0 &&
              (keyboardControl1 || keyboardControl2)
            ) {
              const firstKey = Array.from(activeKeys)[0];
              const controlAmount = keyboardControl1
                ? 1
                : keyboardControl2
                ? 1 / 3
                : 0;
              keyboardControlOffset = (Number(firstKey) - 60) * controlAmount;
            }

            const adjustedFilterCutoff =
              filterCutoff + keyboardControlOffset * 4;
            const baseCutoff = mapCutoff(adjustedFilterCutoff);

            // Calculate envelope influence when modulation is active
            let envelopeInfluence = 1;
            if (
              filterContourAmount > 0 &&
              activeKeys &&
              typeof activeKeys === "object" &&
              "size" in activeKeys &&
              (activeKeys.size as number) > 0
            ) {
              // Simple envelope calculation for modulation integration
              const envelopeAmount = mapContourAmount(filterContourAmount);
              envelopeInfluence = 1 + envelopeAmount / 10;
            }

            // Apply modulation with original range (3x as originally implemented)
            const modWheelAmount =
              modWheel / SYNTH_CONFIG.CONTROLLERS.MOD_WHEEL.MAX;

            // Restore original modulation range (3x)
            const modulationRange = baseCutoff * 3 * modWheelAmount;

            // Apply contour amount to modulation depth for authentic behavior
            const contourModulatedRange = modulationRange * envelopeInfluence;

            const minCutoff = Math.max(20, baseCutoff - contourModulatedRange);
            const maxCutoff = Math.min(
              20000,
              baseCutoff + contourModulatedRange
            );
            const targetCutoff =
              minCutoff + ((maxCutoff - minCutoff) * (modVal + 1)) / 2;

            // Send to filter - now works with integrated envelope simulation
            filterNode.port.postMessage({
              cutOff: targetCutoff,
            });
          } catch (error) {
            console.error("Filter modulation error:", error);
          }
        }, 16); // Restored to original 16ms for faster modulation response
      }, 50); // 50ms delay before starting modulation
    }, 10); // 10ms delay

    // Cleanup function
    return () => {
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [filterModulationOn, audioContext, filterNode]);
}
