import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { clampParameter } from "@/utils";
import { mapEnvelopeTime, mapContourAmount, mapCutoff } from "@/utils";
import { noteToMidiNote } from "@/utils";
import { scheduleEnvelopeAttack, scheduleEnvelopeRelease } from "@/utils";

type FilterEnvelopeProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | null;
};

export function useFilterEnvelope({
  audioContext,
  filterNode,
}: FilterEnvelopeProps) {
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
    activeKeys,
  } = useSynthStore();

  const filterEnvelope = useMemo(() => {
    return {
      triggerAttack: () => {
        if (
          !audioContext ||
          !filterNode ||
          !filterModulationOn ||
          !(filterNode instanceof AudioWorkletNode)
        ) {
          return;
        }

        const cutoffParam = filterNode.parameters.get("cutoff");
        if (!cutoffParam) return;

        // Calculate key-tracked base cutoff
        const keyTracking =
          (keyboardControl1 ? 1 / 3 : 0) + (keyboardControl2 ? 2 / 3 : 0);
        const baseCutoff = mapCutoff(filterCutoff);
        let trackedCutoff = baseCutoff;

        // Apply key tracking if we have active keys
        if (activeKeys) {
          const noteNumber = noteToMidiNote(activeKeys);
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

        scheduleEnvelopeAttack(cutoffParam, {
          start: trackedCutoff,
          peak: envMax,
          sustain: envSustain,
          attackTime,
          decayTime,
          now,
        });
      },

      triggerRelease: () => {
        if (
          !audioContext ||
          !filterNode ||
          !filterModulationOn ||
          !(filterNode instanceof AudioWorkletNode)
        ) {
          return;
        }

        const cutoffParam = filterNode.parameters.get("cutoff");
        if (!cutoffParam) return;

        const now = audioContext.currentTime;

        // Calculate key-tracked base cutoff for release
        const keyTracking =
          (keyboardControl1 ? 1 / 3 : 0) + (keyboardControl2 ? 2 / 3 : 0);
        const baseCutoff = mapCutoff(filterCutoff);
        let trackedBaseCutoff = baseCutoff;

        // Apply key tracking if we have active keys
        if (activeKeys) {
          const noteNumber = noteToMidiNote(activeKeys);
          const baseNoteNumber = 60; // C4
          trackedBaseCutoff =
            baseCutoff *
            Math.pow(2, (keyTracking * (noteNumber - baseNoteNumber)) / 12);
        }

        const currentFreq = cutoffParam.value;
        scheduleEnvelopeRelease(cutoffParam, {
          from: currentFreq,
          to: trackedBaseCutoff,
          releaseTime: mapEnvelopeTime(filterDecay),
          now,
        });
      },
    };
  }, [
    audioContext,
    filterNode,
    filterCutoff,
    filterModulationOn,
    filterContourAmount,
    filterAttack,
    filterDecay,
    filterSustain,
    keyboardControl1,
    keyboardControl2,
    modWheel,
    activeKeys,
  ]);

  return filterEnvelope;
}
