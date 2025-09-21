import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";

type EffectsVolumeProps = {
  audioContext: AudioContext | null;
  effectsGain: GainNode | null;
  dryGain: GainNode | null;
};

export function useEffectsVolume({
  audioContext,
  effectsGain,
  dryGain,
}: EffectsVolumeProps) {
  const { effectsVolume, delay, reverb } = useSynthStore();

  useEffect(() => {
    if (!effectsGain || !audioContext) return;

    const validVolume = isFinite(effectsVolume)
      ? Math.max(0, Math.min(10, effectsVolume))
      : 7;
    const gain = Math.pow(validVolume / 10, 2);
    const validGain = isFinite(gain) ? Math.max(0, Math.min(1, gain)) : 0.49;

    try {
      effectsGain.gain.setValueAtTime(validGain, audioContext.currentTime);
    } catch (error) {
      console.error("Error setting effects volume:", error, {
        effectsVolume,
        validVolume,
        gain,
        validGain,
        isFinite: isFinite(validGain),
      });
    }
  }, [effectsVolume, audioContext, effectsGain]);

  useEffect(() => {
    if (!dryGain || !audioContext) return;

    try {
      const effectsEnabled = delay.enabled || reverb.enabled;
      const dryGainValue = effectsEnabled ? 0.8 : 1.0;

      dryGain.gain.setValueAtTime(dryGainValue, audioContext.currentTime);
    } catch (error) {
      console.error("Error setting dry gain:", error, {
        delayEnabled: delay.enabled,
        reverbEnabled: reverb.enabled,
        currentTime: audioContext.currentTime,
      });
    }
  }, [delay.enabled, reverb.enabled, audioContext, dryGain]);
}
