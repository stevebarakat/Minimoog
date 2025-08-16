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
    masterGain,
    mixerNode,
  });

  return {
    mixerNode,
    saturationNode,
    filterNode,
    loudnessEnvelopeGain,
    masterGain,
    isMixerReady,
    filterEnvelope,
  };
}
