import { StateCreator } from "zustand";
import {
  SynthState,
  SynthActions,
  OscillatorState,
  MixerNoiseState,
  MixerExternalState,
} from "./types/synth";
import { track } from "@vercel/analytics";
import {
  createPitchWheelRange,
  createModWheelRange,
  createMasterTuneRange,
  createGlideTimeRange,
  createVolumeRange,
  createFilterEnvelopeRange,
  createFilterCutoffRange,
  createFilterEmphasisRange,
  createFilterContourRange,
  createLfoRateRange,
  createModMixRange,
} from "../types/synth";
import { saveUserSettings, saveSynthSettings } from "@/utils/data";

function saveSynthState(state: SynthState) {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { audioContext, activeKeys, options, ...synthSettings } = state;
  saveSynthSettings(synthSettings);
}

function setWithSave(
  set: Parameters<StateCreator<SynthState & SynthActions>>[0],
  updater: (state: SynthState) => Partial<SynthState>
) {
  set((state: SynthState) => {
    const newState = { ...state, ...updater(state) };
    saveSynthState(newState);
    return newState;
  });
}

export function createSynthActions(
  set: Parameters<StateCreator<SynthState & SynthActions>>[0]
): SynthActions {
  return {
    setAudioContext: (audioContext: {
      isReady: boolean;
      error: string | null;
      context: AudioContext | null;
    }) => set({ audioContext }),

    setActiveKeys: (key) =>
      set((state: SynthState) => ({
        activeKeys: typeof key === "function" ? key(state.activeKeys) : key,
      })),

    setPitchWheel: (value) =>
      setWithSave(set, () => ({ pitchWheel: createPitchWheelRange(value) })),

    setModWheel: (value) =>
      setWithSave(set, () => ({ modWheel: createModWheelRange(value) })),

    setMasterTune: (value) =>
      setWithSave(set, () => ({ masterTune: createMasterTuneRange(value) })),

    setOscillator1: (osc: Partial<OscillatorState>) =>
      setWithSave(set, (state: SynthState) => ({
        oscillator1: { ...state.oscillator1, ...osc },
      })),

    setOscillator2: (osc: Partial<OscillatorState>) =>
      setWithSave(set, (state: SynthState) => ({
        oscillator2: { ...state.oscillator2, ...osc },
      })),

    setOscillator3: (osc: Partial<OscillatorState>) =>
      setWithSave(set, (state: SynthState) => ({
        oscillator3: { ...state.oscillator3, ...osc },
      })),

    setMixerNoise: (value: Partial<MixerNoiseState>) =>
      setWithSave(set, (state: SynthState) => ({
        mixer: {
          ...state.mixer,
          noise: { ...state.mixer.noise, ...value },
        },
      })),

    setMixerExternal: (value: Partial<MixerExternalState>) =>
      setWithSave(set, (state: SynthState) => ({
        mixer: {
          ...state.mixer,
          external: { ...state.mixer.external, ...value },
        },
      })),

    setGlideOn: (on: boolean) => setWithSave(set, () => ({ glideOn: on })),

    setGlideTime: (time: number) =>
      setWithSave(set, () => ({ glideTime: createGlideTimeRange(time) })),

    setMainVolume: (value) =>
      setWithSave(set, () => ({ mainVolume: createVolumeRange(value) })),

    setIsMainActive: (value) =>
      setWithSave(set, () => ({ isMainActive: value })),

    setFilterType: (type) => {
      track("filter_type_changed", { filter_type: type });
      setWithSave(set, () => ({ filterType: type }));
    },

    setFilterEnvelope: (env) =>
      setWithSave(set, (state: SynthState) => ({
        filterAttack:
          env.attack !== undefined
            ? createFilterEnvelopeRange(env.attack)
            : state.filterAttack,
        filterDecay:
          env.decay !== undefined
            ? createFilterEnvelopeRange(env.decay)
            : state.filterDecay,
        filterSustain:
          env.sustain !== undefined
            ? createFilterEnvelopeRange(env.sustain)
            : state.filterSustain,
      })),

    setFilterCutoff: (value) => {
      setWithSave(set, () => ({
        filterCutoff: createFilterCutoffRange(value),
      }));
    },

    setFilterEmphasis: (value) =>
      setWithSave(set, () => ({
        filterEmphasis: createFilterEmphasisRange(value),
      })),

    setFilterContourAmount: (value) =>
      setWithSave(set, () => ({
        filterContourAmount: createFilterContourRange(value),
      })),

    setKeyboardControl1: (on: boolean) =>
      setWithSave(set, () => ({ keyboardControl1: on })),

    setKeyboardControl2: (on: boolean) =>
      setWithSave(set, () => ({ keyboardControl2: on })),

    setFilterModulationOn: (on: boolean) => {
      setWithSave(set, () => ({ filterModulationOn: on }));
    },

    setOscillatorModulationOn: (on: boolean) =>
      setWithSave(set, () => ({ oscillatorModulationOn: on })),

    setLfoWaveform: (waveform: "triangle" | "square") =>
      setWithSave(set, () => ({ lfoWaveform: waveform })),

    setLfoRate: (rate: number) => {
      track("lfo_rate_changed", { lfo_rate: rate });
      setWithSave(set, () => ({ lfoRate: createLfoRateRange(rate) }));
    },

    setModMix: (value: number) =>
      setWithSave(set, () => ({ modMix: createModMixRange(value) })),

    setOsc3Control: (on: boolean) =>
      setWithSave(set, () => ({ osc3Control: on })),

    setOsc3FilterEgSwitch: (on: boolean) =>
      setWithSave(set, () => ({ osc3FilterEgSwitch: on })),

    setNoiseLfoSwitch: (on: boolean) =>
      setWithSave(set, () => ({ noiseLfoSwitch: on })),

    setDecaySwitchOn: (on: boolean) => {
      setWithSave(set, () => ({ decaySwitchOn: on }));
    },

    setLoudnessEnvelope: (env) =>
      setWithSave(set, (state: SynthState) => ({
        loudnessAttack:
          env.attack !== undefined
            ? createFilterEnvelopeRange(env.attack)
            : state.loudnessAttack,
        loudnessDecay:
          env.decay !== undefined
            ? createFilterEnvelopeRange(env.decay)
            : state.loudnessDecay,
        loudnessSustain:
          env.sustain !== undefined
            ? createFilterEnvelopeRange(env.sustain)
            : state.loudnessSustain,
      })),

    setTunerOn: (on: boolean) => setWithSave(set, () => ({ tunerOn: on })),
    setAuxOutput: (value) =>
      setWithSave(set, (state: SynthState) => ({
        auxOutput: {
          ...state.auxOutput,
          ...value,
          volume:
            value.volume !== undefined
              ? createVolumeRange(value.volume)
              : state.auxOutput.volume,
        },
      })),

    setEffectsVolume: (value: number) =>
      setWithSave(set, () => ({ effectsVolume: createVolumeRange(value) })),

    setDelay: (value) =>
      setWithSave(set, (state: SynthState) => ({
        delay: {
          ...state.delay,
          ...value,
          mix:
            value.mix !== undefined
              ? createVolumeRange(value.mix)
              : state.delay.mix,
          time:
            value.time !== undefined
              ? createFilterEnvelopeRange(value.time)
              : state.delay.time,
          feedback:
            value.feedback !== undefined
              ? createVolumeRange(value.feedback)
              : state.delay.feedback,
        },
      })),

    setReverb: (value) =>
      setWithSave(set, (state: SynthState) => ({
        reverb: {
          ...state.reverb,
          ...value,
          mix:
            value.mix !== undefined
              ? createVolumeRange(value.mix)
              : state.reverb.mix,
          tone:
            value.tone !== undefined
              ? createFilterEnvelopeRange(value.tone)
              : state.reverb.tone,
        },
      })),

    loadPreset: (preset: Partial<SynthState>) => {
      set((state: SynthState) => {
        // Completely replace state with preset values, preserving only essential non-preset properties
        const newState = {
          ...state, // Start with current state
          ...preset, // Override with preset values
          // Preserve essential non-preset properties
          audioContext: state.audioContext,
          activeKeys: state.activeKeys,
          options: state.options, // Preserve user settings when loading presets
        };
        // Save the new synth settings to localStorage (excluding options)
        saveSynthState(newState);
        return newState;
      });
    },

    setOptions: (settings) =>
      set((state: SynthState) => {
        const newUserSettings = {
          ...state.options,
          ...settings,
        };
        // Save to localStorage
        saveUserSettings(newUserSettings);
        return { options: newUserSettings };
      }),

    toggleOption: (key) =>
      set((state: SynthState) => {
        const newUserSettings = {
          ...state.options,
          [key]: !state.options[key],
        };
        // Save to localStorage
        saveUserSettings(newUserSettings);
        return { options: newUserSettings };
      }),
  };
}
