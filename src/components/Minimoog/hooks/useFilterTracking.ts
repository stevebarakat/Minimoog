import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { noteToFrequency } from "@/utils";
import type { Note } from "@/types/note";
import { log as logger } from "@/utils/logUtils";

/**
 * Hook to calculate keyboard control offset for filter cutoff frequency tracking.
 * Keyboard Control 1 provides 1/3 of tracking, Keyboard Control 2 provides 2/3.
 * Together they provide full key tracking (1 octave filter change per 1 octave key change).
 */
export function useKeyboardControl(activeKeys: Note | null) {
  const { keyboardControl1, keyboardControl2 } = useSynthStore();

  return useMemo(() => {
    // If no active keys or no keyboard control switches are on, return no offset
    if (!activeKeys || (!keyboardControl1 && !keyboardControl2)) {
      return 0;
    }

    try {
      // Calculate the tracking amount based on which switches are on
      let trackingAmount = 0;
      if (keyboardControl1) trackingAmount += 1 / 3; // 1/3 tracking
      if (keyboardControl2) trackingAmount += 2 / 3; // 2/3 tracking

      if (trackingAmount === 0) return 0;

      // Extract note string from activeKeys (handle both string and object types)
      const noteString =
        typeof activeKeys === "string" ? activeKeys : activeKeys.note;

      // Use middle C (C4) as the reference note (no offset)
      const referenceFreq = noteToFrequency("C4"); // ~261.63 Hz
      const activeFreq = noteToFrequency(noteString);

      // Calculate the octave difference from the reference note
      const octaveDifference = Math.log2(activeFreq / referenceFreq);

      // Apply the tracking amount to get the filter cutoff offset
      // Positive offset for higher notes, negative for lower notes
      const keyboardOffset = octaveDifference * trackingAmount;

      return keyboardOffset;
    } catch (error) {
      logger.error("Error calculating keyboard control offset:", error);
      // If note parsing fails, return no offset
      return 0;
    }
  }, [activeKeys, keyboardControl1, keyboardControl2]);
}

// Updated to use the new keyboard control functionality
export function useFilterTracking(
  audioContext: AudioContext | null,
  filterNode: AudioWorkletNode | BiquadFilterNode | null,
  activeKeys: Note | null
) {
  // Parameters kept for the hook signature but keyboard control is now handled separately
  void audioContext;
  void filterNode;
  return useKeyboardControl(activeKeys);
}
