import { useEffect, useRef, useCallback, useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { OscillatorType } from "@/types";
import { getPooledNode, releaseNode } from "@/utils/audioNodePool";
import {
  clampParameter,
  calculateGlideTime,
  calculateVolume,
} from "@/utils/audioUtils";
import { calculateFrequency, noteToFrequency } from "@/utils/frequencyUtils";
import type { BaseOscillatorParams } from "../audio/baseOscillator";

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
  update: (
    params: Partial<Pick<BaseOscillatorParams, "waveform" | "range" | "gain">>
  ) => void;
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

  // Memoize base frequency calculation for vibrato
  const calculateBaseFrequency = useCallback(
    (note: string): number => {
      return noteToFrequency(note) * Math.pow(2, clampedParams.masterTune / 12);
    },
    [clampedParams.masterTune]
  );

  // Memoize vibrato setup function
  const setupVibrato = useCallback(
    (oscNode: OscillatorNode, baseFreq: number) => {
      if (clampedParams.vibratoAmount <= 0 || !audioContext) return;

      // Clean up previous LFO if any
      if (vibratoLfoRef.current) {
        releaseNode("oscillator", vibratoLfoRef.current);
        vibratoLfoRef.current = null;
      }
      if (vibratoGainRef.current) {
        releaseNode("gain", vibratoGainRef.current);
        vibratoGainRef.current = null;
      }

      const lfo = getPooledNode("oscillator", audioContext) as OscillatorNode;
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(6, audioContext.currentTime); // 6 Hz vibrato
      const lfoGain = getPooledNode("gain", audioContext) as GainNode;
      lfoGain.gain.setValueAtTime(
        baseFreq * (Math.pow(2, clampedParams.vibratoAmount / 12) - 1),
        audioContext.currentTime
      );
      lfo.connect(lfoGain);
      lfoGain.connect(oscNode.frequency);
      lfo.start();
      vibratoLfoRef.current = lfo;
      vibratoGainRef.current = lfoGain;
    },
    [audioContext, clampedParams.vibratoAmount]
  );

  // Memoize cleanup function
  const cleanupVibrato = useCallback(() => {
    if (vibratoLfoRef.current) {
      releaseNode("oscillator", vibratoLfoRef.current);
      vibratoLfoRef.current = null;
    }
    if (vibratoGainRef.current) {
      releaseNode("gain", vibratoGainRef.current);
      vibratoGainRef.current = null;
    }
  }, []);

  // Volume control effect - memoized to prevent unnecessary updates
  useEffect(() => {
    if (oscRef.current) {
      oscRef.current
        .getGainNode()
        .gain.setValueAtTime(
          mixerState.enabled ? boostedVolume : 0,
          audioContext.currentTime
        );
    }
  }, [mixerState.enabled, boostedVolume, audioContext]);

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
      setupVibrato,
      createOscillator,
      calculateBaseFrequency,
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
