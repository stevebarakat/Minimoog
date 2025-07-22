import { useEffect, useRef, useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";
import { createOscillator2, Osc2Instance } from "../audio/oscillator2";
import { OscillatorType } from "@/types";
import { noteToFrequency } from "@/utils/noteToFrequency";

export type UseOscillator2Result = {
  triggerAttack: (note: string) => void;
  triggerRelease: (note?: string) => void;
  getNode: () => OscillatorNode | null;
};

export function useOscillator2(
  audioContext: AudioContext | null,
  mixerNode?: AudioNode | null,
  vibratoAmount: number = 0
): UseOscillator2Result {
  const { oscillator2, mixer, glideOn, glideTime, masterTune, pitchWheel } =
    useSynthStore();
  const oscRef = useRef<Osc2Instance | null>(null);
  const lastFrequencyRef = useRef<number | null>(null);
  const lastNoteRef = useRef<string | null>(null);
  const vibratoLfoRef = useRef<OscillatorNode | null>(null);
  const vibratoGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (oscRef.current) {
      // Boost oscillator volume slightly for fatter sound
      const boostedVolume = Math.min(1, (mixer.osc2.volume / 10) * 1.15);
      oscRef.current.getGainNode().gain.value = mixer.osc2.enabled
        ? boostedVolume
        : 0;
    }
  }, [mixer.osc2.enabled, mixer.osc2.volume]);

  useEffect(() => {
    oscRef.current?.update({
      waveform: oscillator2.waveform as OscillatorType,
      range: oscillator2.range,
    });
  }, [oscillator2.waveform, oscillator2.range]);

  // Apply range changes to current frequency
  useEffect(() => {
    if (oscRef.current && lastFrequencyRef.current !== null) {
      oscRef.current.setFrequency(lastFrequencyRef.current);
    }
  }, [oscillator2.range]);

  const triggerAttack = useCallback(
    (note: string) => {
      if (!audioContext) return;

      if (!oscRef.current) {
        oscRef.current = createOscillator2(
          {
            audioContext,
            waveform: oscillator2.waveform as OscillatorType,
            frequency: oscillator2.frequency,
            range: oscillator2.range,
          },
          mixerNode ?? undefined
        );
      }

      lastNoteRef.current = note;
      // Clamp all parameters to prevent extreme values
      const clampedMasterTune = Math.max(-12, Math.min(12, masterTune)); // ±1 octave
      const clampedDetuneSemis = Math.max(
        -12,
        Math.min(12, oscillator2.frequency || 0)
      ); // ±1 octave
      const clampedPitchWheel = Math.max(0, Math.min(100, pitchWheel)); // 0-100 range
      const bendSemis = ((clampedPitchWheel - 50) / 50) * 2;
      // Add subtle detuning for fatter sound (osc2 slightly flat)
      const detuneCents = -3; // 3 cents flat

      const baseFreq =
        noteToFrequency(note) * Math.pow(2, clampedMasterTune / 12);
      const freq =
        baseFreq *
        Math.pow(2, (clampedDetuneSemis + bendSemis + detuneCents / 100) / 12);

      // Final safety check to prevent extreme frequencies
      const safeFreq = Math.max(20, Math.min(22050, freq));

      if (glideOn && lastFrequencyRef.current !== null) {
        oscRef.current.start(lastFrequencyRef.current);
        const oscNode = oscRef.current.getNode();
        if (oscNode) {
          const mappedGlideTime = Math.pow(10, glideTime / 5) * 0.02;
          oscNode.frequency.linearRampToValueAtTime(
            safeFreq,
            audioContext.currentTime + mappedGlideTime
          );
        }
      } else {
        oscRef.current.start(safeFreq);
      }
      lastFrequencyRef.current = safeFreq;
      // Vibrato LFO
      if (vibratoAmount > 0 && oscRef.current) {
        const oscNode = oscRef.current.getNode();
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
    },
    [
      audioContext,
      mixerNode,
      oscillator2,
      masterTune,
      pitchWheel,
      vibratoAmount,
      glideOn,
      glideTime,
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
    if (oscRef.current && lastNoteRef.current) {
      // Clamp all parameters to prevent extreme values
      const clampedMasterTune = Math.max(-12, Math.min(12, masterTune)); // ±1 octave
      const clampedDetuneSemis = Math.max(
        -12,
        Math.min(12, oscillator2.frequency || 0)
      ); // ±1 octave
      const clampedPitchWheel = Math.max(0, Math.min(100, pitchWheel)); // 0-100 range
      const bendSemis = ((clampedPitchWheel - 50) / 50) * 2;

      const baseFreq =
        noteToFrequency(lastNoteRef.current) *
        Math.pow(2, clampedMasterTune / 12);
      const freq =
        baseFreq * Math.pow(2, (clampedDetuneSemis + bendSemis) / 12);

      // Final safety check to prevent extreme frequencies
      const safeFreq = Math.max(20, Math.min(22050, freq));

      const oscNode = oscRef.current.getNode();
      if (oscNode && audioContext) {
        oscNode.frequency.linearRampToValueAtTime(
          safeFreq,
          audioContext.currentTime + 0.02
        );
      }
    }
  }, [audioContext, masterTune, oscillator2.frequency, pitchWheel]);

  useEffect(() => {
    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current = null;
      }
      // Clean up vibrato LFO
      vibratoLfoRef.current?.stop();
      vibratoLfoRef.current?.disconnect();
      vibratoGainRef.current?.disconnect();
      vibratoLfoRef.current = null;
      vibratoGainRef.current = null;
    };
  }, []);

  if (!audioContext) {
    return {
      triggerAttack: () => {},
      triggerRelease: () => {},
      getNode: () => null,
    };
  }

  return {
    triggerAttack,
    triggerRelease,
    getNode: () => oscRef.current?.getNode() ?? null,
  };
}
