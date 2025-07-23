import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";

// 🚀 MEMOIZED SELECTOR HOOK: Use useMemo for complex state selectors

/**
 * Hook for memoized Zustand selectors that perform expensive calculations
 * @param selector Function that selects and transforms state
 * @param dependencies Array of dependencies for the selector
 * @returns Memoized result of the selector
 */
export function useMemoizedSelector<T>(
  selector: (state: ReturnType<typeof useSynthStore.getState>) => T,
  dependencies: unknown[] = []
): T {
  const state = useSynthStore();

  return useMemo(() => {
    return selector(state);
  }, [state, ...dependencies]);
}

/**
 * Hook for memoized oscillator state with frequency calculations
 * @param oscillatorKey Which oscillator to select
 * @param includeCalculations Whether to include expensive frequency calculations
 * @returns Memoized oscillator state
 */
export function useMemoizedOscillatorState(
  oscillatorKey: "oscillator1" | "oscillator2" | "oscillator3",
  includeCalculations = false
) {
  return useMemoizedSelector(
    (state) => {
      const oscillator = state[oscillatorKey];
      const mixer =
        state.mixer[
          oscillatorKey === "oscillator1"
            ? "osc1"
            : oscillatorKey === "oscillator2"
            ? "osc2"
            : "osc3"
        ];

      if (!includeCalculations) {
        return { oscillator, mixer };
      }

      // Include expensive calculations only when needed
      const masterTune = state.masterTune;
      const pitchWheel = state.pitchWheel;
      const glideOn = state.glideOn;
      const glideTime = state.glideTime;

      return {
        oscillator,
        mixer,
        masterTune,
        pitchWheel,
        glideOn,
        glideTime,
      };
    },
    [oscillatorKey, includeCalculations]
  );
}

/**
 * Hook for memoized filter state with cutoff calculations
 * @param includeCalculations Whether to include expensive cutoff calculations
 * @returns Memoized filter state
 */
export function useMemoizedFilterState(includeCalculations = false) {
  return useMemoizedSelector(
    (state) => {
      const filterState = {
        filterCutoff: state.filterCutoff,
        filterEmphasis: state.filterEmphasis,
        filterContourAmount: state.filterContourAmount,
        filterAttack: state.filterAttack,
        filterDecay: state.filterDecay,
        filterSustain: state.filterSustain,
        filterModulationOn: state.filterModulationOn,
        keyboardControl1: state.keyboardControl1,
        keyboardControl2: state.keyboardControl2,
      };

      if (!includeCalculations) {
        return filterState;
      }

      // Include expensive calculations only when needed
      const activeKeys = state.activeKeys;
      const modWheel = state.modWheel;
      const lfoRate = state.lfoRate;

      return {
        ...filterState,
        activeKeys,
        modWheel,
        lfoRate,
      };
    },
    [includeCalculations]
  );
}

/**
 * Hook for memoized modulation state with LFO calculations
 * @param includeCalculations Whether to include expensive LFO calculations
 * @returns Memoized modulation state
 */
export function useMemoizedModulationState(includeCalculations = false) {
  return useMemoizedSelector(
    (state) => {
      const modulationState = {
        lfoRate: state.lfoRate,
        lfoWaveform: state.lfoWaveform,
        modWheel: state.modWheel,
        modMix: state.modMix,
        oscillatorModulationOn: state.oscillatorModulationOn,
        filterModulationOn: state.filterModulationOn,
      };

      if (!includeCalculations) {
        return modulationState;
      }

      // Include expensive calculations only when needed
      const vibratoAmount =
        state.oscillatorModulationOn && state.modWheel > 0
          ? Math.max(0, Math.min(100, state.modWheel)) / 100
          : 0;

      return {
        ...modulationState,
        vibratoAmount,
      };
    },
    [includeCalculations]
  );
}
