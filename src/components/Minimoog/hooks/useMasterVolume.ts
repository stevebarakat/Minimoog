import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";

type MasterVolumeProps = {
  audioContext: AudioContext | null;
  masterGain: GainNode | null;
  mixerNode: GainNode | null;
};

export function useMasterVolume({
  audioContext,
  masterGain,
  mixerNode,
}: MasterVolumeProps) {
  const { mainVolume, isMainActive } = useSynthStore();

  useEffect(() => {
    if (!masterGain || !audioContext) return;

    const validVolume = isFinite(mainVolume)
      ? Math.max(0, Math.min(10, mainVolume))
      : 2;
    const gain = Math.pow(validVolume / 10, 2);
    const validGain = isFinite(gain) ? Math.max(0, Math.min(1, gain)) : 0.04;

    try {
      masterGain.gain.setValueAtTime(validGain, audioContext.currentTime);
    } catch (error) {
      console.error("Error setting master volume:", error, {
        mainVolume,
        validVolume,
        gain,
        validGain,
        isFinite: isFinite(validGain),
      });
    }
  }, [mainVolume, audioContext, masterGain]);

  useEffect(() => {
    if (!audioContext || !mixerNode) return;

    try {
      if (!isMainActive) {
        mixerNode.gain.setValueAtTime(0, audioContext.currentTime);
      } else {
        mixerNode.gain.setValueAtTime(1, audioContext.currentTime);
      }
    } catch (error) {
      console.error("Error setting mixer volume:", error, {
        isMainActive,
        currentTime: audioContext.currentTime,
      });
    }
  }, [isMainActive, audioContext, mixerNode]);
}
