import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapCutoff, mapResonance } from "@/utils";
import { useKeyboardControl } from "./useFilterTracking";

type AudioNodeParametersProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | BiquadFilterNode | null;
  delayNode: DelayNode | null;
  delayMixGain: GainNode | null;
  delayFeedbackGain: GainNode | null;
  dryGain: GainNode | null;
  masterGain: GainNode | null;
  mixerNode: GainNode | null;
};

export function useAudioNodeParameters({
  audioContext,
  filterNode,
  delayNode,
  delayMixGain,
  delayFeedbackGain,
  dryGain,
  masterGain,
  mixerNode,
}: AudioNodeParametersProps) {
  const {
    mainVolume,
    isMainActive,
    filterCutoff,
    filterEmphasis,
    activeKeys,
    filterModulationOn,
    delay,
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

  // Set delay parameters
  useEffect(() => {
    if (!delayNode || !audioContext || !delay.enabled) return;

    try {
      // Map delay time from 0-10 to 0-2000ms
      const delayTimeMs = (delay.time / 10) * 2000;
      delayNode.delayTime.setValueAtTime(
        delayTimeMs / 1000,
        audioContext.currentTime
      );
    } catch (error) {
      console.error("Error setting delay time:", error, {
        delayTime: delay.time,
        currentTime: audioContext.currentTime,
      });
    }
  }, [delay.time, delay.enabled, audioContext, delayNode]);

  useEffect(() => {
    if (!delayMixGain || !audioContext) return;

    try {
      // Map mix from 0-10 to 0-1, or 0 if delay is disabled
      const mixGain = delay.enabled ? delay.mix / 10 : 0;
      delayMixGain.gain.setValueAtTime(mixGain, audioContext.currentTime);

      // When disabled, also set feedback to 0 to stop the feedback loop
      if (delayFeedbackGain) {
        const feedbackGain = delay.enabled ? (delay.feedback / 10) * 0.9 : 0;
        delayFeedbackGain.gain.setValueAtTime(
          feedbackGain,
          audioContext.currentTime
        );
      }
    } catch (error) {
      console.error("Error setting delay mix:", error, {
        delayMix: delay.mix,
        currentTime: audioContext.currentTime,
      });
    }
  }, [delay.mix, delay.enabled, audioContext, delayMixGain, delayFeedbackGain]);

  useEffect(() => {
    if (!dryGain || !audioContext) return;

    try {
      // Map mix from 0-10 to 1-0 (inverse of wet mix for dry signal)
      // When mix is 0, dry should be 100%. When mix is 10, dry should be 0%
      // When delay is disabled, dry should be 100%
      const dryGainValue = delay.enabled ? 1 - delay.mix / 10 : 1;
      dryGain.gain.setValueAtTime(dryGainValue, audioContext.currentTime);
    } catch (error) {
      console.error("Error setting dry gain:", error, {
        delayMix: delay.mix,
        currentTime: audioContext.currentTime,
      });
    }
  }, [delay.mix, delay.enabled, audioContext, dryGain]);

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
