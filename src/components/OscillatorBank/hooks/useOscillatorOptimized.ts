import { useEffect, useRef, useCallback, useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { noteToFrequency } from "@/utils/noteToFrequency";
import { OscillatorType } from "@/types";

export type UseOscillatorOptimizedResult = {
  triggerAttack: (note: string) => void;
  triggerRelease: (note?: string) => void;
  getNode: () => OscillatorNode | null;
};

// Memoized parameter clamping utility
const clampParameter = (value: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, value));
};

// Memoized frequency calculation utility
const calculateFrequency = (
  note: string,
  masterTune: number,
  detuneSemis: number,
  pitchWheel: number,
  detuneCents: number
): number => {
  const clampedMasterTune = clampParameter(masterTune, -12, 12);
  const clampedDetuneSemis = clampParameter(detuneSemis, -12, 12);
  const clampedPitchWheel = clampParameter(pitchWheel, 0, 100);
  const bendSemis = ((clampedPitchWheel - 50) / 50) * 2;

  const baseFreq = noteToFrequency(note) * Math.pow(2, clampedMasterTune / 12);
  const frequency =
    baseFreq *
    Math.pow(2, (clampedDetuneSemis + bendSemis + detuneCents / 100) / 12);

  // Final safety check to prevent extreme frequencies
  return clampParameter(frequency, 20, 22050);
};

// Memoized glide time calculation
const calculateGlideTime = (glideTime: number): number => {
  return Math.pow(10, glideTime / 5) * 0.02;
};

// Memoized volume calculation
const calculateVolume = (volume: number, volumeBoost: number): number => {
  return Math.min(1, (volume / 10) * volumeBoost);
};

// Memoized vibrato amount calculation
const calculateVibratoAmount = (
  oscillatorModulationOn: boolean,
  modWheel: number
): number => {
  if (!oscillatorModulationOn || modWheel <= 0) return 0;
  const clampedModWheel = clampParameter(modWheel, 0, 100);
  return clampedModWheel / 100;
};

