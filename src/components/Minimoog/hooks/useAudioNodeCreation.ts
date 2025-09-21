import { useEffect } from "react";
import { useCoreAudioNodes } from "./useCoreAudioNodes";
import { useEffectsNodes } from "./useEffectsNodes";
import { useFilterNode } from "./useFilterNode";

// Main hook that orchestrates all audio nodes
export function useAudioNodeCreation(audioContext: AudioContext | null) {
  const coreNodes = useCoreAudioNodes(audioContext);
  const effectsNodes = useEffectsNodes(audioContext);
  const filterNode = useFilterNode(
    audioContext,
    coreNodes.mixerNode,
    coreNodes.loudnessEnvelopeGain
  );

  // Connect the complete audio chain
  useEffect(() => {
    if (
      !coreNodes.isMixerReady ||
      !coreNodes.loudnessEnvelopeGain ||
      !effectsNodes.dryGain ||
      !effectsNodes.effectsGain ||
      !coreNodes.masterGain ||
      !effectsNodes.delayMixGain ||
      !effectsNodes.reverbMixGain
    ) {
      return;
    }

    // Split signal: loudness envelope -> dry gain + delay mix gain + reverb mix gain
    coreNodes.loudnessEnvelopeGain!.connect(effectsNodes.dryGain!);
    coreNodes.loudnessEnvelopeGain!.connect(effectsNodes.delayMixGain!);
    coreNodes.loudnessEnvelopeGain!.connect(effectsNodes.reverbMixGain!);

    // Dry path: dry gain -> master gain (bypass effects gain)
    effectsNodes.dryGain!.connect(coreNodes.masterGain!);

    // Effects path: effects gain -> master gain
    effectsNodes.effectsGain!.connect(coreNodes.masterGain!);
  }, [
    coreNodes.isMixerReady,
    coreNodes.loudnessEnvelopeGain,
    coreNodes.masterGain,
    effectsNodes.dryGain,
    effectsNodes.delayMixGain,
    effectsNodes.reverbMixGain,
    effectsNodes.effectsGain,
  ]);

  return {
    ...coreNodes,
    ...effectsNodes,
    ...filterNode,
  };
}
