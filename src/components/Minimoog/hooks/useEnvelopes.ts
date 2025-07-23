import { useMemo } from "react";
import { useFilterEnvelope } from "./useFilterEnvelope";
import { useLoudnessEnvelope } from "./useLoudnessEnvelope";
import type { EnvelopeProps } from "../types/synthTypes";

export function useEnvelopes({
  audioContext,
  filterNode,
  loudnessEnvelopeGain,
  osc1,
  osc2,
  osc3,
}: EnvelopeProps) {
  const filterEnvelope = useFilterEnvelope({
    audioContext,
    filterNode,
  });

  const loudnessEnvelope = useLoudnessEnvelope({
    audioContext,
    loudnessEnvelopeGain,
    osc1,
    osc2,
    osc3,
  });

  const synthObj = useMemo(() => {
    return {
      triggerAttack: (note: string) => {
        // Trigger oscillators
        osc1?.triggerAttack?.(note);
        osc2?.triggerAttack?.(note);
        osc3?.triggerAttack?.(note);

        // Trigger envelopes
        filterEnvelope.triggerAttack();
        loudnessEnvelope.triggerAttack();
      },
      triggerRelease: () => {
        // Trigger envelopes (they handle oscillator release timing)
        filterEnvelope.triggerRelease();
        loudnessEnvelope.triggerRelease();
      },
    };
  }, [osc1, osc2, osc3, filterEnvelope, loudnessEnvelope]);

  return synthObj;
}
