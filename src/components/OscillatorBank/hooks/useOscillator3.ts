import { useEffect, useRef, useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";
import { createOscillator3, Osc3Instance } from "../audio/oscillator3";
import { noteToFrequency } from "@/utils/noteToFrequency";

type Oscillator3Waveform =
  | "triangle"
  | "rev_saw"
  | "sawtooth"
  | "pulse1"
  | "pulse2"
  | "pulse3";

export type UseOscillator3Result = {
  triggerAttack: (note: string) => void;
  triggerRelease: (note?: string) => void;
  getNode: () => OscillatorNode | null;
};

export function useOscillator3(
  audioContext: AudioContext | null,
  mixerNode?: AudioNode | null,
  vibratoAmount: number = 0
): UseOscillator3Result {
  const { oscillator3, mixer, glideOn, glideTime, masterTune, pitchWheel } =
    useSynthStore();
  const oscRef = useRef<Osc3Instance | null>(null);
  const lastFrequencyRef = useRef<number | null>(null);
  const lastNoteRef = useRef<string | null>(null);
  const vibratoLfoRef = useRef<OscillatorNode | null>(null);
  const vibratoGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (oscRef.current) {
      // Boost oscillator volume slightly for fatter sound
      const boostedVolume = Math.min(1, (mixer.osc3.volume / 10) * 1.1);
      oscRef.current.getGainNode().gain.value = mixer.osc3.enabled
        ? boostedVolume
        : 0;
    }
  }, [mixer.osc3.enabled, mixer.osc3.volume]);

  useEffect(() => {
    oscRef.current?.update({
      waveform: oscillator3.waveform as Oscillator3Waveform,
      range: oscillator3.range,
    });
  }, [oscillator3.waveform, oscillator3.range]);

  // Apply range changes to current frequency
  useEffect(() => {
    if (oscRef.current && lastFrequencyRef.current !== null) {
      oscRef.current.setFrequency(lastFrequencyRef.current);
    }
  }, [oscillator3.range]);

  const triggerAttack = useCallback(
    (note: string) => {
      if (!audioContext) return;

      if (!oscRef.current) {
        oscRef.current = createOscillator3(
          {
            audioContext,
            waveform: oscillator3.waveform as Oscillator3Waveform,
            frequency: oscillator3.frequency,
            range: oscillator3.range,
          },
          mixerNode ?? undefined
        );
      }

      lastNoteRef.current = note;
      // Clamp all parameters to prevent extreme values
      const clampedMasterTune = Math.max(-12, Math.min(12, masterTune)); // ±1 octave
      const clampedDetuneSemis = Math.max(
        -12,
        Math.min(12, oscillator3.frequency || 0)
      ); // ±1 octave
      const clampedPitchWheel = Math.max(0, Math.min(100, pitchWheel)); // 0-100 range
      const bendSemis = ((clampedPitchWheel - 50) / 50) * 2;
      // Add subtle detuning for fatter sound (osc3 slightly sharp)
      const detuneCents = 1; // 1 cent sharp

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
      oscillator3,
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
        Math.min(12, oscillator3.frequency || 0)
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
  }, [audioContext, masterTune, oscillator3.frequency, pitchWheel]);

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
