import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";

/**
 * Generic memoized selector hook that prevents unnecessary re-renders
 * by memoizing the selector result based on state changes
 *
 * @template T - The type of the selected state
 * @param {Function} selector - Function that extracts data from the synth state
 * @returns {T} The memoized selector result
 */
export function useMemoizedSelector<T>(
  selector: (state: ReturnType<typeof useSynthStore.getState>) => T
): T {
  const state = useSynthStore();
  return useMemo(() => selector(state), [selector, state]);
}

/**
 * Memoized selector for oscillator state with optional calculation data
 * Provides oscillator configuration and mixer settings with optional master tune, pitch wheel, and glide data
 *
 * @param {"oscillator1" | "oscillator2" | "oscillator3"} oscillatorKey - Which oscillator to select
 * @param {boolean} [includeCalculations=false] - Whether to include master tune, pitch wheel, and glide data
 * @returns {Object} Oscillator state with mixer settings and optional calculation data
 * @returns {Object} returns.oscillator - The oscillator configuration (waveform, frequency, range, etc.)
 * @returns {Object} returns.mixer - The mixer settings for this oscillator (enabled, volume)
 * @returns {number} [returns.masterTune] - Master tune value (only if includeCalculations is true)
 * @returns {number} [returns.pitchWheel] - Pitch wheel value (only if includeCalculations is true)
 * @returns {boolean} [returns.glideOn] - Glide enabled state (only if includeCalculations is true)
 * @returns {number} [returns.glideTime] - Glide time value (only if includeCalculations is true)
 */
export function useMemoizedOscillatorState(
  oscillatorKey: "oscillator1" | "oscillator2" | "oscillator3",
  includeCalculations = false
) {
  return useMemoizedSelector((state) => {
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
  });
}

/**
 * Memoized selector for filter state with optional modulation data
 * Provides filter configuration and envelope settings with optional active keys, mod wheel, and LFO data
 *
 * @param {boolean} [includeCalculations=false] - Whether to include active keys, mod wheel, and LFO data
 * @returns {Object} Filter state with envelope settings and optional modulation data
 * @returns {number} returns.filterCutoff - Filter cutoff frequency
 * @returns {number} returns.filterEmphasis - Filter resonance/emphasis
 * @returns {number} returns.filterContourAmount - Filter envelope amount
 * @returns {number} returns.filterAttack - Filter envelope attack time
 * @returns {number} returns.filterDecay - Filter envelope decay time
 * @returns {number} returns.filterSustain - Filter envelope sustain level
 * @returns {boolean} returns.filterModulationOn - Whether filter modulation is enabled
 * @returns {number} returns.keyboardControl1 - Keyboard control 1 amount
 * @returns {number} returns.keyboardControl2 - Keyboard control 2 amount
 * @returns {Set<number>} [returns.activeKeys] - Currently active MIDI keys (only if includeCalculations is true)
 * @returns {number} [returns.modWheel] - Modulation wheel value (only if includeCalculations is true)
 * @returns {number} [returns.lfoRate] - LFO rate value (only if includeCalculations is true)
 */
export function useMemoizedFilterState(includeCalculations = false) {
  return useMemoizedSelector((state) => {
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
    const activeKeys = state.activeKeys;
    const modWheel = state.modWheel;
    const lfoRate = state.lfoRate;
    return {
      ...filterState,
      activeKeys,
      modWheel,
      lfoRate,
    };
  });
}

/**
 * Memoized selector for modulation state with optional LFO calculations
 * Provides modulation settings and LFO configuration with optional oscillator and filter modulation data
 *
 * @param {boolean} [includeCalculations=false] - Whether to include oscillator and filter modulation data
 * @returns {Object} Modulation state with LFO settings and optional modulation data
 * @returns {number} returns.lfoRate - LFO rate value
 * @returns {string} returns.lfoWaveform - LFO waveform type
 * @returns {number} returns.modWheel - Modulation wheel value
 * @returns {number} returns.modMix - Modulation mix amount
 * @returns {boolean} returns.oscillatorModulationOn - Whether oscillator modulation is enabled
 * @returns {boolean} returns.filterModulationOn - Whether filter modulation is enabled
 * @returns {boolean} [returns.osc3Control] - Oscillator 3 control state (only if includeCalculations is true)
 * @returns {boolean} [returns.osc3FilterEgSwitch] - Oscillator 3 filter EG switch (only if includeCalculations is true)
 * @returns {boolean} [returns.noiseLfoSwitch] - Noise LFO switch state (only if includeCalculations is true)
 */
export function useMemoizedModulationState(includeCalculations = false) {
  return useMemoizedSelector((state) => {
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
    const osc3Control = state.osc3Control;
    const osc3FilterEgSwitch = state.osc3FilterEgSwitch;
    const noiseLfoSwitch = state.noiseLfoSwitch;
    return {
      ...modulationState,
      osc3Control,
      osc3FilterEgSwitch,
      noiseLfoSwitch,
    };
  });
}
