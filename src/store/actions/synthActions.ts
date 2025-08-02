import { StateCreator } from "zustand";
import {
  SynthState,
  SynthActions,
  OscillatorState,
  MixerSourceState,
  MixerNoiseState,
  MixerExternalState,
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
     * Sets the disabled state of the synthesizer
     * @param {boolean} disabled - Whether the synth should be disabled
     */
    setIsDisabled: (disabled: boolean) => set({ isDisabled: disabled }),

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
    setPitchWheel: (value) => set({ pitchWheel: value }),

    /**
     * Sets the modulation wheel value (affects LFO modulation)
     * @param {number} value - Modulation wheel value (0-100)
     */
    setModWheel: (value) => set({ modWheel: value }),

    /**
     * Sets the master tune value (affects all oscillators)
     * @param {number} value - Master tune value in semitones
     */
    setMasterTune: (value) => set({ masterTune: value }),

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
     * Updates mixer source parameters (osc1, osc2, or osc3)
     * @param {"osc1" | "osc2" | "osc3"} source - Which oscillator source to update
     * @param {Partial<MixerSourceState>} value - Partial mixer source state to merge
     */
    setMixerSource: (
      source: "osc1" | "osc2" | "osc3",
      value: Partial<MixerSourceState>
    ) =>
      set((state: SynthState) => ({
        mixer: {
          ...state.mixer,
          [source]: { ...state.mixer[source], ...value },
        },
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
    setGlideTime: (time: number) => set({ glideTime: time }),

    /**
     * Sets the main output volume
     * @param {number} value - Main volume value (0-10)
     */
    setMainVolume: (value) => set({ mainVolume: value }),

    /**
     * Sets whether the main output is active
     * @param {boolean} value - Whether main output should be active
     */
    setIsMainActive: (value) => set({ isMainActive: value }),

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
          env.attack !== undefined ? env.attack : state.filterAttack,
        filterDecay: env.decay !== undefined ? env.decay : state.filterDecay,
        filterSustain:
          env.sustain !== undefined ? env.sustain : state.filterSustain,
      })),

    /**
     * Sets the filter cutoff frequency
     * @param {number} value - Filter cutoff frequency in Hz
     */
    setFilterCutoff: (value) => set({ filterCutoff: value }),

    /**
     * Sets the filter emphasis (resonance)
     * @param {number} value - Filter emphasis value (0-10)
     */
    setFilterEmphasis: (value) => set({ filterEmphasis: value }),

    /**
     * Sets the filter contour amount
     * @param {number} value - Filter contour amount (0-10)
     */
    setFilterContourAmount: (value) => set({ filterContourAmount: value }),

    /**
     * Sets whether filter modulation is enabled
     * @param {boolean} on - Whether filter modulation should be enabled
     */
    setFilterModulationOn: (on: boolean) => set({ filterModulationOn: on }),

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
     * Sets whether oscillator modulation is enabled
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
     * Sets the LFO rate in Hz
     * @param {number} rate - LFO rate in Hz
     */
    setLfoRate: (rate: number) => set({ lfoRate: rate }),

    /**
     * Sets whether oscillator 3 control is enabled
     * @param {boolean} on - Whether oscillator 3 control should be enabled
     */
    setOsc3Control: (on: boolean) => set({ osc3Control: on }),

    /**
     * Sets the modulation mix amount
     * @param {number} value - Modulation mix value (0-10)
     */
    setModMix: (value: number) => set({ modMix: value }),

    /**
     * Sets whether oscillator 3 filter envelope switch is enabled
     * @param {boolean} on - Whether the switch should be enabled
     */
    setOsc3FilterEgSwitch: (on: boolean) => set({ osc3FilterEgSwitch: on }),

    /**
     * Sets whether noise LFO switch is enabled
     * @param {boolean} on - Whether the switch should be enabled
     */
    setNoiseLfoSwitch: (on: boolean) => set({ noiseLfoSwitch: on }),

    /**
     * Updates loudness envelope parameters (attack, decay, sustain)
     * @param {Object} env - Partial envelope parameters
     * @param {number} [env.attack] - Loudness attack time
     * @param {number} [env.decay] - Loudness decay time
     * @param {number} [env.sustain] - Loudness sustain level
     */
    setLoudnessEnvelope: (env) =>
      set((state: SynthState) => {
        const newAttack =
          env.attack !== undefined ? env.attack : state.loudnessAttack;
        const newDecay =
          env.decay !== undefined ? env.decay : state.loudnessDecay;
        const newSustain =
          env.sustain !== undefined ? env.sustain : state.loudnessSustain;

        return {
          loudnessAttack: newAttack,
          loudnessDecay: newDecay,
          loudnessSustain: newSustain,
        };
      }),
    setDecaySwitchOn: (on: boolean) => {
      set({ decaySwitchOn: on });
    },
    setTunerOn: (on: boolean) => set({ tunerOn: on }),
    setAuxOutput: (value) =>
      set((state: SynthState) => ({
        auxOutput: { ...state.auxOutput, ...value },
      })),
    loadPreset: (preset: Partial<SynthState>) => {
      set((state: SynthState) => {
        // Completely replace state with preset values, preserving only essential non-preset properties
        const newState = {
          ...preset,
          // Preserve essential non-preset properties
          isDisabled: state.isDisabled,
          activeKeys: state.activeKeys,
        };
        return newState;
      });
    },
    updateURL: () => {
      // This will be called with the current state
      // The actual implementation will be in the component
    },
  };
}
