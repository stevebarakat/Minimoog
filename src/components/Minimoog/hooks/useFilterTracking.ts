import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapCutoff, noteNameToMidi } from "../utils/synthUtils";

export function useFilterTracking(
  audioContext: AudioContext | null,
  filterNode: AudioWorkletNode | null,
  activeKeys: string | null
) {
  useEffect(() => {
    if (!filterNode || !audioContext) return;
    const { filterCutoff, keyboardControl1, keyboardControl2 } =
      useSynthStore.getState();

    // Key tracking for static cutoff
    let trackedCutoff = mapCutoff(filterCutoff);
    const keyTracking =
      (keyboardControl1 ? 1 / 3 : 0) + (keyboardControl2 ? 2 / 3 : 0);
    if (activeKeys) {
      const noteNumber = noteNameToMidi(activeKeys);
      const baseNoteNumber = 60;
      trackedCutoff =
        trackedCutoff *
        Math.pow(2, (keyTracking * (noteNumber - baseNoteNumber)) / 12);
    }

    // AudioWorkletNode case - set cutoff parameter
    const cutoffParam = filterNode.parameters.get("cutoff");
    cutoffParam?.setValueAtTime(trackedCutoff, audioContext.currentTime);
  }, [filterNode, audioContext, activeKeys]);
}
