import { useEffect, useRef, useCallback, useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { OscillatorType } from "@/types";
import { noteToFrequency } from "@/utils/noteToFrequency";

export type OscillatorFactoryConfig = {
  oscillatorKey: "oscillator1" | "oscillator2" | "oscillator3";
  mixerKey: "osc1" | "osc2" | "osc3";
  createOscillator: (
    config: OscillatorCreateConfig,
    mixerNode?: AudioNode
  ) => OscillatorInstance;
  detuneCents: number;
  volumeBoost: number;
};

export type OscillatorInstance = {
  start: (frequency: number) => void;
  stop: () => void;
  getNode: () => OscillatorNode | null;
  getGainNode: () => GainNode;
  update: (config: { waveform: string; range: string }) => void;
  setFrequency: (frequency: number) => void;
};

export type OscillatorCreateConfig = {
  audioContext: AudioContext;
  waveform: string;
  frequency: number;
  range: string;
};

export type UseOscillatorResult = {
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

export function useOscillatorFactory(
  audioContext: AudioContext | null,
  mixerNode: AudioNode | null,
  config: OscillatorFactoryConfig,
  vibratoAmount: number = 0
): UseOscillatorResult {
  const {
    oscillatorKey,
    mixerKey,
    createOscillator,
    detuneCents,
    volumeBoost,
  } = config;

  const oscillatorState = useSynthStore((state) => state[oscillatorKey]);
  const mixerState = useSynthStore((state) => state.mixer[mixerKey]);
  const { glideOn, glideTime, masterTune, pitchWheel } = useSynthStore();

  const oscRef = useRef<OscillatorInstance | null>(null);
  const lastFrequencyRef = useRef<number | null>(null);
  const lastNoteRef = useRef<string | null>(null);
  const vibratoLfoRef = useRef<OscillatorNode | null>(null);
  const vibratoGainRef = useRef<GainNode | null>(null);

  // Memoize clamped parameters to prevent recalculation
  const clampedParams = useMemo(
    () => ({
      masterTune: clampParameter(masterTune, -12, 12),
      detuneSemis: clampParameter(oscillatorState.frequency || 0, -12, 12),
      pitchWheel: clampParameter(pitchWheel, 0, 100),
      vibratoAmount: clampParameter(vibratoAmount, 0, 2),
    }),
    [masterTune, oscillatorState.frequency, pitchWheel, vibratoAmount]
  );

  // Memoize glide time calculation
  const mappedGlideTime = useMemo(
    () => calculateGlideTime(glideTime),
    [glideTime]
  );

  // Memoize volume calculation
  const boostedVolume = useMemo(
    () => calculateVolume(mixerState.volume, volumeBoost),
    [mixerState.volume, volumeBoost]
  );

  // Memoize oscillator configuration
  const oscillatorConfig = useMemo(
    () => ({
      waveform: oscillatorState.waveform as OscillatorType,
      range: oscillatorState.range,
    }),
    [oscillatorState.waveform, oscillatorState.range]
  );

  // Memoize frequency calculation function
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

  // Memoize vibrato setup function
  const setupVibrato = useCallback(
    (oscNode: OscillatorNode, baseFreq: number) => {
      if (clampedParams.vibratoAmount <= 0) return;

      // Clean up previous LFO if any
      vibratoLfoRef.current?.disconnect();
      vibratoGainRef.current?.disconnect();
      vibratoLfoRef.current = null;
      vibratoGainRef.current = null;

      if (audioContext) {
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
      }
    },
    [audioContext, clampedParams.vibratoAmount]
  );

  // Memoize cleanup function
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
          oscNode.frequency.linearRampToValueAtTime(
            safeFreq,
            audioContext.currentTime + mappedGlideTime
          );
        }
      } else {
        oscRef.current.start(safeFreq);
      }

      lastFrequencyRef.current = safeFreq;

      // Setup vibrato if needed
      const oscNode = oscRef.current.getNode();
      if (oscNode) {
        const baseFreq =
          noteToFrequency(note) * Math.pow(2, clampedParams.masterTune / 12);
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
      setupVibrato,
      clampedParams.masterTune,
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
      if (oscNode && audioContext) {
        oscNode.frequency.linearRampToValueAtTime(
          safeFreq,
          audioContext.currentTime + 0.02
        );
      }
    }
  }, [calculateFrequencyForNote, audioContext]);

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
