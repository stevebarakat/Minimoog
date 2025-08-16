import { useEffect, useRef, useCallback, useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import {
  calculateGlideTime,
  calculateVolume,
  calculateFrequency,
} from "@/utils";
import type {
  OscillatorCreateConfig,
  UseOscillatorResult,
  OscillatorInstance,
} from "@/types";

export type OscillatorFactoryConfig = {
  oscillatorKey: "oscillator1" | "oscillator2" | "oscillator3";
  createOscillator: (
    config: OscillatorCreateConfig,
    mixerNode?: AudioNode
  ) => OscillatorInstance;
  detuneCents: number;
  volumeBoost: number;
  oscillatorModulation?: {
    applyModulation: (
      oscillatorNode: OscillatorNode,
      oscillatorId: string
    ) => () => void;
    cleanupAll: () => void;
    isModulationActive: boolean;
  };
};

export function useOscillatorFactory(
  audioContext: AudioContext | null,
  mixerNode: AudioNode | null,
  config: OscillatorFactoryConfig
): UseOscillatorResult {
  const {
    oscillatorKey,
    createOscillator,
    detuneCents,
    volumeBoost,
    oscillatorModulation,
  } = config;

  const oscillatorState = useSynthStore((state) => state[oscillatorKey]);
  const glideOn = useSynthStore((state) => state.glideOn);
  const glideTime = useSynthStore((state) => state.glideTime);
  const masterTune = useSynthStore((state) => state.masterTune);
  const pitchWheel = useSynthStore((state) => state.pitchWheel);

  const oscRef = useRef<OscillatorInstance | null>(null);
  const lastFrequencyRef = useRef<number | null>(null);
  const modulationCleanupRef = useRef<(() => void) | null>(null);

  const mappedGlideTime = useMemo(
    () => calculateGlideTime(glideTime),
    [glideTime]
  );
  const boostedVolume = useMemo(
    () => calculateVolume(oscillatorState.volume, volumeBoost),
    [oscillatorState.volume, volumeBoost]
  );

  const calculateFrequencyForNote = useCallback(
    (note: string): number => {
      return calculateFrequency(
        note,
        masterTune,
        oscillatorState.frequency || 0,
        pitchWheel,
        detuneCents
      );
    },
    [masterTune, oscillatorState.frequency, pitchWheel, detuneCents]
  );

  const triggerAttack = useCallback(
    (note: string) => {
      if (!audioContext || !mixerNode) return;

      if (!oscRef.current) {
        try {
          oscRef.current = createOscillator(
            {
              audioContext,
              waveform: oscillatorState.waveform,
              frequency: oscillatorState.frequency,
              range: oscillatorState.range,
              gain: oscillatorState.enabled ? boostedVolume : 0,
            },
            mixerNode
          );
        } catch (error) {
          console.error("Error creating oscillator:", error);
          return;
        }
      }

      try {
        const frequency = calculateFrequencyForNote(note);
        const oscNode = oscRef.current.getNode();

        if (!oscNode) {
          oscRef.current.start(frequency);

          // Apply modulation to the newly created oscillator
          if (oscillatorModulation?.isModulationActive) {
            const newOscNode = oscRef.current.getNode();
            if (newOscNode) {
              const oscillatorId = `${oscillatorKey}-${Date.now()}`;

              modulationCleanupRef.current =
                oscillatorModulation.applyModulation(newOscNode, oscillatorId);
            }
          }
        } else if (glideOn && lastFrequencyRef.current !== null) {
          const rangeMultiplier = oscRef.current.getRangeMultiplier();
          oscNode.frequency.cancelScheduledValues(audioContext.currentTime);
          oscNode.frequency.setValueAtTime(
            lastFrequencyRef.current * rangeMultiplier,
            audioContext.currentTime
          );
          oscNode.frequency.linearRampToValueAtTime(
            frequency * rangeMultiplier,
            audioContext.currentTime + mappedGlideTime
          );
        } else {
          oscRef.current.setFrequency(frequency);
        }

        // Apply modulation to existing oscillators when notes are triggered
        if (oscillatorModulation?.isModulationActive && oscNode) {
          // Clean up any existing modulation first
          if (modulationCleanupRef.current) {
            modulationCleanupRef.current();
          }
          const oscillatorId = `${oscillatorKey}-${Date.now()}`;

          modulationCleanupRef.current = oscillatorModulation.applyModulation(
            oscNode,
            oscillatorId
          );
        }

        lastFrequencyRef.current = frequency;
      } catch (error) {
        console.error("Error triggering oscillator attack:", error);
      }
    },
    [
      audioContext,
      mixerNode,
      oscillatorState,
      glideOn,
      mappedGlideTime,
      calculateFrequencyForNote,
      createOscillator,
      boostedVolume,
      oscillatorKey,
      oscillatorModulation,
    ]
  );

  const triggerRelease = useCallback(
    (forceStop = false) => {
      // Clean up modulation first
      if (modulationCleanupRef.current) {
        modulationCleanupRef.current();
        modulationCleanupRef.current = null;
      }

      if (forceStop || !glideOn) {
        if (oscRef.current) {
          try {
            oscRef.current.stop(); // Stop the oscillator
            oscRef.current = null;
            lastFrequencyRef.current = null;
          } catch (error) {
            console.error("Error cleaning up oscillator:", error);
          }
        }
      }
    },
    [glideOn]
  );

  useEffect(() => {
    if (oscRef.current && audioContext) {
      const newVolume = oscillatorState.enabled ? boostedVolume : 0;
      try {
        oscRef.current
          .getGainNode()
          .gain.setValueAtTime(newVolume, audioContext.currentTime);
      } catch (error) {
        console.error("Error updating volume:", error);
      }
    }
  }, [audioContext, oscillatorState.enabled, boostedVolume]);

  useEffect(() => {
    if (oscRef.current) {
      try {
        oscRef.current.update({
          waveform: oscillatorState.waveform,
          range: oscillatorState.range,
        });
      } catch (error) {
        console.error("Error updating oscillator:", error);
      }
    }
  }, [oscillatorState.waveform, oscillatorState.range]);

  // Continuous pitch wheel modulation
  useEffect(() => {
    if (!audioContext || !oscRef.current || !lastFrequencyRef.current) return;

    const oscNode = oscRef.current.getNode();
    if (!oscNode) return;

    // Calculate pitch bend in cents: 0 = -2 semitones, 50 = center, 100 = +2 semitones
    const pitchBendCents = ((pitchWheel - 50) / 50) * 200;

    // Apply pitch wheel modulation using detune parameter
    oscNode.detune.setValueAtTime(pitchBendCents, audioContext.currentTime);
  }, [pitchWheel, audioContext]);

  useEffect(() => {
    return () => {
      if (oscRef.current) {
        try {
          oscRef.current.stop(); // Stop the oscillator
        } catch (error) {
          console.error("Error cleaning up oscillator:", error);
        }
        oscRef.current = null;
      }
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
