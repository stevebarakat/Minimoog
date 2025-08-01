import { useMemo } from "react";
import { useFilterEnvelope } from "./useFilterEnvelope";
import { useLoudnessEnvelope } from "./useLoudnessEnvelope";
import type { EnvelopeProps } from "../types/synthTypes";

/**
 * Hook that manages both filter and loudness envelopes for the Minimoog
 * Creates a unified synth object that handles note triggering and release
 *
 * @param {EnvelopeProps} props - Configuration for envelope setup
 * @param {AudioContext | null} props.audioContext - The Web Audio API context
 * @param {BiquadFilterNode | null} props.filterNode - The filter node to control
 * @param {GainNode | null} props.loudnessEnvelopeGain - The gain node for loudness envelope
 * @param {Object} props.osc1 - Oscillator 1 instance with triggerAttack method
 * @param {Object} props.osc2 - Oscillator 2 instance with triggerAttack method
 * @param {Object} props.osc3 - Oscillator 3 instance with triggerAttack method
 * @returns {Object} Synth object with triggerAttack and triggerRelease methods
 * @returns {Function} returns.triggerAttack - Triggers attack phase for all oscillators and envelopes
 * @returns {Function} returns.triggerRelease - Triggers release phase for all envelopes
 *
 * @example
 * ```typescript
 * const synth = useEnvelopes({
 *   audioContext,
 *   filterNode,
 *   loudnessEnvelopeGain,
 *   osc1, osc2, osc3
 * });
 *
 * // Trigger a note
 * synth.triggerAttack('A4');
 *
 * // Release the note
 * synth.triggerRelease();
 * ```
 */
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
      /**
       * Triggers the attack phase for all oscillators and envelopes
       * @param {string} note - The note to trigger (e.g., 'A4', 'C#5')
       */
      triggerAttack: (note: string) => {
        // Trigger oscillators
        osc1?.triggerAttack?.(note);
        osc2?.triggerAttack?.(note);
        osc3?.triggerAttack?.(note);

        // Trigger envelopes
        filterEnvelope.triggerAttack();
        loudnessEnvelope.triggerAttack();
      },

      /**
       * Triggers the release phase for all envelopes
       * Envelopes handle the timing of oscillator release
       */
      triggerRelease: () => {
        // Trigger envelopes (they handle oscillator release timing)
        filterEnvelope.triggerRelease();
        loudnessEnvelope.triggerRelease();
      },
    };
  }, [osc1, osc2, osc3, filterEnvelope, loudnessEnvelope]);

  return synthObj;
}
