import { StateCreator } from "zustand";
import {
  SynthState,
  SynthActions,
  OscillatorState,
  MixerNoiseState,
  MixerExternalState,
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

/**
 * Creates all synth actions for managing the Minimoog synthesizer state
 * Provides actions for updating oscillators, mixer, filter, modulation, and envelope parameters
 *
 * @param {Function} set - Zustand's set function for updating state
 * @returns {SynthActions} Object containing all synth state management actions
 *
 * @example
 * ```typescript
 * const actions = createSynthActions(set);
 * actions.setOscillator1({ frequency: 440, waveform: 'sawtooth' });
 * actions.setFilterCutoff(1000);
 * actions.setModWheel(50);
 * ```
 */
export function createSynthActions(
  set: Parameters<StateCreator<SynthState & SynthActions>>[0]
): SynthActions {
  return {
    /**
     * Sets the audio context state
     * @param {Object} audioContext - Audio context state object
     * @param {boolean} audioContext.isReady - Whether the audio context is ready
     * @param {string | null} audioContext.error - Error message if any
     * @param {AudioContext | null} audioContext.context - The audio context instance
     */
    setAudioContext: (audioContext: {
      isReady: boolean;
      error: string | null;
      context: AudioContext | null;
    }) => set({ audioContext }),

    /**
     * Updates the set of currently active MIDI keys
     * @param {Set<number> | Function} key - New active keys or function to update existing keys
     */
    setActiveKeys: (key) =>
      set((state: SynthState) => ({
        activeKeys: typeof key === "function" ? key(state.activeKeys) : key,
      })),

    /**
     * Sets the pitch wheel value (affects all oscillators)
     * @param {number} value - Pitch wheel value (typically 0-100)
     */
    setPitchWheel: (value) => set({ pitchWheel: createPitchWheelRange(value) }),

    /**
     * Sets the modulation wheel value (affects LFO modulation)
     * @param {number} value - Modulation wheel value (0-100)
     */
    setModWheel: (value) => set({ modWheel: createModWheelRange(value) }),

    /**
     * Sets the master tune value (affects all oscillators)
     * @param {number} value - Master tune value in semitones
     */
    setMasterTune: (value) => set({ masterTune: createMasterTuneRange(value) }),

    /**
     * Updates oscillator 1 parameters
     * @param {Partial<OscillatorState>} osc - Partial oscillator state to merge
     */
    setOscillator1: (osc: Partial<OscillatorState>) =>
      set((state: SynthState) => ({
        oscillator1: { ...state.oscillator1, ...osc },
      })),

    /**
     * Updates oscillator 2 parameters
     * @param {Partial<OscillatorState>} osc - Partial oscillator state to merge
     */
    setOscillator2: (osc: Partial<OscillatorState>) =>
      set((state: SynthState) => ({
        oscillator2: { ...state.oscillator2, ...osc },
      })),

    /**
     * Updates oscillator 3 parameters
     * @param {Partial<OscillatorState>} osc - Partial oscillator state to merge
     */
    setOscillator3: (osc: Partial<OscillatorState>) =>
      set((state: SynthState) => ({
        oscillator3: { ...state.oscillator3, ...osc },
      })),

    /**
     * Updates mixer noise parameters
     * @param {Partial<MixerNoiseState>} value - Partial noise state to merge
     */
    setMixerNoise: (value: Partial<MixerNoiseState>) =>
      set((state: SynthState) => ({
        mixer: {
          ...state.mixer,
          noise: { ...state.mixer.noise, ...value },
        },
      })),

    /**
     * Updates mixer external input parameters
     * @param {Partial<MixerExternalState>} value - Partial external input state to merge
     */
    setMixerExternal: (value: Partial<MixerExternalState>) =>
      set((state: SynthState) => ({
        mixer: {
          ...state.mixer,
          external: { ...state.mixer.external, ...value },
        },
      })),

    /**
     * Sets whether glide is enabled
     * @param {boolean} on - Whether glide should be enabled
     */
    setGlideOn: (on: boolean) => set({ glideOn: on }),

    /**
     * Sets the glide time in milliseconds
     * @param {number} time - Glide time in milliseconds
     */
    setGlideTime: (time: number) =>
      set({ glideTime: createGlideTimeRange(time) }),

    /**
     * Sets the main output volume
     * @param {number} value - Main volume value (0-10)
     */
    setMainVolume: (value) => set({ mainVolume: createVolumeRange(value) }),

    /**
     * Sets whether the main output is active
     * @param {boolean} value - Whether main output should be active
     */
    setIsMainActive: (value) => set({ isMainActive: value }),

    /**
     * Sets the filter implementation type
     * @param {string} type - Filter type ("huovilainen" only - authentic Moog ladder filter)
     */
    setFilterType: (type) => set({ filterType: type }),

    /**
     * Updates filter envelope parameters (attack, decay, sustain)
     * @param {Object} env - Partial envelope parameters
     * @param {number} [env.attack] - Filter attack time
     * @param {number} [env.decay] - Filter decay time
     * @param {number} [env.sustain] - Filter sustain level
     */
    setFilterEnvelope: (env) =>
      set((state: SynthState) => ({
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

    /**
     * Sets the filter cutoff frequency
     * @param {number} value - Filter cutoff frequency in Hz
     */
    setFilterCutoff: (value) =>
      set({ filterCutoff: createFilterCutoffRange(value) }),

    /**
     * Sets the filter emphasis (resonance)
     * @param {number} value - Filter emphasis value (0-10)
     */
    setFilterEmphasis: (value) =>
      set({ filterEmphasis: createFilterEmphasisRange(value) }),

    /**
     * Sets the filter contour amount
     * @param {number} value - Filter contour amount (0-10)
     */
    setFilterContourAmount: (value) =>
      set({ filterContourAmount: createFilterContourRange(value) }),

    /**
     * Sets keyboard control 1 for filter
     * @param {boolean} on - Whether keyboard control 1 should be enabled
     */
    setKeyboardControl1: (on: boolean) => set({ keyboardControl1: on }),

    /**
     * Sets keyboard control 2 for filter
     * @param {boolean} on - Whether keyboard control 2 should be enabled
     */
    setKeyboardControl2: (on: boolean) => set({ keyboardControl2: on }),

    /**
     * Sets the filter modulation on/off
     * @param {boolean} on - Whether filter modulation should be enabled
     */
    setFilterModulationOn: (on: boolean) => set({ filterModulationOn: on }),

    /**
     * Sets the oscillator modulation on/off
     * @param {boolean} on - Whether oscillator modulation should be enabled
     */
    setOscillatorModulationOn: (on: boolean) =>
      set({ oscillatorModulationOn: on }),

    /**
     * Sets the LFO waveform type
     * @param {"triangle" | "square"} waveform - LFO waveform type
     */
    setLfoWaveform: (waveform: "triangle" | "square") =>
      set({ lfoWaveform: waveform }),

    /**
     * Sets the LFO rate
     * @param {number} rate - LFO rate value (0-10)
     */
    setLfoRate: (rate: number) => set({ lfoRate: createLfoRateRange(rate) }),

    /**
     * Sets the modulation mix amount
     * @param {number} value - Modulation mix value (0-10)
     */
    setModMix: (value: number) => set({ modMix: createModMixRange(value) }),

    /**
     * Sets the oscillator 3 control on/off
     * @param {boolean} on - Whether oscillator 3 control should be enabled
     */
    setOsc3Control: (on: boolean) => set({ osc3Control: on }),

    /**
     * Sets the oscillator 3 filter EG switch
     * @param {boolean} on - Whether oscillator 3 should use filter EG
     */
    setOsc3FilterEgSwitch: (on: boolean) => set({ osc3FilterEgSwitch: on }),

    /**
     * Sets the noise/LFO switch
     * @param {boolean} on - Whether to use noise instead of LFO
     */
    setNoiseLfoSwitch: (on: boolean) => set({ noiseLfoSwitch: on }),

    /**
     * Sets the modulation wheel value
     * @param {number} value - Modulation wheel value (0-100)
     */
    setModWheel: (value: number) =>
      set({ modWheel: createModWheelRange(value) }),

    setDecaySwitchOn: (on: boolean) => {
      set({ decaySwitchOn: on });
    },

    /**
     * Updates loudness envelope parameters (attack, decay, sustain)
     * @param {Object} env - Partial envelope parameters
     * @param {number} [env.attack] - Loudness attack time
     * @param {number} [env.decay] - Loudness decay time
     * @param {number} [env.sustain] - Loudness sustain level
     */
    setLoudnessEnvelope: (env) =>
      set((state: SynthState) => ({
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

    setTunerOn: (on: boolean) => set({ tunerOn: on }),
    setAuxOutput: (value) =>
      set((state: SynthState) => ({
        auxOutput: {
          ...state.auxOutput,
          ...value,
          volume:
            value.volume !== undefined
              ? createVolumeRange(value.volume)
              : state.auxOutput.volume,
        },
      })),
    loadPreset: (preset: Partial<SynthState>) => {
      set((state: SynthState) => {
        // Completely replace state with preset values, preserving only essential non-preset properties
        const newState = {
          ...preset,
          // Preserve essential non-preset properties
          audioContext: state.audioContext,
          activeKeys: state.activeKeys,
        };
        return newState;
      });
    },
  };
}
