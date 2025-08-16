import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapEnvelopeTime } from "@/utils";
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
          // Long release - let envelope control volume, stop oscillators after
          loudnessEnvelopeGain.gain.cancelScheduledValues(now);
          const currentGain = loudnessEnvelopeGain.gain.value;
          loudnessEnvelopeGain.gain.setValueAtTime(currentGain, now);
          loudnessEnvelopeGain.gain.linearRampToValueAtTime(
            0,
            now + loudnessDecayTime
          );

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

          loudnessEnvelopeGain.gain.cancelScheduledValues(now);
          const currentGain = loudnessEnvelopeGain.gain.value;
          // Add a small release time to prevent popping
          const releaseTime = Math.max(0.01, loudnessDecayTime * 0.1); // At least 10ms
          loudnessEnvelopeGain.gain.setValueAtTime(currentGain, now);
          loudnessEnvelopeGain.gain.linearRampToValueAtTime(
            0,
            now + releaseTime
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
    loudnessAttackTime,
    loudnessDecayTime,
    loudnessSustainLevel,
  ]);

  return loudnessEnvelope;
}
