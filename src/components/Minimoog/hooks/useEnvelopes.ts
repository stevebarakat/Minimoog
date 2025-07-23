import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { clampParameter } from "@/utils/audioUtils";
import {
  mapEnvelopeTime,
  mapContourAmount,
  mapCutoff,
  noteNameToMidi,
} from "@/utils/paramMappingUtils";
import {
  scheduleEnvelopeAttack,
  scheduleEnvelopeRelease,
} from "@/utils/envelopeUtils";
import type { EnvelopeProps } from "../types/synthTypes";

export function useEnvelopes({
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
    isMainActive,
    mainVolume,
  } = useSynthStore();

  // Log decay switch state
  console.log(
    "useEnvelopes: decaySwitchOn =",
    decaySwitchOn,
    "isMainActive =",
    isMainActive,
    "mainVolume =",
    mainVolume
  );

  // Precompute envelope times with conversion
  const loudnessAttackTime = mapEnvelopeTime(loudnessAttack);
  const loudnessDecayTime = mapEnvelopeTime(loudnessDecay);
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

        // Handle filter envelope
        if (
          filterNode &&
          filterModulationOn &&
          filterNode instanceof AudioWorkletNode
        ) {
          const cutoffParam = filterNode.parameters.get("cutoff");
          if (cutoffParam) {
            // Calculate key-tracked base cutoff
            const keyTracking =
              (keyboardControl1 ? 1 / 3 : 0) + (keyboardControl2 ? 2 / 3 : 0);
            const baseCutoff = mapCutoff(filterCutoff);
            let trackedCutoff = baseCutoff;

            // Apply key tracking if we have active keys
            if (activeKeys) {
              const noteNumber = noteNameToMidi(activeKeys);
              const baseNoteNumber = 60; // C4
              trackedCutoff =
                baseCutoff *
                Math.pow(2, (keyTracking * (noteNumber - baseNoteNumber)) / 12);
            }

            // Filter envelope modulation
            const contourOctaves =
              mapContourAmount(filterContourAmount) * (modWheel / 100);
            const attackTime = mapEnvelopeTime(filterAttack);
            const decayTime = mapEnvelopeTime(filterDecay);
            const sustainLevel = filterSustain / 10;
            // Clamp contourOctaves to prevent extreme values
            const clampedContourOctaves = clampParameter(contourOctaves, 0, 3); // Max 3 octaves
            const envMax = Math.min(
              20000,
              trackedCutoff * Math.pow(2, clampedContourOctaves)
            );
            const envSustain =
              trackedCutoff + (envMax - trackedCutoff) * sustainLevel;
            const now = audioContext.currentTime;

            // For smooth note transitions, start from current frequency if it's close
            const currentFreq = cutoffParam.value;
            const freqDiff =
              Math.abs(currentFreq - trackedCutoff) / trackedCutoff;
            const startFreq = freqDiff < 0.5 ? currentFreq : trackedCutoff;
            scheduleEnvelopeAttack(cutoffParam, {
              start: startFreq,
              peak: envMax,
              sustain: envSustain,
              attackTime,
              decayTime,
              now,
            });
          }
        } else if (filterNode && filterNode instanceof AudioWorkletNode) {
          // Just set cutoff with key tracking (no envelope modulation)
          const cutoffParam = filterNode.parameters.get("cutoff");
          if (cutoffParam) {
            // Calculate key-tracked base cutoff
            const keyTracking =
              (keyboardControl1 ? 1 / 3 : 0) + (keyboardControl2 ? 2 / 3 : 0);
            const baseCutoff = mapCutoff(filterCutoff);
            let trackedCutoff = baseCutoff;

            // Apply key tracking if we have active keys
            if (activeKeys) {
              const noteNumber = noteNameToMidi(activeKeys);
              const baseNoteNumber = 60; // C4
              trackedCutoff =
                baseCutoff *
                Math.pow(2, (keyTracking * (noteNumber - baseNoteNumber)) / 12);
            }

            cutoffParam.setValueAtTime(trackedCutoff, audioContext.currentTime);
          }
        }

        // Apply loudness envelope
        const now = audioContext.currentTime;
        if (loudnessEnvelopeGain) {
          // For smooth note transitions, start from current gain if it's not zero
          const currentGain = loudnessEnvelopeGain.gain.value;
          const startGain = currentGain > 0.01 ? currentGain * 0.3 : 0;
          console.log(
            "useEnvelopes: loudnessDecay",
            loudnessDecay,
            "loudnessDecayTime",
            loudnessDecayTime,
            "currentGain",
            currentGain,
            "startGain",
            startGain,
            "loudnessSustainLevel",
            loudnessSustainLevel
          );
          scheduleEnvelopeAttack(loudnessEnvelopeGain.gain, {
            start: startGain,
            peak: 1,
            sustain: loudnessSustainLevel,
            attackTime: loudnessAttackTime,
            decayTime: loudnessDecayTime,
            now,
          });
          console.log(
            "After scheduling attack, gain value:",
            loudnessEnvelopeGain.gain.value
          );
        }
      },
      triggerRelease: () => {
        if (!audioContext || !loudnessEnvelopeGain) {
          return;
        }

        const now = audioContext.currentTime;

        // Handle filter envelope release
        if (
          filterNode &&
          filterModulationOn &&
          filterNode instanceof AudioWorkletNode
        ) {
          console.log(
            "Filter modulation is ON, processing filter envelope release"
          );
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
              const currentFreq = cutoffParam.value;
              console.log(
                "Filter envelope: decaySwitchOn=true, using release time:",
                mapEnvelopeTime(filterDecay)
              );
              scheduleEnvelopeRelease(cutoffParam, {
                from: currentFreq,
                to: trackedBaseCutoff,
                releaseTime: mapEnvelopeTime(filterDecay),
                now,
              });
            } else {
              console.log(
                "Filter envelope: decaySwitchOn=false, immediate cutoff"
              );
              cutoffParam.setValueAtTime(trackedBaseCutoff, now);
            }
          }
        }

        // Handle loudness envelope release
        if (decaySwitchOn) {
          if (loudnessEnvelopeGain) {
            const currentGain = loudnessEnvelopeGain.gain.value;
            console.log(
              "useEnvelopes (release, decaySwitchOn=true): loudnessDecay",
              loudnessDecay,
              "loudnessDecayTime",
              loudnessDecayTime
            );
            scheduleEnvelopeRelease(loudnessEnvelopeGain.gain, {
              from: currentGain,
              to: 0,
              releaseTime: loudnessDecayTime,
              now,
            });
            console.log(
              "After scheduling release (decaySwitchOn=true), gain value:",
              loudnessEnvelopeGain.gain.value
            );

            // Stop oscillators after the envelope finishes
            setTimeout(() => {
              osc1?.triggerRelease?.();
              osc2?.triggerRelease?.();
              osc3?.triggerRelease?.();
            }, loudnessDecayTime * 1000);

            // Check gain value after release time
            setTimeout(() => {
              console.log(
                "After release time (decaySwitchOn=true), gain value:",
                loudnessEnvelopeGain.gain.value
              );
            }, (loudnessDecayTime + 0.1) * 1000);
          }
        } else {
          // Immediate cutoff - stop oscillators right away
          osc1?.triggerRelease?.();
          osc2?.triggerRelease?.();
          osc3?.triggerRelease?.();

          if (loudnessEnvelopeGain) {
            const currentGain = loudnessEnvelopeGain.gain.value;
            const releaseTime = 0.01; // Short 10ms release when decay switch is off
            console.log(
              "useEnvelopes (release, decaySwitchOn=false): loudnessDecay",
              loudnessDecay,
              "loudnessDecayTime",
              loudnessDecayTime,
              "releaseTime",
              releaseTime,
              "currentGain",
              currentGain
            );

            scheduleEnvelopeRelease(loudnessEnvelopeGain.gain, {
              from: currentGain,
              to: 0,
              releaseTime,
              now,
            });
            console.log(
              "After scheduling release (decaySwitchOn=false), gain value:",
              loudnessEnvelopeGain.gain.value
            );

            // Check gain value after release time
            setTimeout(() => {
              console.log(
                "After release time (decaySwitchOn=false), gain value:",
                loudnessEnvelopeGain.gain.value
              );
            }, (releaseTime + 0.1) * 1000);
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
