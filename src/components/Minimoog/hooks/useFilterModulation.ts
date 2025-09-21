import { useRef, useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { calculateKeyboardControlledCutoff } from "@/utils";
import { useKeyboardControl } from "./useKeyboardControl";
import { calculateGradualModulation } from "@/utils/modulationUtils";

type FilterModulationProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | null;
  getModSignal: (time: number) => number;
};

export function useFilterModulation({
  audioContext,
  filterNode,
  getModSignal,
}: FilterModulationProps) {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const getModSignalRef = useRef(getModSignal);
  const filterModulationOn = useSynthStore((state) => state.filterModulationOn);

  // Get keyboard control state at the hook level for proper reactivity
  const activeKeys = useSynthStore((state) => state.activeKeys);
  
  // Use the shared keyboard control calculation
  const keyboardControlOffset = useKeyboardControl(activeKeys);

  // Add smoothing state to prevent audio artifacts
  const lastCutoffRef = useRef<number>(0);

  // Track envelope state for modulation integration
  const envelopeStateRef = useRef<{
    isActive: boolean;
    currentValue: number;
    startTime: number;
    attackTime: number;
    decayTime: number;
    sustainLevel: number;
    peakValue: number;
  }>({
    isActive: false,
    currentValue: 0,
    startTime: 0,
    attackTime: 0,
    decayTime: 0,
    sustainLevel: 0,
    peakValue: 0,
  });

  useEffect(() => {
    // Clear existing interval and timeout immediately
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    if (timeoutRef.current !== null) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    // Exit early if modulation is off or dependencies are missing
    if (!filterModulationOn || !audioContext || !filterNode) {
      return;
    }

    // Always keep the ref current - this fixes the restart issue
    getModSignalRef.current = getModSignal;

    // Listen for envelope messages from the filter envelope system
    const handleEnvelopeMessage = (event: MessageEvent) => {
      const { data } = event;

      if (data.envelopeAttack && data.forModulation) {
        // Envelope attack started - track it for modulation
        envelopeStateRef.current = {
          isActive: true,
          currentValue: 0,
          startTime: audioContext.currentTime,
          attackTime: data.attackTime,
          decayTime: data.decayTime,
          sustainLevel: data.sustainLevel,
          peakValue: data.peakCutoff - data.startCutoff,
        };
      } else if (data.envelopeRelease && data.forModulation) {
        // Envelope release started
        envelopeStateRef.current.isActive = false;
      }
    };

    filterNode.port.addEventListener("message", handleEnvelopeMessage);

    // Start modulation immediately
    const startModulation = () => {
      // Double-check that modulation is still on
      if (!filterModulationOn || !audioContext || !filterNode) {
        return;
      }

      // Get current state for base calculations
      const state = useSynthStore.getState();
      const baseCutoff = calculateKeyboardControlledCutoff(
        state.filterCutoff,
        0
      );

      // Initialize the last cutoff for smoothing
      lastCutoffRef.current = baseCutoff;

      // Send initial cutoff to filter
      filterNode.port.postMessage({ cutOff: baseCutoff });

      // Disable envelope updates to prevent conflicts with modulation
      filterNode.port.postMessage({ setEnvelopeActive: false });

      // Start the modulation interval
      intervalRef.current = setInterval(() => {
        // Double-check that modulation is still on
        if (!filterModulationOn || !filterNode?.port) {
          if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
          }
          return;
        }

        try {
          const time = audioContext.currentTime;

          // Ensure we have a working modulation signal
          if (!getModSignalRef.current) {
            getModSignalRef.current = getModSignal;
          }

          const modVal = getModSignalRef.current
            ? getModSignalRef.current(time)
            : 0;

          // Get current state
          const state = useSynthStore.getState();
          const modWheel = state.modWheel || 0;
          const filterContourAmount = state.filterContourAmount;

          // Use the shared keyboard control calculation from the hook
          // Use the single source of truth for keyboard-controlled cutoff calculation
          const keyboardControlFrequency = calculateKeyboardControlledCutoff(
            state.filterCutoff,
            keyboardControlOffset
          );
          const baseCutoff = keyboardControlFrequency;

          // Only apply modulation if the modulation wheel is actually turned up
          if (modWheel <= 0) {
            // No modulation - just send the base cutoff
            filterNode.port.postMessage({ cutOff: baseCutoff });
            return;
          }

          // Calculate real envelope influence when modulation is active
          let envelopeInfluence = 1;
          if (filterContourAmount > 0 && envelopeStateRef.current.isActive) {
            const envelope = envelopeStateRef.current;
            const elapsed = time - envelope.startTime;

            let envelopeValue = 0;
            if (elapsed < envelope.attackTime) {
              // Attack phase
              envelopeValue =
                (elapsed / envelope.attackTime) * envelope.peakValue;
            } else if (elapsed < envelope.attackTime + envelope.decayTime) {
              // Decay phase
              const decayElapsed = elapsed - envelope.attackTime;
              const decayProgress = decayElapsed / envelope.decayTime;
              envelopeValue =
                envelope.peakValue * (1 - decayProgress) +
                envelope.peakValue * envelope.sustainLevel * decayProgress;
            } else {
              // Sustain phase
              envelopeValue = envelope.peakValue * envelope.sustainLevel;
            }

            // Limit envelope influence to prevent extreme modulation ranges
            const rawInfluence = 1 + envelopeValue / baseCutoff;
            envelopeInfluence = Math.min(2, Math.max(0.5, rawInfluence));
          }

          // AUTHENTIC MINIMOOG: Integrate Filter Contour directly into modulation
          // When contour is active, it influences the modulation depth
          let contourInfluence = 1;
          if (filterContourAmount > 0) {
            // Map contour amount (0-10) to influence (0.01x to 20x) - EXTREMELY DRAMATIC
            const contourAmount = filterContourAmount / 10; // 0 to 1
            contourInfluence = 0.01 + contourAmount * 19.99; // 0.01x to 20x range
          }

          // Apply modulation with original range (3x as originally implemented)
          // Use a power curve to make small ModWheel values more subtle
          const powerCurve = calculateGradualModulation(modWheel, 1, 2.0);

          // Restore original modulation range (3x)
          const modulationRange = baseCutoff * 3 * powerCurve;

          // Apply both envelope and contour influence to modulation depth
          const totalInfluence = envelopeInfluence * contourInfluence;
          const contourModulatedRange = modulationRange * totalInfluence;

          // modVal is between -1 and 1, so we map it to the modulation range
          // Use the full contour-modulated range for authentic Minimoog behavior
          const modulatedCutoff = baseCutoff + modVal * contourModulatedRange;

          // Clamp to valid frequency range (allow lower frequencies for keyboard control to work)
          const targetCutoff = Math.max(20, Math.min(20000, modulatedCutoff));

          // Send to filter
          const message = { cutOff: targetCutoff };

          try {
            filterNode.port.postMessage(message);
          } catch (sendError) {
            console.error("Error sending message to filter:", sendError);
          }
        } catch (error) {
          console.error("Filter modulation error:", error);
        }
      }, 16); // 16ms for fast modulation response
    };

    // Start modulation with a small delay to ensure setup is complete
    timeoutRef.current = setTimeout(startModulation, 16);

    // Cleanup function
    return () => {
      // Safely remove event listener if filterNode exists
      if (filterNode?.port) {
        filterNode.port.removeEventListener("message", handleEnvelopeMessage);
      }

      // Clear all timers
      if (timeoutRef.current !== null) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (intervalRef.current !== null) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [
    filterModulationOn,
    audioContext,
    filterNode,
    getModSignal,
    activeKeys,
    keyboardControlOffset,
  ]);
}
