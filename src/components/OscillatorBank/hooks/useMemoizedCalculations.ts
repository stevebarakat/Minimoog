import { useMemo, useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";
import { noteToFrequency } from "@/utils/noteToFrequency";

// Memoized parameter clamping utility
export const clampParameter = (
  value: number,
  min: number,
  max: number
): number => {
  return Math.max(min, Math.min(max, value));
};

// Memoized frequency calculation utility
export const calculateFrequency = (
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
export const calculateGlideTime = (glideTime: number): number => {
  return Math.pow(10, glideTime / 5) * 0.02;
};

// Memoized volume calculation
export const calculateVolume = (
  volume: number,
  volumeBoost: number
): number => {
  return Math.min(1, (volume / 10) * volumeBoost);
};

// Memoized vibrato amount calculation
export const calculateVibratoAmount = (
  oscillatorModulationOn: boolean,
  modWheel: number
): number => {
  if (!oscillatorModulationOn || modWheel <= 0) return 0;
  const clampedModWheel = clampParameter(modWheel, 0, 100);
  return clampedModWheel / 100;
};

// Hook for memoized oscillator calculations
export function useOscillatorCalculations(
  oscillatorKey: "oscillator1" | "oscillator2" | "oscillator3",
  mixerKey: "osc1" | "osc2" | "osc3",
  detuneCents: number,
  volumeBoost: number
) {
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

  // Memoize clamped parameters to prevent recalculation
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
      waveform: oscillatorState.waveform,
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

  return {
    clampedParams,
    mappedGlideTime,
    boostedVolume,
    oscillatorConfig,
    calculateFrequencyForNote,
    calculateBaseFrequency,
    glideOn,
    mixerState,
  };
}

// Hook for memoized audio node parameter updates
export function useAudioNodeParameters(audioContext: AudioContext | null) {
  // Memoize audio parameter update function
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

  // Memoize immediate audio parameter update function
  const updateAudioParameterImmediate = useCallback(
    (param: AudioParam | null, value: number) => {
      if (param) {
        param.setValueAtTime(value, audioContext?.currentTime || 0);
      }
    },
    [audioContext]
  );

  return {
    updateAudioParameter,
    updateAudioParameterImmediate,
  };
}

// Hook for memoized vibrato setup
export function useVibratoSetup(audioContext: AudioContext | null) {
  // Memoize vibrato setup function
  const setupVibrato = useCallback(
    (
      oscNode: OscillatorNode,
      baseFreq: number,
      vibratoAmount: number,
      vibratoLfoRef: React.MutableRefObject<OscillatorNode | null>,
      vibratoGainRef: React.MutableRefObject<GainNode | null>
    ) => {
      if (vibratoAmount <= 0 || !audioContext) return;

      // Clean up previous LFO if any
      vibratoLfoRef.current?.disconnect();
      vibratoGainRef.current?.disconnect();
      vibratoLfoRef.current = null;
      vibratoGainRef.current = null;

      const lfo = audioContext.createOscillator();
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(6, audioContext.currentTime); // 6 Hz vibrato
      const lfoGain = audioContext.createGain();
      lfoGain.gain.setValueAtTime(
        baseFreq * (Math.pow(2, vibratoAmount / 12) - 1),
        audioContext.currentTime
      );
      lfo.connect(lfoGain);
      lfoGain.connect(oscNode.frequency);
      lfo.start();
      vibratoLfoRef.current = lfo;
      vibratoGainRef.current = lfoGain;
    },
    [audioContext]
  );

  // Memoize vibrato cleanup function
  const cleanupVibrato = useCallback(
    (
      vibratoLfoRef: React.MutableRefObject<OscillatorNode | null>,
      vibratoGainRef: React.MutableRefObject<GainNode | null>
    ) => {
      vibratoLfoRef.current?.stop();
      vibratoLfoRef.current?.disconnect();
      vibratoGainRef.current?.disconnect();
      vibratoLfoRef.current = null;
      vibratoGainRef.current = null;
    },
    []
  );

  return {
    setupVibrato,
    cleanupVibrato,
  };
}
