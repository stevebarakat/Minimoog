import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapEnvelopeTime } from "@/utils/paramMappingUtils";
import {
  scheduleEnvelopeAttack,
  scheduleEnvelopeRelease,
} from "@/utils/envelopeUtils";

type OscillatorInstance = {
  triggerAttack?: (note: string) => void;
  triggerRelease?: () => void;
};

type LoudnessEnvelopeProps = {
  audioContext: AudioContext | null;
  loudnessEnvelopeGain: GainNode | null;
  osc1: OscillatorInstance | null;
  osc2: OscillatorInstance | null;
  osc3: OscillatorInstance | null;
};

export function useLoudnessEnvelope({
  audioContext,
  loudnessEnvelopeGain,
  osc1,
  osc2,
  osc3,
}: LoudnessEnvelopeProps) {
  const { decaySwitchOn, loudnessAttack, loudnessDecay, loudnessSustain } =
    useSynthStore();

  // Precompute envelope times with conversion
  const loudnessAttackTime = mapEnvelopeTime(loudnessAttack);
  const loudnessDecayTime = mapEnvelopeTime(loudnessDecay);
  const loudnessSustainLevel = loudnessSustain / 10;

  const loudnessEnvelope = useMemo(() => {
    return {
      triggerAttack: () => {
        if (!audioContext || !loudnessEnvelopeGain) {
          return;
        }

        const now = audioContext.currentTime;
        const startGain = loudnessEnvelopeGain.gain.value;

        scheduleEnvelopeAttack(loudnessEnvelopeGain.gain, {
          start: startGain,
          peak: 1,
          sustain: loudnessSustainLevel,
          attackTime: loudnessAttackTime,
          decayTime: loudnessDecayTime,
          now,
        });
      },

      triggerRelease: () => {
        if (!audioContext || !loudnessEnvelopeGain) {
          return;
        }

        const now = audioContext.currentTime;

        if (decaySwitchOn) {
          // Long release - let envelope control volume, stop oscillators after
          const currentGain = loudnessEnvelopeGain.gain.value;

          scheduleEnvelopeRelease(loudnessEnvelopeGain.gain, {
            from: currentGain,
            to: 0,
            releaseTime: loudnessDecayTime,
            now,
          });

          // Stop oscillators after the envelope finishes
          setTimeout(() => {
            osc1?.triggerRelease?.();
            osc2?.triggerRelease?.();
            osc3?.triggerRelease?.();
          }, loudnessDecayTime * 1000);
        } else {
          // Immediate cutoff - stop oscillators right away
          osc1?.triggerRelease?.();
          osc2?.triggerRelease?.();
          osc3?.triggerRelease?.();

          const currentGain = loudnessEnvelopeGain.gain.value;
          const releaseTime = 0.01; // Short 10ms release when decay switch is off

          scheduleEnvelopeRelease(loudnessEnvelopeGain.gain, {
            from: currentGain,
            to: 0,
            releaseTime,
            now,
          });
        }
      },
    };
  }, [
    audioContext,
    loudnessEnvelopeGain,
    osc1,
    osc2,
    osc3,
    decaySwitchOn,
    loudnessAttackTime,
    loudnessDecayTime,
    loudnessSustainLevel,
  ]);

  return loudnessEnvelope;
}
