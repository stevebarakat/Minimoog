import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { clampParameter } from "@/utils/audioUtils";
import { OSCILLATOR, SYNTH_PARAMS } from "@/config";

type OscillatorParametersProps = {
  oscillatorKey: "oscillator1" | "oscillator2" | "oscillator3";
  mixerKey: "osc1" | "osc2" | "osc3";
  volumeBoost: number;
  vibratoAmount: number;
};

// Utility functions
const calculateGlideTime = (glideTime: number): number => {
  return (
    Math.pow(10, glideTime / OSCILLATOR.GLIDE_TIME_POWER) *
    OSCILLATOR.GLIDE_TIME_MULTIPLIER
  );
};

const calculateVolume = (volume: number, volumeBoost: number): number => {
  return Math.min(1, (volume / SYNTH_PARAMS.VOLUME.MAX) * volumeBoost);
};

export function useOscillatorParameters({
  oscillatorKey,
  mixerKey,
  volumeBoost,
  vibratoAmount,
}: OscillatorParametersProps) {
  const oscillatorState = useSynthStore((state) => state[oscillatorKey]);
  const mixerState = useSynthStore((state) => state.mixer[mixerKey]);
  const { glideOn, glideTime, masterTune, pitchWheel } = useSynthStore();

  // Memoize clamped parameters to prevent recalculation
  const clampedParams = useMemo(
    () => ({
      masterTune: clampParameter(masterTune, -12, 12),
      detuneSemis: clampParameter(oscillatorState.frequency || 0, -12, 12),
      pitchWheel: clampParameter(pitchWheel, 0, 100),
      vibratoAmount: clampParameter(vibratoAmount, 0, 2),
    }),
    [masterTune, oscillatorState.frequency, pitchWheel, vibratoAmount]
  );

  // Memoize glide time calculation
  const mappedGlideTime = useMemo(
    () => calculateGlideTime(glideTime),
    [glideTime]
  );

  // Memoize volume calculation
  const boostedVolume = useMemo(
    () => calculateVolume(mixerState.volume, volumeBoost),
    [mixerState.volume, volumeBoost]
  );

  // Memoize oscillator configuration
  const oscillatorConfig = useMemo(
    () => ({
      waveform: oscillatorState.waveform as OscillatorType,
      range: oscillatorState.range,
    }),
    [oscillatorState.waveform, oscillatorState.range]
  );

  return {
    clampedParams,
    mappedGlideTime,
    boostedVolume,
    oscillatorConfig,
    oscillatorState,
    mixerState,
    glideOn,
  };
}
