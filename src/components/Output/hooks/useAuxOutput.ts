import { useEffect, useRef } from "react";
import { useSynthStore } from "@/store/synthStore";
import { resetGain, getPooledNode, releaseNode } from "@/utils";

export function useAuxOutput(
  audioContext: AudioContext | null,
  inputNode?: AudioNode | null
) {
  const { auxOutput } = useSynthStore();
  const gainRef = useRef<GainNode | null>(null);

  // Convert linear volume (0-10) to logarithmic gain (0-1)
  const linearToLogGain = (linearVolume: number) => {
    const normalizedVolume = linearVolume / 10;
    return Math.pow(normalizedVolume, 1.5) * 0.9 + 0.1;
  };

  useEffect(() => {
    if (!audioContext) {
      gainRef.current = null;
      return;
    }
    if (!gainRef.current) {
      gainRef.current = getPooledNode("gain", audioContext) as GainNode;
      resetGain(gainRef.current, 0, audioContext); // Start muted
    }
    if (inputNode && gainRef.current) {
      inputNode.connect(gainRef.current);
    }
    return () => {
      if (gainRef.current) {
        releaseNode(gainRef.current);
        gainRef.current = null;
      }
    };
  }, [audioContext, inputNode]);

  useEffect(() => {
    if (gainRef.current && audioContext) {
      const newGain = auxOutput.enabled ? linearToLogGain(auxOutput.volume) : 0;
      if (isFinite(newGain)) {
        resetGain(gainRef.current, newGain, audioContext);
      } else {
        resetGain(gainRef.current, 0, audioContext);
      }
    }
  }, [auxOutput.enabled, auxOutput.volume, audioContext]);

  return {
    auxOutputNode: gainRef.current,
  };
}
