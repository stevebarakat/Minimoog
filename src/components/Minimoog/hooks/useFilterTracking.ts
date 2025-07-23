import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapCutoff, noteNameToMidi } from "../utils/synthUtils";

export function useFilterTracking(
  audioContext: AudioContext | null,
  filterNode: BiquadFilterNode | null,
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
      const noteNumber = noteNameToMidi(activeKeys);
      const baseNoteNumber = 60;
      const baseCutoff = mapCutoff(filterCutoff);
      const trackedCutoff =
        baseCutoff *
        Math.pow(2, (keyTracking * (noteNumber - baseNoteNumber)) / 12);

      // Clamp frequency to Web Audio API safe range
      const clampedTrackedCutoff = Math.max(20, Math.min(22050, trackedCutoff));

      // BiquadFilterNode case - set frequency directly
      filterNode.frequency.setValueAtTime(
        clampedTrackedCutoff,
        audioContext.currentTime
      );
    }
  }, [filterNode, audioContext, activeKeys]); // Removed filterCutoff from dependencies
}
