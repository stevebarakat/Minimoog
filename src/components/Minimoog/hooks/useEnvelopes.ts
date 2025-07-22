import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import {
  mapEnvelopeTime,
  mapContourAmount,
  mapCutoff,
  noteNameToMidi,
} from "../utils/synthUtils";
import type { EnvelopeProps } from "../types/synthTypes";

// Convert large attack/decay values (0-10000) to 0-10 range for mapEnvelopeTime
function convertAttackDecayValue(largeValue: number): number {
  // Map 0-10000 to 0-10 logarithmically to match the original mapping
  if (largeValue <= 0) return 0;
  if (largeValue >= 10000) return 10;

  // Use a more gradual mapping that gives better control over the range
  // Map the original values (0, 10, 200, 600, 1000, 5000, 10000) to (0, 3, 5, 7, 8.5, 9.5, 10)
  // This gives better attack times and longer decay times
  const stops = [
    { pos: 0, value: 0 },
    { pos: 10, value: 3 },
    { pos: 200, value: 5 },
    { pos: 600, value: 7 },
    { pos: 1000, value: 8.5 },
    { pos: 5000, value: 9.5 },
    { pos: 10000, value: 10 },
  ];

  for (let i = 0; i < stops.length - 1; i++) {
    const a = stops[i];
    const b = stops[i + 1];
    if (largeValue >= a.pos && largeValue <= b.pos) {
      const t = (largeValue - a.pos) / (b.pos - a.pos);
      return a.value + t * (b.value - a.value);
    }
  }
  return 10;
}

