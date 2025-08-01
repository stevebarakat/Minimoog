import { useAudioNodeCreation } from "./useAudioNodeCreation";
import { useAudioNodeParameters } from "./useAudioNodeParameters";
import { AudioNodes } from "../types/synthTypes";

export function useAudioNodes(audioContext: AudioContext | null): AudioNodes {
  const {
    mixerNode,
    filterNode,
    loudnessEnvelopeGain,
    masterGain,
    isMixerReady,
  } = useAudioNodeCreation(audioContext);

  // Handle parameter updates
  useAudioNodeParameters({
    audioContext,
    filterNode,
    masterGain,
    mixerNode,
  });

  return {
    mixerNode,
    filterNode,
    loudnessEnvelopeGain,
    masterGain,
    isMixerReady,
  };
}
