import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapEnvelopeTime } from "@/utils/core";
import type { SimpleOscillator } from "@/types";

type LoudnessEnvelopeProps = {
  audioContext: AudioContext | null;
  loudnessEnvelopeGain: GainNode | null;
  osc1: SimpleOscillator | null;
  osc2: SimpleOscillator | null;
  osc3: SimpleOscillator | null;
};

export function useLoudnessEnvelope({
  audioContext,
  loudnessEnvelopeGain,
  osc1,
  osc2,
  osc3,
}: LoudnessEnvelopeProps) {
  const {
    decaySwitchOn,
    loudnessAttack,
    loudnessDecay,
    loudnessSustain,
    glideOn,
  } = useSynthStore();

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
        loudnessEnvelopeGain.gain.cancelScheduledValues(now);

        // For smooth note transitions, start from current gain if it's not zero
        const currentGain = loudnessEnvelopeGain.gain.value;
        const startGain = currentGain > 0.01 ? currentGain * 0.3 : 0; // Smooth transition

        loudnessEnvelopeGain.gain.setValueAtTime(startGain, now);
        loudnessEnvelopeGain.gain.linearRampToValueAtTime(
          1,
          now + loudnessAttackTime
        );
        loudnessEnvelopeGain.gain.linearRampToValueAtTime(
          loudnessSustainLevel,
          now + loudnessAttackTime + loudnessDecayTime
        );
      },

      triggerRelease: () => {
        if (!audioContext || !loudnessEnvelopeGain) {
          return;
        }

        const now = audioContext.currentTime;

        if (decaySwitchOn) {
          loudnessEnvelopeGain.gain.cancelScheduledValues(now);
          const currentGain = loudnessEnvelopeGain.gain.value;

          const rampTime = 0.002;

          loudnessEnvelopeGain.gain.setValueAtTime(currentGain, now);
          loudnessEnvelopeGain.gain.linearRampToValueAtTime(
            0,
            now + rampTime + loudnessDecayTime
          );

          if (!glideOn) {
            setTimeout(() => {
              osc1?.triggerRelease?.();
              osc2?.triggerRelease?.();
              osc3?.triggerRelease?.();
            }, (rampTime + loudnessDecayTime) * 1000);
          }
        } else {
          if (!glideOn) {
            osc1?.triggerRelease?.();
            osc2?.triggerRelease?.();
            osc3?.triggerRelease?.();
          }

          loudnessEnvelopeGain.gain.cancelScheduledValues(now);
          const currentGain = loudnessEnvelopeGain.gain.value;
          const releaseTime = Math.max(0.005, loudnessDecayTime * 0.1);

          const rampTime = 0.002;

          loudnessEnvelopeGain.gain.setValueAtTime(currentGain, now);
          loudnessEnvelopeGain.gain.linearRampToValueAtTime(
            0,
            now + rampTime + releaseTime
          );
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
    glideOn,
    loudnessAttackTime,
    loudnessDecayTime,
    loudnessSustainLevel,
  ]);

  return loudnessEnvelope;
}
