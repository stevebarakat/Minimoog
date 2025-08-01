import { useMemo, useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";
import { clampParameter, getPooledNode, releaseNode } from "@/utils";
import { midiNoteToFrequency, noteToMidiNote } from "@/utils";
import { OSCILLATOR, SYNTH_PARAMS } from "@/config";

// Memoized vibrato amount calculation
export const calculateVibratoAmount = (
  oscillatorModulationOn: boolean,
  modWheel: number
): number => {
  if (!oscillatorModulationOn || modWheel <= 0) return 0;
  const clampedModWheel = clampParameter(
    modWheel,
    SYNTH_PARAMS.MOD_WHEEL.MIN,
    SYNTH_PARAMS.MOD_WHEEL.MAX
  );
  return clampedModWheel / SYNTH_PARAMS.MOD_WHEEL.MAX;
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
      masterTune: clampParameter(
        masterTune,
        SYNTH_PARAMS.MASTER_TUNE.MIN,
        SYNTH_PARAMS.MASTER_TUNE.MAX
      ),
      detuneSemis: clampParameter(
        oscillatorState.frequency || 0,
        SYNTH_PARAMS.MASTER_TUNE.MIN,
        SYNTH_PARAMS.MASTER_TUNE.MAX
      ),
      pitchWheel: clampParameter(
        pitchWheel,
        SYNTH_PARAMS.PITCH_WHEEL.MIN,
        SYNTH_PARAMS.PITCH_WHEEL.MAX
      ),
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
    () =>
      Math.pow(10, glideTime / OSCILLATOR.GLIDE_TIME_POWER) *
      OSCILLATOR.GLIDE_TIME_MULTIPLIER,
    [glideTime]
  );

  // Memoize volume calculation
  const boostedVolume = useMemo(
    () =>
      Math.min(1, (mixerState.volume / SYNTH_PARAMS.VOLUME.MAX) * volumeBoost),
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
      return (
        midiNoteToFrequency(noteToMidiNote(note)) *
        Math.pow(2, clampedParams.masterTune / 12)
      );
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
      if (vibratoLfoRef.current) {
        releaseNode(vibratoLfoRef.current);
        vibratoLfoRef.current = null;
      }
      if (vibratoGainRef.current) {
        releaseNode(vibratoGainRef.current);
        vibratoGainRef.current = null;
      }

      const lfo = getPooledNode("oscillator", audioContext) as OscillatorNode;
      lfo.type = "sine";
      lfo.frequency.setValueAtTime(6, audioContext.currentTime); // 6 Hz vibrato
      const lfoGain = getPooledNode("gain", audioContext) as GainNode;
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
      if (vibratoLfoRef.current) {
        vibratoLfoRef.current.stop();
        releaseNode(vibratoLfoRef.current);
        vibratoLfoRef.current = null;
      }
      if (vibratoGainRef.current) {
        releaseNode(vibratoGainRef.current);
        vibratoGainRef.current = null;
      }
    },
    []
  );

  return {
    setupVibrato,
    cleanupVibrato,
  };
}