function useEnvelopes({
  audioContext,
  filterNode,
  loudnessEnvelopeGain,
  osc1,
  osc2,
  osc3,
}: EnvelopeProps) {
  const {
    filterCutoff,
    filterModulationOn,
    filterContourAmount,
    filterAttack,
    filterDecay,
    filterSustain,
    keyboardControl1,
    keyboardControl2,
    modWheel,
    decaySwitchOn,
    loudnessAttack,
    loudnessDecay,
    loudnessSustain,
    activeKeys,
  } = useSynthStore();

  // Precompute envelope times with conversion
  const loudnessAttackTime = mapEnvelopeTime(
    convertAttackDecayValue(loudnessAttack)
  );
  const loudnessDecayTime = mapEnvelopeTime(
    convertAttackDecayValue(loudnessDecay)
  );
  const loudnessSustainLevel = loudnessSustain / 10;

  const synthObj = useMemo(() => {
    return {
      triggerAttack: (note: string) => {
        if (!audioContext || !loudnessEnvelopeGain) {
          return;
        }
        osc1?.triggerAttack?.(note);
        osc2?.triggerAttack?.(note);
        osc3?.triggerAttack?.(note);

        // Apply filter envelope and key tracking
        if (filterNode) {
          const keyTracking =
            (keyboardControl1 ? 1 / 3 : 0) + (keyboardControl2 ? 2 / 3 : 0);
          const noteNumber = noteNameToMidi(note);
          const baseNoteNumber = 60; // C4
          const baseCutoff = mapCutoff(filterCutoff);
          const trackedCutoff =
            baseCutoff *
            Math.pow(2, (keyTracking * (noteNumber - baseNoteNumber)) / 12);

          if (filterNode instanceof AudioWorkletNode) {
            if (filterModulationOn) {
              // Filter envelope modulation
              const contourOctaves =
                mapContourAmount(filterContourAmount) * (modWheel / 100);
              const attackTime = mapEnvelopeTime(
                convertAttackDecayValue(filterAttack)
              );
              const decayTime = mapEnvelopeTime(
                convertAttackDecayValue(filterDecay)
              );
              const sustainLevel = filterSustain / 10;
              // Clamp contourOctaves to prevent extreme values
              const clampedContourOctaves = Math.max(
                0,
                Math.min(3, contourOctaves)
              ); // Max 3 octaves
              const envMax = Math.min(
                20000,
                trackedCutoff * Math.pow(2, clampedContourOctaves)
              );
              const envSustain =
                trackedCutoff + (envMax - trackedCutoff) * sustainLevel;
              const now = audioContext.currentTime;

              const cutoffParam = filterNode.parameters.get("cutoff");
              if (cutoffParam) {
                cutoffParam.cancelScheduledValues(now);

                // For smooth note transitions, start from current frequency if it's close
                const currentFreq = cutoffParam.value;
                const freqDiff =
                  Math.abs(currentFreq - trackedCutoff) / trackedCutoff;
                const startFreq = freqDiff < 0.5 ? currentFreq : trackedCutoff; // Smooth transition if close

                cutoffParam.setValueAtTime(startFreq, now);
                cutoffParam.linearRampToValueAtTime(envMax, now + attackTime);
                cutoffParam.linearRampToValueAtTime(
                  envSustain,
                  now + attackTime + decayTime
                );
              }
            } else {
              // Just set cutoff with key tracking
              const cutoffParam = filterNode.parameters.get("cutoff");
              cutoffParam?.setValueAtTime(
                trackedCutoff,
                audioContext.currentTime
              );
            }
          }
        }

        // Apply loudness envelope
        const now = audioContext.currentTime;
        if (loudnessEnvelopeGain) {
          loudnessEnvelopeGain.gain.cancelScheduledValues(now);

          // For smooth note transitions, start from current gain if it's not zero
          const currentGain = loudnessEnvelopeGain.gain.value;
          const startGain = currentGain > 0.01 ? currentGain * 0.3 : 0; // Smooth transition

          loudnessEnvelopeGain.gain.setValueAtTime(startGain, now);
          loudnessEnvelopeGain.gain.linearRampToValueAtTime(
            1,
            now + loudnessAttackTime
          );
          loudnessEnvelopeGain.gain.linearRampToValueAtTime(
            loudnessSustainLevel,
            now + loudnessAttackTime + loudnessDecayTime
          );
        }
      },
      triggerRelease: () => {
        if (!audioContext || !loudnessEnvelopeGain) {
          return;
        }
        osc1?.triggerRelease?.();
        osc2?.triggerRelease?.();
        osc3?.triggerRelease?.();

        const now = audioContext.currentTime;

        // Handle filter envelope release
        if (
          filterNode &&
          filterModulationOn &&
          filterNode instanceof AudioWorkletNode
        ) {
          const cutoffParam = filterNode.parameters.get("cutoff");
          if (cutoffParam) {
            // Calculate key-tracked base cutoff for release
            const keyTracking =
              (keyboardControl1 ? 1 / 3 : 0) + (keyboardControl2 ? 2 / 3 : 0);
            const baseCutoff = mapCutoff(filterCutoff);
            let trackedBaseCutoff = baseCutoff;

            // Apply key tracking if we have active keys
            if (activeKeys) {
              const noteNumber = noteNameToMidi(activeKeys);
              const baseNoteNumber = 60; // C4
              trackedBaseCutoff =
                baseCutoff *
                Math.pow(2, (keyTracking * (noteNumber - baseNoteNumber)) / 12);
            }

            if (decaySwitchOn) {
              cutoffParam.cancelScheduledValues(now);
              const currentFreq = cutoffParam.value;
              cutoffParam.setValueAtTime(currentFreq, now);
              cutoffParam.linearRampToValueAtTime(
                trackedBaseCutoff,
                now + mapEnvelopeTime(convertAttackDecayValue(filterDecay))
              );
            } else {
              cutoffParam.setValueAtTime(trackedBaseCutoff, now);
            }
          }
        }

        // Handle loudness envelope release
        if (decaySwitchOn) {
          if (loudnessEnvelopeGain) {
            loudnessEnvelopeGain.gain.cancelScheduledValues(now);
            const currentGain = loudnessEnvelopeGain.gain.value;
            loudnessEnvelopeGain.gain.setValueAtTime(currentGain, now);
            loudnessEnvelopeGain.gain.linearRampToValueAtTime(
              0,
              now + loudnessDecayTime
            );
          }
        } else {
          if (loudnessEnvelopeGain) {
            loudnessEnvelopeGain.gain.cancelScheduledValues(now);
            const currentGain = loudnessEnvelopeGain.gain.value;
            loudnessEnvelopeGain.gain.setValueAtTime(currentGain, now);
            // Add a small release time to prevent popping
            const releaseTime = Math.max(0.01, loudnessDecayTime * 0.1); // At least 10ms
            loudnessEnvelopeGain.gain.linearRampToValueAtTime(
              0,
              now + releaseTime
            );
          }
        }
      },
    };
  }, [
    audioContext,
    filterNode,
    loudnessEnvelopeGain,
    osc1,
    osc2,
    osc3,
    filterCutoff,
    filterModulationOn,
    filterContourAmount,
    filterAttack,
    filterDecay,
    filterSustain,
    keyboardControl1,
    keyboardControl2,
    modWheel,
    decaySwitchOn,
    loudnessAttackTime,
    loudnessDecayTime,
    loudnessSustainLevel,
    activeKeys,
  ]);

  return synthObj;
}
export default useEnvelopes;
