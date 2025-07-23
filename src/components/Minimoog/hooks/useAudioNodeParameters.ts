import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapCutoff } from "@/utils/paramMappingUtils";

type AudioNodeParametersProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | null;
  masterGain: GainNode | null;
  mixerNode: GainNode | null;
};

export function useAudioNodeParameters({
  audioContext,
  filterNode,
  masterGain,
  mixerNode,
}: AudioNodeParametersProps) {
  const { filterCutoff, filterEmphasis, mainVolume, isMainActive } =
    useSynthStore();

  // Set filter cutoff and emphasis (Moog ZDF Filter)
  useEffect(() => {
    if (!filterNode || !audioContext) return;

    const cutoffParam = filterNode.parameters.get("cutoff");
    const resonanceParam = filterNode.parameters.get("resonance");

    if (cutoffParam && resonanceParam) {
      // Use the mapCutoff function to get the actual frequency
      const actualFreq = mapCutoff(filterCutoff);

      // Set Moog ZDF filter parameters
      cutoffParam.setValueAtTime(actualFreq, audioContext.currentTime);

      // Map emphasis (0-10) to resonance value (0-4) for Moog ZDF filter
      const resonanceValue = filterEmphasis / 2.5; // Scale to 0-4 range
      resonanceParam.setValueAtTime(resonanceValue, audioContext.currentTime);
    }
  }, [filterCutoff, filterEmphasis, audioContext, filterNode]);

  // Set master volume
  useEffect(() => {
    if (!masterGain || !audioContext) return;
    const gain = Math.pow(mainVolume / 10, 2);
    masterGain.gain.setValueAtTime(gain, audioContext.currentTime);
  }, [mainVolume, audioContext, masterGain]);

  // Set mixer volume based on master active state
  useEffect(() => {
    if (!audioContext || !mixerNode) return;

    if (!isMainActive) {
      mixerNode.gain.setValueAtTime(0, audioContext.currentTime);
    } else {
      // Mixer should pass through at unity gain when active
      mixerNode.gain.setValueAtTime(1, audioContext.currentTime);
    }
  }, [isMainActive, audioContext, mixerNode]);
}
