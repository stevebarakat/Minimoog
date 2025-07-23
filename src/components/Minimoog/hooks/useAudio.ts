import { useAudioNodes } from "./useAudioNodes";
import { useModulation } from "./useModulation";
import { useEnvelopes } from "./useEnvelopes";
import { useNoiseAndAux } from "./useNoiseAndAux";
import { useOscillators } from "./useOscillators";
import { useVibratoCalculation } from "./useVibratoCalculation";
import { useMidiHandling } from "@/components/Keyboard/hooks";

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
