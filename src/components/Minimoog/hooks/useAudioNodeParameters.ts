import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapCutoff, mapResonance } from "@/utils";
import { useKeyboardControl } from "./useFilterTracking";

type AudioNodeParametersProps = {
  audioContext: AudioContext | null;
  masterGain: GainNode | null;
  mixerNode: GainNode | null;
  filterNode: AudioWorkletNode | BiquadFilterNode | null;
};

export function useAudioNodeParameters({
  audioContext,
  masterGain,
  mixerNode,
  filterNode,
}: AudioNodeParametersProps) {
  const {
    mainVolume,
    isMainActive,
    filterCutoff,
    filterEmphasis,
    activeKeys,
    filterModulationOn,
  } = useSynthStore();

  // Get keyboard control offset for filter tracking
  const keyboardControlOffset = useKeyboardControl(activeKeys);

  // Set master volume
  useEffect(() => {
    if (!masterGain || !audioContext) return;

    // Validate main volume to prevent non-finite errors
    const validVolume = isFinite(mainVolume)
      ? Math.max(0, Math.min(10, mainVolume))
      : 2;
    const gain = Math.pow(validVolume / 10, 2);

    // Double-check gain is finite
    const validGain = isFinite(gain) ? Math.max(0, Math.min(1, gain)) : 0.04;

    try {
      masterGain.gain.setValueAtTime(validGain, audioContext.currentTime);
    } catch (error) {
      console.error("Error setting master volume:", error, {
        mainVolume,
        validVolume,
        gain,
        validGain,
        isFinite: isFinite(validGain),
      });
    }
  }, [mainVolume, audioContext, masterGain]);

  // Set mixer volume based on master active state
  useEffect(() => {
    if (!audioContext || !mixerNode) return;

    try {
      if (!isMainActive) {
        mixerNode.gain.setValueAtTime(0, audioContext.currentTime);
      } else {
        // Mixer should pass through at unity gain when active
        mixerNode.gain.setValueAtTime(1, audioContext.currentTime);
      }
    } catch (error) {
      console.error("Error setting mixer volume:", error, {
        isMainActive,
        currentTime: audioContext.currentTime,
      });
    }
  }, [isMainActive, audioContext, mixerNode]);

  // Set filter parameters with keyboard control
  useEffect(() => {
    if (!filterNode || !audioContext) return;

    // Apply keyboard control offset to the base cutoff
    // The offset is in octaves, so we need to convert it to the filter cutoff range
    const adjustedFilterCutoff = filterCutoff + keyboardControlOffset * 4; // More prominent key tracking
    const cutoff = mapCutoff(adjustedFilterCutoff);
    const resonance = mapResonance(filterEmphasis);

    if (filterNode instanceof AudioWorkletNode) {
      // Handle WASM-based filters
      // Always send resonance
      filterNode.port.postMessage({ resonance: resonance });

      // Only send cutoff if modulation is not active (modulation system will handle it)
      if (!filterModulationOn) {
        filterNode.port.postMessage({ cutOff: cutoff });
      }
    }
  }, [
    filterCutoff,
    filterEmphasis,
    filterNode,
    audioContext,
    keyboardControlOffset,
    filterModulationOn,
  ]);
}
