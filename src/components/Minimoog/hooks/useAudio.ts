import { useAudioNodes } from "./useAudioNodes";
import { useModulation } from "./useModulation";
import { useEnvelopes } from "./useEnvelopes";
import { useNoiseAndAux } from "./useNoiseAndAux";
import { useModulationManager } from "./useModulationManager";
import { useOscillatorFactory } from "@/components/OscillatorBank/hooks/useOscillatorFactory";
import { getOscillatorFactory } from "@/components/OscillatorBank/oscillatorRegistry";
import { useMidiHandling } from "@/components/Keyboard/hooks";
import { useIsMobile } from "@/hooks/useMediaQuery";
import { useEffect, useMemo } from "react";

/**
 * Main audio hook that orchestrates the entire Minimoog audio system
 * Sets up and manages all audio nodes, oscillators, modulation, envelopes, and MIDI handling
 *
 * @param {AudioContext | null} audioContext - The Web Audio API context, or null if not initialized
 * @returns {Object} Audio system configuration containing all audio nodes and synth object
 * @returns {GainNode} returns.mixerNode - Main mixer node for combining oscillator outputs
 * @returns {null} returns.filterNode - Filter node (removed, returns null)
 * @returns {GainNode} returns.loudnessEnvelopeGain - Gain node controlled by loudness envelope
 * @returns {DelayNode} returns.delayNode - Delay effect node between envelope and master gain
 * @returns {GainNode} returns.delayMixGain - Delay mix control gain node
 * @returns {GainNode} returns.delayFeedbackGain - Delay feedback control gain node
 * @returns {GainNode} returns.dryGain - Dry signal gain node for dry/wet mixing
 * @returns {GainNode} returns.masterGain - Final output gain node
 * @returns {Object} returns.osc1 - Oscillator 1 instance with start/stop/update methods
 * @returns {Object} returns.osc2 - Oscillator 2 instance with start/stop/update methods
 * @returns {Object} returns.osc3 - Oscillator 3 instance with start/stop/update methods
 * @returns {Object} returns.synthObj - Complete synth object for MIDI handling
 */
export function useAudio(audioContext: AudioContext | null) {
  const isMobile = useIsMobile();

  const {
    mixerNode,
    filterNode,
    loudnessEnvelopeGain,
    delayNode,
    delayMixGain,
    delayFeedbackGain,
    reverbNode,
    reverbMixGain,
    toneFilterNode,
    dryGain,
    effectsGain,
    masterGain,
    filterEnvelope,
  } = useAudioNodes(audioContext);

  // Set up noise, tuner, and aux output
  useNoiseAndAux(audioContext, mixerNode, masterGain);

  // Set up global modulation manager
  const modulationManager = useModulationManager(audioContext);

  // Memoize oscillator factory configurations to prevent recreation
  const osc1Config = useMemo(
    () => ({
      oscillatorKey: "oscillator1" as const,
      createOscillator: getOscillatorFactory("sawtooth")!,
      detuneCents: 2, // Slight detune for warmth
      volumeBoost: 1.2,
      oscillatorModulation: modulationManager,
    }),
    [modulationManager]
  );

  const osc2Config = useMemo(
    () => ({
      oscillatorKey: "oscillator2" as const,
      createOscillator: getOscillatorFactory("sawtooth")!,
      detuneCents: -1, // Counter detune
      volumeBoost: 1.0,
      oscillatorModulation: modulationManager,
    }),
    [modulationManager]
  );

  const osc3Config = useMemo(
    () => ({
      oscillatorKey: "oscillator3" as const,
      createOscillator: getOscillatorFactory("triangle")!,
      detuneCents: 0,
      volumeBoost: 1.0,
      oscillatorModulation: modulationManager,
    }),
    [modulationManager]
  );

  // Use the new oscillator factory system with modulation manager
  const osc1 = useOscillatorFactory(audioContext, mixerNode, osc1Config);
  const osc2 = useOscillatorFactory(audioContext, mixerNode, osc2Config);
  const osc3 = useOscillatorFactory(audioContext, mixerNode, osc3Config);

  // Memoize modulation configuration
  const modulationConfig = useMemo(
    () => ({
      audioContext,
      filterNode,
      osc1,
      osc2,
      osc3,
    }),
    [audioContext, filterNode, osc1, osc2, osc3]
  );

  // Set up modulation system and connect it to the modulation manager
  const { getModulationSignal } = useModulation(modulationConfig);

  // Connect the modulation signal function to the modulation manager
  useEffect(() => {
    if (modulationManager && getModulationSignal) {
      modulationManager.setModSignalFunction(getModulationSignal);
    }
  }, [modulationManager, getModulationSignal]);

  // Memoize envelope configuration
  const envelopeConfig = useMemo(
    () => ({
      audioContext,
      filterNode,
      loudnessEnvelopeGain,
      osc1,
      osc2,
      osc3,
      filterEnvelope, // Pass the filter envelope
    }),
    [
      audioContext,
      filterNode,
      loudnessEnvelopeGain,
      osc1,
      osc2,
      osc3,
      filterEnvelope,
    ]
  );

  // Set up envelopes and get synth object
  const synthObj = useEnvelopes(envelopeConfig);

  // Set up MIDI handling with the synth object (skip on mobile)
  useMidiHandling(synthObj, isMobile);

  return {
    mixerNode,
    filterNode,
    loudnessEnvelopeGain,
    delayNode,
    delayMixGain,
    delayFeedbackGain,
    reverbNode,
    reverbMixGain,
    toneFilterNode,
    dryGain,
    effectsGain,
    masterGain,
    osc1,
    osc2,
    osc3,
    synthObj,
  };
}
