import { useSynthStore } from "@/store/synthStore";
import { SYNTH_PARAMS } from "@/config";

export function useVibratoCalculation() {
  const vibratoAmount = useSynthStore((state) => {
    if (!state.oscillatorModulationOn || state.modWheel <= 0) return 0;
    const clampedModWheel = Math.max(
      SYNTH_PARAMS.MOD_WHEEL.MIN,
      Math.min(SYNTH_PARAMS.MOD_WHEEL.MAX, state.modWheel)
    );
    return clampedModWheel / SYNTH_PARAMS.MOD_WHEEL.MAX;
  });

  return vibratoAmount;
}