export function useOscillatorOptimized(
  audioContext: AudioContext | null,
  mixerNode: GainNode | null,
  oscillatorKey: "oscillator1" | "oscillator2" | "oscillator3",
  mixerKey: "osc1" | "osc2" | "osc3",
  detuneCents: number,
  volumeBoost: number,
  createOscillator: (config: any, mixerNode?: AudioNode) => any
): UseOscillatorOptimizedResult {
  const oscillatorState = useSynthStore((state) => state[oscillatorKey]);
  const mixerState = useSynthStore((state) => state.mixer[mixerKey]);
  const {
    glideOn,
    glideTime,
    masterTune,
    pitchWheel,
    oscillatorModulationOn,
    modWheel,
  } = useSynthStore();

  const oscRef = useRef<any>(null);
  const lastFrequencyRef = useRef<number | null>(null);
  const lastNoteRef = useRef<string | null>(null);
  const vibratoLfoRef = useRef<OscillatorNode | null>(null);
  const vibratoGainRef = useRef<GainNode | null>(null);

  // 🚀 MEMOIZATION: Clamp parameters once and reuse
  const clampedParams = useMemo(
    () => ({
      masterTune: clampParameter(masterTune, -12, 12),
      detuneSemis: clampParameter(oscillatorState.frequency || 0, -12, 12),
      pitchWheel: clampParameter(pitchWheel, 0, 100),
      vibratoAmount: clampParameter(
        calculateVibratoAmount(oscillatorModulationOn, modWheel),
        0,
        2
      ),
    }),
    [
      masterTune,
      oscillatorState.frequency,
      pitchWheel,
      oscillatorModulationOn,
      modWheel,
    ]
  );

  // 🚀 MEMOIZATION: Calculate glide time once
  const mappedGlideTime = useMemo(
    () => calculateGlideTime(glideTime),
    [glideTime]
  );

  // 🚀 MEMOIZATION: Calculate volume once
  const boostedVolume = useMemo(
    () => calculateVolume(mixerState.volume, volumeBoost),
    [mixerState.volume, volumeBoost]
  );

  // 🚀 MEMOIZATION: Oscillator configuration object
  const oscillatorConfig = useMemo(
    () => ({
      waveform: oscillatorState.waveform as OscillatorType,
      range: oscillatorState.range,
    }),
    [oscillatorState.waveform, oscillatorState.range]
  );

  // 🚀 MEMOIZATION: Frequency calculation function
  const calculateFrequencyForNote = useCallback(
    (note: string): number => {
      return calculateFrequency(
        note,
        clampedParams.masterTune,
        clampedParams.detuneSemis,
        clampedParams.pitchWheel,
        detuneCents
      );
    },
    [clampedParams, detuneCents]
  );

  // 🚀 MEMOIZATION: Base frequency calculation for vibrato
  const calculateBaseFrequency = useCallback(
    (note: string): number => {
      return noteToFrequency(note) * Math.pow(2, clampedParams.masterTune / 12);
    },
    [clampedParams.masterTune]
  );

  // 🚀 MEMOIZATION: Audio parameter update function
  const updateAudioParameter = useCallback(
    (param: AudioParam | null, value: number, rampTime: number = 0.02) => {
      if (param && audioContext) {
        param.linearRampToValueAtTime(
          value,
          audioContext.currentTime + rampTime
        );
      }
    },
    [audioContext]
  );

  // 🚀 MEMOIZATION: Vibrato setup function
  const setupVibrato = useCallback(
    (oscNode: OscillatorNode, baseFreq: number) => {
      if (clampedParams.vibratoAmount <= 0 || !audioContext) return;

      // Clean up previous LFO if any
      vibratoLfoRef.current?.disconnect();
      vibratoGainRef.current?.disconnect();
      vibratoLfoRef.current = null;
      vibratoGainRef.current = null;

      const lfo = audioContext.createOscillator();
      lfo.type = "sine";
      lfo.frequency.value = 6; // 6 Hz vibrato
      const lfoGain = audioContext.createGain();
      lfoGain.gain.value =
        baseFreq * (Math.pow(2, clampedParams.vibratoAmount / 12) - 1);
      lfo.connect(lfoGain);
      lfoGain.connect(oscNode.frequency);
      lfo.start();
      vibratoLfoRef.current = lfo;
      vibratoGainRef.current = lfoGain;
    },
    [audioContext, clampedParams.vibratoAmount]
  );

  // 🚀 MEMOIZATION: Vibrato cleanup function
  const cleanupVibrato = useCallback(() => {
    vibratoLfoRef.current?.stop();
    vibratoLfoRef.current?.disconnect();
    vibratoGainRef.current?.disconnect();
    vibratoLfoRef.current = null;
    vibratoGainRef.current = null;
  }, []);

  // Volume control effect - memoized to prevent unnecessary updates
  useEffect(() => {
    if (oscRef.current) {
      oscRef.current.getGainNode().gain.value = mixerState.enabled
        ? boostedVolume
        : 0;
    }
  }, [mixerState.enabled, boostedVolume]);

  // Waveform and range update effect - memoized config prevents unnecessary updates
  useEffect(() => {
    oscRef.current?.update(oscillatorConfig);
  }, [oscillatorConfig]);

  // Apply range changes to current frequency
  useEffect(() => {
    if (oscRef.current && lastFrequencyRef.current !== null) {
      oscRef.current.setFrequency(lastFrequencyRef.current);
    }
  }, [oscillatorState.range]);

  const triggerAttack = useCallback(
    (note: string) => {
      if (!audioContext || !mixerNode) return;

      if (!oscRef.current) {
        oscRef.current = createOscillator(
          {
            audioContext,
            waveform: oscillatorState.waveform as OscillatorType,
            frequency: oscillatorState.frequency,
            range: oscillatorState.range,
          },
          mixerNode
        );
      }

      lastNoteRef.current = note;
      const safeFreq = calculateFrequencyForNote(note);

      if (glideOn && lastFrequencyRef.current !== null) {
        oscRef.current.start(lastFrequencyRef.current);
        const oscNode = oscRef.current.getNode();
        if (oscNode) {
          updateAudioParameter(oscNode.frequency, safeFreq, mappedGlideTime);
        }
      } else {
        oscRef.current.start(safeFreq);
      }

      lastFrequencyRef.current = safeFreq;

      // Setup vibrato if needed
      const oscNode = oscRef.current.getNode();
      if (oscNode) {
        const baseFreq = calculateBaseFrequency(note);
        setupVibrato(oscNode, baseFreq);
      }
    },
    [
      audioContext,
      mixerNode,
      oscillatorState,
      glideOn,
      mappedGlideTime,
      calculateFrequencyForNote,
      calculateBaseFrequency,
      setupVibrato,
      updateAudioParameter,
      createOscillator,
    ]
  );

  const triggerRelease = useCallback(() => {
    if (oscRef.current) {
      oscRef.current.stop();
      oscRef.current = null;
    }
    cleanupVibrato();
    lastFrequencyRef.current = null;
    lastNoteRef.current = null;
  }, [cleanupVibrato]);

  // Frequency update effect for parameter changes - memoized to prevent unnecessary updates
  useEffect(() => {
    if (oscRef.current && lastNoteRef.current) {
      const safeFreq = calculateFrequencyForNote(lastNoteRef.current);
      const oscNode = oscRef.current.getNode();
      if (oscNode) {
        updateAudioParameter(oscNode.frequency, safeFreq);
      }
    }
  }, [calculateFrequencyForNote, updateAudioParameter]);

  // Cleanup effect
  useEffect(() => {
    return () => {
      if (oscRef.current) {
        oscRef.current.stop();
        oscRef.current = null;
      }
      cleanupVibrato();
    };
  }, [cleanupVibrato]);

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
