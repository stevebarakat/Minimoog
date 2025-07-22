import { useEffect, useRef, useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";
import { createOscillator1, Osc1Instance } from "../audio/oscillator1";
import { noteToFrequency } from "@/utils/noteToFrequency";

export type UseOscillator1Result = {
  triggerAttack: (note: string) => void;
  triggerRelease: () => void;
  getNode: () => OscillatorNode | null;
};

export function useOscillator1(
  audioContext: AudioContext | null,
  mixerNode: GainNode | null,
  vibratoAmount: number = 0
): UseOscillator1Result {
  const oscillatorRef = useRef<Osc1Instance | null>(null);
  const { oscillator1, masterTune, glideOn, glideTime, pitchWheel } =
    useSynthStore();
  const lastFrequencyRef = useRef<number | null>(null);
  const lastNoteRef = useRef<string | null>(null);
  const { enabled, volume } = useSynthStore((s) => s.mixer.osc1);
  const vibratoLfoRef = useRef<OscillatorNode | null>(null);
  const vibratoGainRef = useRef<GainNode | null>(null);

  const triggerAttack = useCallback(
    (note: string) => {
      if (audioContext && mixerNode) {
        if (!oscillatorRef.current) {
          oscillatorRef.current = createOscillator1(
            {
              audioContext,
              waveform: oscillator1.waveform as
                | "triangle"
                | "tri_saw"
                | "sawtooth"
                | "pulse1"
                | "pulse2"
                | "pulse3",
              range: oscillator1.range,
              gain: oscillator1.enabled ? 1 : 0,
            },
            mixerNode
          );
        }
        lastNoteRef.current = note;
        // Clamp all parameters to prevent extreme values
        const clampedMasterTune = Math.max(-12, Math.min(12, masterTune)); // ±1 octave
        const clampedPitchWheel = Math.max(0, Math.min(100, pitchWheel)); // 0-100 range
        const bendSemis = ((clampedPitchWheel - 50) / 50) * 2;
        // Add subtle detuning for fatter sound (osc1 slightly sharp)
        const detuneCents = 2; // 2 cents sharp

        const baseFreq =
          noteToFrequency(note) * Math.pow(2, clampedMasterTune / 12);
        const frequency =
          baseFreq * Math.pow(2, (bendSemis + detuneCents / 100) / 12);

        // Final safety check to prevent extreme frequencies
        const safeFreq = Math.max(20, Math.min(22050, frequency));
        if (glideOn && lastFrequencyRef.current !== null) {
          oscillatorRef.current.start(lastFrequencyRef.current);
          const oscNode = oscillatorRef.current.getNode();
          if (oscNode) {
            const mappedGlideTime = Math.pow(10, glideTime / 5) * 0.02;
            oscNode.frequency.linearRampToValueAtTime(
              safeFreq,
              audioContext.currentTime + mappedGlideTime
            );
          }
        } else {
          oscillatorRef.current.start(safeFreq);
        }
        lastFrequencyRef.current = safeFreq;
        // Vibrato LFO
        if (vibratoAmount > 0 && oscillatorRef.current) {
          const oscNode = oscillatorRef.current.getNode();
          // Clean up previous LFO if any
          vibratoLfoRef.current?.disconnect();
          vibratoGainRef.current?.disconnect();
          vibratoLfoRef.current = null;
          vibratoGainRef.current = null;
          if (oscNode) {
            const lfo = audioContext.createOscillator();
            lfo.type = "sine";
            lfo.frequency.value = 6; // 6 Hz vibrato
            const lfoGain = audioContext.createGain();
            // 1 semitone = 2^(1/12) ~ 1.0595, so for small vibratoAmount, scale in Hz
            // Clamp vibratoAmount to prevent extreme values
            const clampedVibrato = Math.max(0, Math.min(2, vibratoAmount)); // Max 2 semitones
            lfoGain.gain.value =
              baseFreq * (Math.pow(2, clampedVibrato / 12) - 1);
            lfo.connect(lfoGain);
            lfoGain.connect(oscNode.frequency);
            lfo.start();
            vibratoLfoRef.current = lfo;
            vibratoGainRef.current = lfoGain;
          }
        }
      }
    },
    [
      audioContext,
      mixerNode,
      oscillator1,
      masterTune,
      glideOn,
      glideTime,
      pitchWheel,
      vibratoAmount,
    ]
  );

  const triggerRelease = useCallback(() => {
    // Clean up vibrato LFO
    vibratoLfoRef.current?.stop();
    vibratoLfoRef.current?.disconnect();
    vibratoGainRef.current?.disconnect();
    vibratoLfoRef.current = null;
    vibratoGainRef.current = null;
  }, []);

  useEffect(() => {
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        oscillatorRef.current = null;
      }
      // Clean up vibrato LFO
      vibratoLfoRef.current?.stop();
      vibratoLfoRef.current?.disconnect();
      vibratoGainRef.current?.disconnect();
      vibratoLfoRef.current = null;
      vibratoGainRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (oscillatorRef.current) {
      // Boost oscillator volume slightly for fatter sound
      const boostedVolume = Math.min(1, (volume / 10) * 1.2);
      oscillatorRef.current.getGainNode().gain.value = enabled
        ? boostedVolume
        : 0;
    }
  }, [enabled, volume]);

  useEffect(() => {
    if (oscillatorRef.current) {
      oscillatorRef.current.update({
        waveform: oscillator1.waveform,
        range: oscillator1.range,
      });
    }
  }, [oscillator1.waveform, oscillator1.range]);

  useEffect(() => {
    if (oscillatorRef.current && lastNoteRef.current) {
      // Clamp all parameters to prevent extreme values
      const clampedMasterTune = Math.max(-12, Math.min(12, masterTune)); // ±1 octave
      const clampedPitchWheel = Math.max(0, Math.min(100, pitchWheel)); // 0-100 range
      const bendSemis = ((clampedPitchWheel - 50) / 50) * 2;

      const baseFreq =
        noteToFrequency(lastNoteRef.current) *
        Math.pow(2, clampedMasterTune / 12);
      const frequency = baseFreq * Math.pow(2, bendSemis / 12);

      // Final safety check to prevent extreme frequencies
      const safeFreq = Math.max(20, Math.min(22050, frequency));

      const oscNode = oscillatorRef.current.getNode();
      if (oscNode && audioContext) {
        oscNode.frequency.linearRampToValueAtTime(
          safeFreq,
          audioContext.currentTime + 0.02
        );
      }
    }
  }, [audioContext, masterTune, oscillator1.frequency, pitchWheel]);

  return {
    triggerAttack,
    triggerRelease,
    getNode: () => oscillatorRef.current?.getNode() ?? null,
  };
}
