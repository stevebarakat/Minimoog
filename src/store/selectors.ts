import { useMemo } from "react";
import { useSynthStore } from "./synthStore";

// --- Basic Selectors ---
export const useOscillator1State = () =>
  useSynthStore((state) => state.oscillator1);
export const useOscillator2State = () =>
  useSynthStore((state) => state.oscillator2);
export const useOscillator3State = () =>
  useSynthStore((state) => state.oscillator3);
export const useMixerNoiseState = () =>
  useSynthStore((state) => state.mixer.noise);
export const useMixerExternalState = () =>
  useSynthStore((state) => state.mixer.external);

// --- Optimized Individual Selectors ---
export const useFilterCutoff = () =>
  useSynthStore((state) => state.filterCutoff);

export const useFilterEmphasis = () =>
  useSynthStore((state) => state.filterEmphasis);
export const useFilterContourAmount = () =>
  useSynthStore((state) => state.filterContourAmount);
export const useFilterAttack = () =>
  useSynthStore((state) => state.filterAttack);
export const useFilterDecay = () => useSynthStore((state) => state.filterDecay);
export const useFilterSustain = () =>
  useSynthStore((state) => state.filterSustain);
export const useKeyboardControl1 = () =>
  useSynthStore((state) => state.keyboardControl1);
export const useKeyboardControl2 = () =>
  useSynthStore((state) => state.keyboardControl2);

export const useLoudnessAttack = () =>
  useSynthStore((state) => state.loudnessAttack);
export const useLoudnessDecay = () =>
  useSynthStore((state) => state.loudnessDecay);
export const useLoudnessSustain = () =>
  useSynthStore((state) => state.loudnessSustain);
export const useDecaySwitchOn = () =>
  useSynthStore((state) => state.decaySwitchOn);

// Removed: All modulation-related selectors since modulation is disabled

export const useGlideOn = () => useSynthStore((state) => state.glideOn);
export const useGlideTime = () => useSynthStore((state) => state.glideTime);

export const useMasterTune = () => useSynthStore((state) => state.masterTune);
export const usePitchWheel = () => useSynthStore((state) => state.pitchWheel);
export const useMainVolume = () => useSynthStore((state) => state.mainVolume);
export const useIsMainActive = () =>
  useSynthStore((state) => state.isMainActive);

export const useActiveKeys = () => useSynthStore((state) => state.activeKeys);

// Audio context selectors
export const useAudioContext = () =>
  useSynthStore((state) => state.audioContext);
export const useIsSynthReady = () =>
  useSynthStore((state) => state.audioContext.isReady);
export const useIsSynthDisabled = () =>
  useSynthStore((state) => !state.audioContext.isReady);
export const useAudioContextError = () =>
  useSynthStore((state) => state.audioContext.error);

// Removed: All oscillator 3 control selectors since modulation is disabled

export const useAuxOutput = () => useSynthStore((state) => state.auxOutput);
export const useTunerOn = () => useSynthStore((state) => state.tunerOn);

// --- Grouped/Derived Selectors ---
export const useFilterState = () => {
  const filterCutoff = useFilterCutoff();
  const filterEmphasis = useFilterEmphasis();
  const filterAttack = useFilterAttack();
  const filterDecay = useFilterDecay();
  const filterSustain = useFilterSustain();
  const filterContourAmount = useFilterContourAmount();
  // Removed: filterModulationOn
  const keyboardControl1 = useKeyboardControl1();
  const keyboardControl2 = useKeyboardControl2();

  return useMemo(
    () => ({
      filterCutoff,
      filterEmphasis,
      filterAttack,
      filterDecay,
      filterSustain,
      filterContourAmount,
      // Removed: filterModulationOn
      keyboardControl1,
      keyboardControl2,
      // Removed: modWheel (only if includeModulation is true)
    }),
    [
      filterCutoff,
      filterEmphasis,
      filterAttack,
      filterDecay,
      filterSustain,
      filterContourAmount,
      // Removed: filterModulationOn
      keyboardControl1,
      keyboardControl2,
      // Removed: modWheel
    ]
  );
};

export const useFilterEnvelopeState = () => {
  const filterAttack = useFilterAttack();
  const filterDecay = useFilterDecay();
  const filterSustain = useFilterSustain();
  const filterContourAmount = useFilterContourAmount();

  return useMemo(
    () => ({
      filterAttack,
      filterDecay,
      filterSustain,
      filterContourAmount,
    }),
    [filterAttack, filterDecay, filterSustain, filterContourAmount]
  );
};

export const useLoudnessEnvelopeState = () => {
  const loudnessAttack = useLoudnessAttack();
  const loudnessDecay = useLoudnessDecay();
  const loudnessSustain = useLoudnessSustain();
  const decaySwitchOn = useDecaySwitchOn();

  return useMemo(
    () => ({
      loudnessAttack,
      loudnessDecay,
      loudnessSustain,
      decaySwitchOn,
    }),
    [loudnessAttack, loudnessDecay, loudnessSustain, decaySwitchOn]
  );
};

