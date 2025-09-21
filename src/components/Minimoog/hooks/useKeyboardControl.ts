import { useMemo } from "react";
import { useSynthStore } from "@/store/synthStore";
import { noteToFrequency } from "@/utils/core";
import type { Note } from "@/types/note";
import { logger } from "@/utils/core";

/**
 * Hook to calculate keyboard control offset for filter cutoff frequency tracking.
 * Enhanced version that makes the keyboard control more noticeable without changing tracking amount.
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

      // Enhanced keyboard control - make it much more noticeable with dramatic harmonic enhancement
      // This doesn't change the tracking amount but makes the effect very dramatic
      const harmonicMultiplier = 1 + Math.abs(keyboardOffset) * 0.25; // Much more dramatic
      const enhancedOffset = keyboardOffset * harmonicMultiplier;

      // Add additional enhancement based on note frequency for more dramatic effect
      const noteEnhancement = Math.abs(octaveDifference) > 1 ? 1.3 : 1.0; // Extra boost for notes far from C4
      const finalOffset = enhancedOffset * noteEnhancement;

      return finalOffset;
    } catch (error) {
      logger.error("Error calculating keyboard control offset:", error);
      // If note parsing fails, return no offset
      return 0;
    }
  }, [activeKeys, keyboardControl1, keyboardControl2]);
}
