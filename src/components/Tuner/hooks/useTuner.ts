import { useEffect, useRef } from "react";
import { useSynthStore } from "@/store/synthStore";
import { MIDI } from "@/config";
import { getPooledNode, releaseNode } from "@/utils";

export function useTuner(audioContext: AudioContext | null) {
  const { tunerOn } = useSynthStore();
  const oscillatorRef = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!audioContext) return;

    if (tunerOn) {
      // Create oscillator for A-440 tone (oscillators are single-use, create directly)
      const oscillator = audioContext.createOscillator();
      oscillator.type = "sine"; // Pure sine wave for tuning
      oscillator.frequency.setValueAtTime(
        MIDI.A4_FREQUENCY,
        audioContext.currentTime
      ); // A-440 Hz

      // Create gain node for volume control
      const gainNode = getPooledNode("gain", audioContext) as GainNode;
      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime); // Moderate volume

      // Connect oscillator -> gain -> destination
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      // Start the oscillator
      oscillator.start();

      // Store references
      oscillatorRef.current = oscillator;
      gainNodeRef.current = gainNode;
    } else {
      // Stop and clean up when tuner is turned off
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        // Don't release oscillator to pool - they're single-use only
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        releaseNode(gainNodeRef.current);
        gainNodeRef.current = null;
      }
    }

    // Cleanup function
    return () => {
      if (oscillatorRef.current) {
        oscillatorRef.current.stop();
        // Don't release oscillator to pool - they're single-use only
        oscillatorRef.current = null;
      }
      if (gainNodeRef.current) {
        releaseNode(gainNodeRef.current);
        gainNodeRef.current = null;
      }
    };
  }, [audioContext, tunerOn]);
}