export const useModulationState = () => {
  const lfoRate = useSynthStore((state) => state.lfoRate);
  const lfoWaveform = useSynthStore((state) => state.lfoWaveform);
  const modWheel = useSynthStore((state) => state.modWheel);
  const modMix = useSynthStore((state) => state.modMix);
  const oscillatorModulationOn = useSynthStore(
    (state) => state.oscillatorModulationOn
  );
  const filterModulationOn = useSynthStore((state) => state.filterModulationOn);

  return useMemo(
    () => ({
      lfoRate,
      lfoWaveform,
      modWheel,
      modMix,
      oscillatorModulationOn,
      filterModulationOn,
    }),
    [
      lfoRate,
      lfoWaveform,
      modWheel,
      modMix,
      oscillatorModulationOn,
      filterModulationOn,
    ]
  );
};

export const useGlideState = () => {
  const glideOn = useGlideOn();
  const glideTime = useGlideTime();

  return useMemo(
    () => ({
      glideOn,
      glideTime,
    }),
    [glideOn, glideTime]
  );
};

export const useMasterControlsState = () => {
  const masterTune = useMasterTune();
  const pitchWheel = usePitchWheel();
  const mainVolume = useMainVolume();
  const isMainActive = useIsMainActive();

  return useMemo(
    () => ({
      masterTune,
      pitchWheel,
      mainVolume,
      isMainActive,
    }),
    [masterTune, pitchWheel, mainVolume, isMainActive]
  );
};

export const useKeyboardState = () => {
  const activeKeys = useActiveKeys();
  const isDisabled = useIsSynthDisabled();

  return useMemo(
    () => ({
      activeKeys,
      isDisabled,
    }),
    [activeKeys, isDisabled]
  );
};

export const useOscillator3ControlsState = () => {
  const osc3Control = useSynthStore((state) => state.osc3Control);
  const osc3FilterEgSwitch = useSynthStore((state) => state.osc3FilterEgSwitch);
  const noiseLfoSwitch = useSynthStore((state) => state.noiseLfoSwitch);

  return useMemo(
    () => ({
      osc3Control,
      osc3FilterEgSwitch,
      noiseLfoSwitch,
    }),
    [osc3Control, osc3FilterEgSwitch, noiseLfoSwitch]
  );
};

export const useOutputState = () => {
  const auxOutput = useAuxOutput();
  const tunerOn = useTunerOn();

  return useMemo(
    () => ({
      auxOutput,
      tunerOn,
    }),
    [auxOutput, tunerOn]
  );
};

// --- Complex/Memoized Selectors ---
export const useVibratoAmount = () => {
  const modWheel = useSynthStore((state) => state.modWheel);
  const oscillatorModulationOn = useSynthStore(
    (state) => state.oscillatorModulationOn
  );

  return useMemo(() => {
    if (!oscillatorModulationOn || !modWheel || modWheel === 0) {
      return 0;
    }
    // Convert mod wheel (0-100) to vibrato amount (0-1)
    return modWheel / 100;
  }, [modWheel, oscillatorModulationOn]);
};

export const useOscillatorConfig = (
  oscillatorKey: "oscillator1" | "oscillator2" | "oscillator3"
) =>
  useSynthStore((state) => ({
    waveform: state[oscillatorKey].waveform,
    range: state[oscillatorKey].range,
    frequency: state[oscillatorKey].frequency,
    enabled: state[oscillatorKey].enabled,
    volume: state[oscillatorKey].volume,
  }));

// --- Memoized Selector Hooks ---
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
    if (!includeCalculations) {
      return { oscillator };
    }
    const masterTune = state.masterTune;
    const pitchWheel = state.pitchWheel;
    const glideOn = state.glideOn;
    const glideTime = state.glideTime;
    return {
      oscillator,
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
      filterAttack: state.filterAttack,
      filterDecay: state.filterDecay,
      filterSustain: state.filterSustain,
      filterContourAmount: state.filterContourAmount,
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
 * Memoized selector for modulation state with optional vibrato calculation
 * Provides LFO, modulation wheel, and modulation mix settings with optional calculated vibrato amount
 *
 * @param {boolean} [includeCalculations=false] - Whether to include calculated vibrato amount
 * @returns {Object} Modulation state with optional vibrato calculation
 * @returns {number} returns.lfoRate - LFO rate in Hz
 * @returns {string} returns.lfoWaveform - LFO waveform type (triangle, square, etc.)
 * @returns {number} returns.modWheel - Modulation wheel value (0-100)
 * @returns {number} returns.modMix - Modulation mix amount
 * @returns {boolean} returns.oscillatorModulationOn - Whether oscillator modulation is enabled
 * @returns {boolean} returns.filterModulationOn - Whether filter modulation is enabled
 * @returns {number} [returns.vibratoAmount] - Calculated vibrato amount (0-1, only if includeCalculations is true)
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
