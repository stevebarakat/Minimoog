import { useSynthStore } from "@/store/synthStore";
import { useAudioNodes } from "./useAudioNodes";
import { SYNTH_PARAMS } from "@/config";
import { useModulation } from "./useModulation";
import { useEnvelopes } from "./useEnvelopes";
import { useOverflowDirection } from "./useOverflowDirection";
import { useNoiseAndAux } from "./useNoiseAndAux";
import { useOscillators } from "./useOscillators";
import { useMidiHandling } from "@/components/Keyboard/hooks";

export function useAudio(audioContext: AudioContext | null) {
  const { mixerNode, filterNode, loudnessEnvelopeGain, masterGain } =
    useAudioNodes(audioContext);
  const containerRef = useOverflowDirection();

  // Set up noise, tuner, and aux output
  useNoiseAndAux(audioContext, mixerNode, masterGain);

  // Vibrato amount
  const vibratoAmount = useSynthStore((state) => {
    if (!state.oscillatorModulationOn || state.modWheel <= 0) return 0;
    const clampedModWheel = Math.max(
      SYNTH_PARAMS.MOD_WHEEL.MIN,
      Math.min(SYNTH_PARAMS.MOD_WHEEL.MAX, state.modWheel)
    );
    return clampedModWheel / SYNTH_PARAMS.MOD_WHEEL.MAX;
  });

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
    containerRef,
    osc1,
    osc2,
    osc3,
    synthObj,
  };
}
