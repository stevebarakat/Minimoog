import { useAudioNodeCreation } from "./useAudioNodeCreation";
import { useAudioNodeParameters } from "./useAudioNodeParameters";
import { useFilterEnvelope } from "./useFilterEnvelope";
import { AudioNodes } from "@/types";

export function useAudioNodes(audioContext: AudioContext | null): AudioNodes {
  const {
    mixerNode,
    filterNode,
    loudnessEnvelopeGain,
    delayNode,
    delayMixGain,
    reverbNode,
    reverbToneFilter,
    reverbMixGain,
    dryGain,
    effectsGain,
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
    reverbNode,
    reverbToneFilter,
    delayMixGain,
    reverbMixGain,
    dryGain,
    effectsGain,
    masterGain,
    mixerNode,
  });

  return {
    mixerNode,
    filterNode,
    loudnessEnvelopeGain,
    delayNode,
    delayMixGain,
    reverbNode,
    reverbMixGain,
    dryGain,
    effectsGain,
    masterGain,
    isMixerReady,
    filterEnvelope,
  };
}
