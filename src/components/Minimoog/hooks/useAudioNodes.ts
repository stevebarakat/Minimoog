import { useAudioNodeCreation } from "./useAudioNodeCreation";
import { useAudioNodeParameters } from "./useAudioNodeParameters";
import { useFilterEnvelope } from "./useFilterEnvelope";
import { AudioNodes } from "@/types";

export function useAudioNodes(audioContext: AudioContext | null): AudioNodes {
  const {
    mixerNode,
    saturationNode,
    filterNode,
    loudnessEnvelopeGain,
    delayNode,
    delayMixGain,
    delayFeedbackGain,
    reverbNode,
    reverbMixGain,
    toneFilterNode,
    dryGain,
    masterGain,
    isMixerReady,
  } = useAudioNodeCreation(audioContext);

  // Create filter envelope
  const filterEnvelope = useFilterEnvelope({
    audioContext,
    filterNode,
  });

  // Handle parameter updates
  useAudioNodeParameters({
    audioContext,
    filterNode,
    delayNode,
    delayMixGain,
    delayFeedbackGain,
    reverbNode,
    reverbMixGain,
    toneFilterNode,
    dryGain,
    masterGain,
    mixerNode,
  });

  return {
    mixerNode,
    saturationNode,
    filterNode,
    loudnessEnvelopeGain,
    delayNode,
    delayMixGain,
    delayFeedbackGain,
    reverbNode,
    reverbMixGain,
    toneFilterNode,
    dryGain,
    masterGain,
    isMixerReady,
    filterEnvelope,
  };
}
