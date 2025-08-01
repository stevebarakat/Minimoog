import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapCutoff } from "@/utils";
import { noteToMidiNote } from "@/utils";

export function useFilterTracking(
  audioContext: AudioContext | null,
  filterNode: AudioWorkletNode | null, // Changed back to AudioWorkletNode
  activeKeys: string | null
) {
  useEffect(() => {
    if (!filterNode || !audioContext) return;
    const { filterCutoff, keyboardControl1, keyboardControl2 } =
      useSynthStore.getState();

    // Only apply key tracking if we have active keys and keyboard control is enabled
    const keyTracking =
      (keyboardControl1 ? 1 / 3 : 0) + (keyboardControl2 ? 2 / 3 : 0);

    if (activeKeys && keyTracking > 0) {
      const noteNumber = noteToMidiNote(activeKeys);
      const baseNoteNumber = 60;
      const baseCutoff = mapCutoff(filterCutoff);
      const trackedCutoff =
        baseCutoff *
        Math.pow(2, (keyTracking * (noteNumber - baseNoteNumber)) / 12);

      // AudioWorkletNode case - set cutoff parameter
      const cutoffParam = filterNode.parameters.get("cutoff");
      if (cutoffParam) {
        cutoffParam.setValueAtTime(trackedCutoff, audioContext.currentTime);
      }
    }
  }, [filterNode, audioContext, activeKeys]); // Removed filterCutoff from dependencies
}
