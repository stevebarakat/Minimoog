import { useEffect, useRef, useState } from "react";
import { getPooledNode, releaseNode } from "@/utils/data";

export function useCoreAudioNodes(audioContext: AudioContext | null) {
  const [isMixerReady, setIsMixerReady] = useState(false);

  const mixerNodeRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const loudnessEnvelopeGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!audioContext) {
      cleanupCoreNodes();
      setIsMixerReady(false);
      return;
    }

    createCoreNodes(audioContext);
    setIsMixerReady(true);

    return cleanupCoreNodes;
  }, [audioContext]);

  function cleanupCoreNodes() {
    if (mixerNodeRef.current) {
      releaseNode(mixerNodeRef.current);
      mixerNodeRef.current = null;
    }
    if (masterGainRef.current) {
      releaseNode(masterGainRef.current);
      masterGainRef.current = null;
    }
    if (loudnessEnvelopeGainRef.current) {
      releaseNode(loudnessEnvelopeGainRef.current);
      loudnessEnvelopeGainRef.current = null;
    }
    setIsMixerReady(false);
  }

  function createCoreNodes(ctx: AudioContext) {
    mixerNodeRef.current = getPooledNode("gain", ctx) as GainNode;
    masterGainRef.current = getPooledNode("gain", ctx) as GainNode;
    loudnessEnvelopeGainRef.current = getPooledNode("gain", ctx) as GainNode;

    if (loudnessEnvelopeGainRef.current) {
      // Set initial envelope gain to 1 so audio can pass through
      loudnessEnvelopeGainRef.current.gain.setValueAtTime(1, ctx.currentTime);
    }

    if (masterGainRef.current) {
      masterGainRef.current.connect(ctx.destination);
      // Set master gain to 1 so audio can pass through
      masterGainRef.current.gain.setValueAtTime(1, ctx.currentTime);
    }
  }

  return {
    mixerNode: mixerNodeRef.current,
    masterGain: masterGainRef.current,
    loudnessEnvelopeGain: loudnessEnvelopeGainRef.current,
    isMixerReady,
  };
}
