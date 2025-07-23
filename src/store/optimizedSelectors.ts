import { useSynthStore } from "./synthStore";

// 🚀 OPTIMIZED SELECTORS: Use selective state access to prevent unnecessary re-renders

// Oscillator selectors - only subscribe to specific state slices
export const useOscillator1State = () =>
  useSynthStore((state) => state.oscillator1);

export const useOscillator2State = () =>
  useSynthStore((state) => state.oscillator2);

export const useOscillator3State = () =>
  useSynthStore((state) => state.oscillator3);

// Mixer selectors - only subscribe to specific state slices
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

// Filter selectors - grouped related state
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

// Envelope selectors - grouped related state
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

// Modulation selectors - grouped related state
export const useModulationState = () =>
  useSynthStore((state) => ({
    lfoRate: state.lfoRate,
    lfoWaveform: state.lfoWaveform,
    modWheel: state.modWheel,
    modMix: state.modMix,
    oscillatorModulationOn: state.oscillatorModulationOn,
    filterModulationOn: state.filterModulationOn,
  }));

// Glide selectors - grouped related state
export const useGlideState = () =>
  useSynthStore((state) => ({
    glideOn: state.glideOn,
    glideTime: state.glideTime,
  }));

// Master controls selectors - grouped related state
export const useMasterControlsState = () =>
  useSynthStore((state) => ({
    masterTune: state.masterTune,
    pitchWheel: state.pitchWheel,
    mainVolume: state.mainVolume,
    isMainActive: state.isMainActive,
  }));

// Keyboard state selector - grouped related state
export const useKeyboardState = () =>
  useSynthStore((state) => ({
    activeKeys: state.activeKeys,
    isDisabled: state.isDisabled,
  }));

// Oscillator 3 specific selectors - grouped related state
export const useOscillator3ControlsState = () =>
  useSynthStore((state) => ({
    osc3Control: state.osc3Control,
    osc3FilterEgSwitch: state.osc3FilterEgSwitch,
    noiseLfoSwitch: state.noiseLfoSwitch,
  }));

// Output selectors - grouped related state
export const useOutputState = () =>
  useSynthStore((state) => ({
    auxOutput: state.auxOutput,
    tunerOn: state.tunerOn,
  }));

// Complex selectors for expensive calculations
export const useVibratoAmount = () =>
  useSynthStore((state) => {
    if (!state.oscillatorModulationOn || state.modWheel <= 0) return 0;
    const clampedModWheel = Math.max(0, Math.min(100, state.modWheel));
    return clampedModWheel / 100;
  });

// Memoized selector for oscillator configuration
export const useOscillatorConfig = (
  oscillatorKey: "oscillator1" | "oscillator2" | "oscillator3"
) =>
  useSynthStore((state) => ({
    waveform: state[oscillatorKey].waveform,
    range: state[oscillatorKey].range,
    frequency: state[oscillatorKey].frequency,
  }));

// Memoized selector for mixer source configuration
export const useMixerSourceConfig = (sourceKey: "osc1" | "osc2" | "osc3") =>
  useSynthStore((state) => ({
    enabled: state.mixer[sourceKey].enabled,
    volume: state.mixer[sourceKey].volume,
  }));
