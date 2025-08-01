import { useAudioNodes } from "./useAudioNodes";
import { useModulation } from "./useModulation";
import { useEnvelopes } from "./useEnvelopes";
import { useNoiseAndAux } from "./useNoiseAndAux";
import { useOscillators } from "./useOscillators";
import { useVibratoCalculation } from "./useVibratoCalculation";
import { useMidiHandling } from "@/components/Keyboard/hooks";

/**
 * Main audio hook that orchestrates the entire Minimoog audio system
 * Sets up and manages all audio nodes, oscillators, modulation, envelopes, and MIDI handling
 *
 * @param {AudioContext | null} audioContext - The Web Audio API context, or null if not initialized
 * @returns {Object} Audio system configuration containing all audio nodes and synth object
 * @returns {GainNode} returns.mixerNode - Main mixer node for combining oscillator outputs
 * @returns {BiquadFilterNode} returns.filterNode - 4-pole ladder filter node
 * @returns {GainNode} returns.loudnessEnvelopeGain - Gain node controlled by loudness envelope
 * @returns {GainNode} returns.masterGain - Final output gain node
 * @returns {Object} returns.osc1 - Oscillator 1 instance with start/stop/update methods
 * @returns {Object} returns.osc2 - Oscillator 2 instance with start/stop/update methods
 * @returns {Object} returns.osc3 - Oscillator 3 instance with start/stop/update methods
 * @returns {Object} returns.synthObj - Complete synth object for MIDI handling
 */
export function useAudio(audioContext: AudioContext | null) {
  const { mixerNode, filterNode, loudnessEnvelopeGain, masterGain } =
    useAudioNodes(audioContext);

  // Set up noise, tuner, and aux output
  useNoiseAndAux(audioContext, mixerNode, masterGain);

  // Get vibrato amount from focused hook
  const vibratoAmount = useVibratoCalculation();

  // Use the new useOscillators hook
  const { osc1, osc2, osc3 } = useOscillators(
    audioContext && mixerNode ? audioContext : null,
    audioContext && mixerNode instanceof GainNode ? mixerNode : null,
    vibratoAmount
  );

  // Set up modulation
  useModulation({ audioContext, osc1, osc2, osc3, filterNode });

  // Set up envelopes and get synth object
  const synthObj = useEnvelopes({
    audioContext,
    filterNode,
    loudnessEnvelopeGain,
    osc1,
    osc2,
    osc3,
  });

  // Set up MIDI handling with the synth object
  useMidiHandling(synthObj);

  return {
    mixerNode,
    filterNode,
    loudnessEnvelopeGain,
    masterGain,
    osc1,
    osc2,
    osc3,
    synthObj,
  };
}
