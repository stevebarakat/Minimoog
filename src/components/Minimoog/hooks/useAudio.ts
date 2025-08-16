import { useAudioNodes } from "./useAudioNodes";
import { useModulation } from "./useModulation";
import { useEnvelopes } from "./useEnvelopes";
import { useNoiseAndAux } from "./useNoiseAndAux";
import { useOscillator3Control } from "./useOscillator3Control";
import { useModulationManager } from "./useModulationManager";
import { useOscillatorFactory } from "@/components/OscillatorBank/hooks/useOscillatorFactory";
import { getOscillatorFactory } from "@/components/OscillatorBank/oscillatorRegistry";
import { useMidiHandling } from "@/components/Keyboard/hooks";

/**
 * Main audio hook that orchestrates the entire Minimoog audio system
 * Sets up and manages all audio nodes, oscillators, modulation, envelopes, and MIDI handling
 *
 * @param {AudioContext | null} audioContext - The Web Audio API context, or null if not initialized
 * @returns {Object} Audio system configuration containing all audio nodes and synth object
 * @returns {GainNode} returns.mixerNode - Main mixer node for combining oscillator outputs
 * @returns {null} returns.filterNode - Filter node (removed, returns null)
 * @returns {GainNode} returns.loudnessEnvelopeGain - Gain node controlled by loudness envelope
 * @returns {GainNode} returns.masterGain - Final output gain node
 * @returns {Object} returns.osc1 - Oscillator 1 instance with start/stop/update methods
 * @returns {Object} returns.osc2 - Oscillator 2 instance with start/stop/update methods
 * @returns {Object} returns.osc3 - Oscillator 3 instance with start/stop/update methods
 * @returns {Object} returns.synthObj - Complete synth object for MIDI handling
 */
export function useAudio(audioContext: AudioContext | null) {
  const {
    mixerNode,
    saturationNode,
    filterNode,
    loudnessEnvelopeGain,
    masterGain,
    filterEnvelope,
  } = useAudioNodes(audioContext);

  // Set up noise, tuner, and aux output
  useNoiseAndAux(audioContext, mixerNode, masterGain);

  // Set up global modulation manager
  const modulationManager = useModulationManager(audioContext);

  // Use the new oscillator factory system with modulation manager
  const osc1 = useOscillatorFactory(audioContext, mixerNode, {
    oscillatorKey: "oscillator1",
    createOscillator: getOscillatorFactory("sawtooth")!,
    detuneCents: 2, // Slight detune for warmth
    volumeBoost: 1.2,
    oscillatorModulation: modulationManager,
  });

  const osc2 = useOscillatorFactory(audioContext, mixerNode, {
    oscillatorKey: "oscillator2",
    createOscillator: getOscillatorFactory("sawtooth")!,
    detuneCents: -1, // Counter detune
    volumeBoost: 1.0,
    oscillatorModulation: modulationManager,
  });

  const osc3 = useOscillatorFactory(audioContext, mixerNode, {
    oscillatorKey: "oscillator3",
    createOscillator: getOscillatorFactory("triangle")!,
    detuneCents: 0,
    volumeBoost: 1.0,
    oscillatorModulation: modulationManager,
  });

  // Set up OSC 3 control (free-running when released from keyboard control)
  const osc3ControlHook = useOscillator3Control(audioContext, osc3, mixerNode);

  // Set up modulation system and connect it to the modulation manager
  useModulation({
    audioContext,
    osc1,
    osc2,
    osc3,
    filterNode,
    osc3Control: osc3ControlHook,
    modulationManager,
  });

  // Set up envelopes and get synth object
  const synthObj = useEnvelopes({
    audioContext,
    filterNode,
    loudnessEnvelopeGain,
    osc1,
    osc2,
    osc3,
    filterEnvelope, // Pass the filter envelope
  });

  // Set up MIDI handling with the synth object (pass null if not ready)
  useMidiHandling(synthObj);

  return {
    mixerNode,
    saturationNode,
    filterNode,
    loudnessEnvelopeGain,
    masterGain,
    osc1,
    osc2,
    osc3,
    synthObj,
  };
}
