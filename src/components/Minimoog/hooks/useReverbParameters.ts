import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";

type ReverbParametersProps = {
  audioContext: AudioContext | null;
  reverbMixGain: GainNode | null;
  dryGain: GainNode | null;
  reverbToneFilter: BiquadFilterNode | null;
};

export function useReverbParameters({
  audioContext,
  reverbMixGain,
  dryGain,
  reverbToneFilter,
}: ReverbParametersProps) {
  const { reverb } = useSynthStore();

  useEffect(() => {
    if (!reverbMixGain || !dryGain || !audioContext) return;

    try {
      const baseMix = reverb.enabled ? reverb.mix / 10 : 0;
      const wetLevel = baseMix;
      const dryLevel = Math.max(0, 1 - wetLevel);

      reverbMixGain.gain.setTargetAtTime(
        wetLevel,
        audioContext.currentTime,
        0.01
      );

      dryGain.gain.setTargetAtTime(dryLevel, audioContext.currentTime, 0.01);
    } catch (error) {
      console.error("Error adjusting reverb mix:", error, {
        reverbMix: reverb.mix,
        currentTime: audioContext.currentTime,
      });
    }
  }, [reverb.enabled, reverb.mix, audioContext, reverbMixGain, dryGain]);

  useEffect(() => {
    if (!reverbToneFilter || !audioContext || !reverb.enabled) return;

    try {
      const frequency = 200 + (reverb.tone / 10) * 1800;
      reverbToneFilter.frequency.setValueAtTime(
        frequency,
        audioContext.currentTime
      );
    } catch (error) {
      console.error("Error updating reverb tone filter:", error);
    }
  }, [reverb.tone, reverb.enabled, audioContext, reverbToneFilter]);
}
