import { useMemo } from "react";
import { useSynthStore } from "./synthStore";

// --- Basic Selectors ---
export const useOscillator1State = () =>
  useSynthStore((state) => state.oscillator1);
export const useOscillator2State = () =>
  useSynthStore((state) => state.oscillator2);
export const useOscillator3State = () =>
  useSynthStore((state) => state.oscillator3);
export const useMixerOsc1State = () =>
  useSynthStore((state) => state.mixer.osc1);
export const useMixerOsc2State = () =>
  useSynthStore((state) => state.mixer.osc2);
export const useMixerOsc3State = () =>
  useSynthStore((state) => state.mixer.osc3);
export const useMixerNoiseState = () =>
  useSynthStore((state) => state.mixer.noise);
export const useMixerExternalState = () =>
  useSynthStore((state) => state.mixer.external);

// --- Grouped/Derived Selectors ---
export const useFilterState = () =>
  useSynthStore((state) => ({
    filterCutoff: state.filterCutoff,
    filterEmphasis: state.filterEmphasis,
    filterContourAmount: state.filterContourAmount,
    filterAttack: state.filterAttack,
    filterDecay: state.filterDecay,
    filterSustain: state.filterSustain,
    filterModulationOn: state.filterModulationOn,
    keyboardControl1: state.keyboardControl1,
    keyboardControl2: state.keyboardControl2,
  }));
export const useFilterEnvelopeState = () =>
  useSynthStore((state) => ({
    filterAttack: state.filterAttack,
    filterDecay: state.filterDecay,
    filterSustain: state.filterSustain,
    filterContourAmount: state.filterContourAmount,
  }));
export const useLoudnessEnvelopeState = () =>
  useSynthStore((state) => ({
    loudnessAttack: state.loudnessAttack,
    loudnessDecay: state.loudnessDecay,
    loudnessSustain: state.loudnessSustain,
    decaySwitchOn: state.decaySwitchOn,
  }));
export const useModulationState = () =>
  useSynthStore((state) => ({
    lfoRate: state.lfoRate,
    lfoWaveform: state.lfoWaveform,
    modWheel: state.modWheel,
    modMix: state.modMix,
    oscillatorModulationOn: state.oscillatorModulationOn,
    filterModulationOn: state.filterModulationOn,
  }));
export const useGlideState = () =>
  useSynthStore((state) => ({
    glideOn: state.glideOn,
    glideTime: state.glideTime,
  }));
export const useMasterControlsState = () =>
  useSynthStore((state) => ({
    masterTune: state.masterTune,
    pitchWheel: state.pitchWheel,
    mainVolume: state.mainVolume,
    isMainActive: state.isMainActive,
  }));
export const useKeyboardState = () =>
  useSynthStore((state) => ({
    activeKeys: state.activeKeys,
    isDisabled: state.isDisabled,
  }));
export const useOscillator3ControlsState = () =>
  useSynthStore((state) => ({
    osc3Control: state.osc3Control,
    osc3FilterEgSwitch: state.osc3FilterEgSwitch,
    noiseLfoSwitch: state.noiseLfoSwitch,
  }));
export const useOutputState = () =>
  useSynthStore((state) => ({
    auxOutput: state.auxOutput,
    tunerOn: state.tunerOn,
  }));

// --- Complex/Memoized Selectors ---
export const useVibratoAmount = () =>
  useSynthStore((state) => {
    if (!state.oscillatorModulationOn || state.modWheel <= 0) return 0;
    const clampedModWheel = Math.max(0, Math.min(100, state.modWheel));
    return clampedModWheel / 100;
  });
export const useOscillatorConfig = (
  oscillatorKey: "oscillator1" | "oscillator2" | "oscillator3"
) =>
  useSynthStore((state) => ({
    waveform: state[oscillatorKey].waveform,
    range: state[oscillatorKey].range,
    frequency: state[oscillatorKey].frequency,
  }));
export const useMixerSourceConfig = (sourceKey: "osc1" | "osc2" | "osc3") =>
  useSynthStore((state) => ({
    enabled: state.mixer[sourceKey].enabled,
    volume: state.mixer[sourceKey].volume,
  }));

// --- Memoized Selector Hooks ---
export function useMemoizedSelector<T>(
  selector: (state: ReturnType<typeof useSynthStore.getState>) => T,
  dependencies: unknown[] = []
): T {
  const state = useSynthStore();
  return useMemo(() => selector(state), [state, ...dependencies]);
}
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
