import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { useLoudnessEnvelope } from "./useLoudnessEnvelope";
import type { EnvelopeProps } from "@/types";

/**
 * Hook that manages both filter and loudness envelopes for the Minimoog
 * Creates a unified synth object that handles note triggering and release
 *
 * @param {EnvelopeProps} props - Configuration for envelope setup
 * @param {AudioContext | null} props.audioContext - The Web Audio API context
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
  loudnessEnvelopeGain,
  osc1,
  osc2,
  osc3,
  filterEnvelope, // Accept the filter envelope
}: EnvelopeProps) {
  const glideOn = useSynthStore((state) => state.glideOn);
  const osc3Control = useSynthStore((state) => state.osc3Control);

  // Use the passed filter envelope instead of creating a new one
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

        // OSC 3 Control: When OFF, OSC 3 is released from keyboard control
        if (osc3Control) {
          osc3?.triggerAttack?.(note);
        }

        // Trigger envelopes (only if they exist)
        filterEnvelope?.triggerAttack?.();
        loudnessEnvelope.triggerAttack();
      },

      /**
       * Triggers the release phase for all envelopes
       * Envelopes handle the timing of oscillator release
       * When glide is enabled, oscillators are not stopped immediately
       */
      triggerRelease: () => {
        // Trigger envelopes (they handle oscillator release timing)
        filterEnvelope?.triggerRelease?.();
        loudnessEnvelope.triggerRelease();

        // If glide is not enabled, stop oscillators immediately
        // If glide is enabled, let the envelopes handle the timing
        if (!glideOn) {
          // Force stop oscillators when glide is off
          osc1?.triggerRelease?.();
          osc2?.triggerRelease?.();

          // OSC 3 Control: When OFF, OSC 3 is released from keyboard control
          if (osc3Control) {
            osc3?.triggerRelease?.();
          }
        }
      },
    };
  }, [
    osc1,
    osc2,
    osc3,
    filterEnvelope,
    loudnessEnvelope,
    glideOn,
    osc3Control,
  ]);

  return synthObj;
}
