import { useMemo } from "react";
import { useSynthStore } from "./synthStore";

// --- Basic Selectors ---
export const useOscillator1State = () => {
  return useSynthStore((state) => state.oscillator1);
};

export const useOscillator2State = () => {
  return useSynthStore((state) => state.oscillator2);
};

export const useOscillator3State = () => {
  return useSynthStore((state) => state.oscillator3);
};

export const useMixerNoiseState = () => {
  return useSynthStore((state) => state.mixer.noise);
};

export const useMixerExternalState = () => {
  return useSynthStore((state) => state.mixer.external);
};

// --- Optimized Individual Selectors ---
export const useFilterCutoff = () => {
  return useSynthStore((state) => state.filterCutoff);
};

export const useFilterEmphasis = () => {
  return useSynthStore((state) => state.filterEmphasis);
};

export const useFilterContourAmount = () => {
  return useSynthStore((state) => state.filterContourAmount);
};

export const useFilterAttack = () => {
  return useSynthStore((state) => state.filterAttack);
};

export const useFilterDecay = () => {
  return useSynthStore((state) => state.filterDecay);
};

export const useFilterSustain = () => {
  return useSynthStore((state) => state.filterSustain);
};

export const useKeyboardControl1 = () => {
  return useSynthStore((state) => state.keyboardControl1);
};

export const useKeyboardControl2 = () => {
  return useSynthStore((state) => state.keyboardControl2);
};

export const useLoudnessAttack = () => {
  return useSynthStore((state) => state.loudnessAttack);
};

export const useLoudnessDecay = () => {
  return useSynthStore((state) => state.loudnessDecay);
};

export const useLoudnessSustain = () => {
  return useSynthStore((state) => state.loudnessSustain);
};

export const useDecaySwitchOn = () => {
  return useSynthStore((state) => state.decaySwitchOn);
};

// Removed: All modulation-related selectors since modulation is disabled

export const useGlideOn = () => {
  return useSynthStore((state) => state.glideOn);
};

export const useGlideTime = () => {
  return useSynthStore((state) => state.glideTime);
};

export const useMasterTune = () => {
  return useSynthStore((state) => state.masterTune);
};

export const usePitchWheel = () => {
  return useSynthStore((state) => state.pitchWheel);
};

export const useMainVolume = () => {
  return useSynthStore((state) => state.mainVolume);
};

export const useIsMainActive = () => {
  return useSynthStore((state) => state.isMainActive);
};

export const useActiveKeys = () => {
  return useSynthStore((state) => state.activeKeys);
};

// Audio context selectors
export const useAudioContext = () => {
  return useSynthStore((state) => state.audioContext);
};

export const useIsSynthReady = () => {
  return useSynthStore((state) => state.audioContext.isReady);
};

export const useIsSynthDisabled = () => {
  return useSynthStore((state) => !state.audioContext.isReady);
};

export const useAudioContextError = () => {
  return useSynthStore((state) => state.audioContext.error);
};

// Removed: All oscillator 3 control selectors since modulation is disabled

export const useAuxOutput = () => {
  return useSynthStore((state) => state.auxOutput);
};

export const useTunerOn = () => {
  return useSynthStore((state) => state.tunerOn);
};

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

// ============================================================================
// USER SETTINGS SELECTORS
// ============================================================================

export const useUserSettings = () => {
  return useSynthStore((state) => state.options);
};

export const useMagnifyKnobs = () => {
  return useSynthStore((state) => state.options.magnifyKnobs);
};

export const useWelcomeTour = () => {
  return useSynthStore((state) => state.options.welcomeTour);
};

export const useTooltips = () => {
  return useSynthStore((state) => state.options.tooltips);
};

// ============================================================================
// EFFECTS SELECTORS
// ============================================================================

export const useDelayState = () => {
  return useSynthStore((state) => state.delay);
};

export const useReverbState = () => {
  return useSynthStore((state) => state.reverb);
};
