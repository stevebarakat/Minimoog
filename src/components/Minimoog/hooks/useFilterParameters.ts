import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { mapResonance, calculateKeyboardControlledCutoff } from "@/utils/core";
import { useKeyboardControl } from "./useKeyboardControl";

type FilterParametersProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | BiquadFilterNode | null;
};

export function useFilterParameters({
  audioContext,
  filterNode,
}: FilterParametersProps) {
  const { filterCutoff, filterEmphasis, activeKeys, filterModulationOn } =
    useSynthStore();

  const keyboardControlOffset = useKeyboardControl(activeKeys);

  useEffect(() => {
    if (!filterNode || !audioContext) return;

    if (filterNode instanceof AudioWorkletNode) {
      filterNode.port.postMessage({
        type: "parameter-update",
        parameter: "resonance",
        value: mapResonance(filterEmphasis),
      });

      if (!filterModulationOn) {
        const keyboardControlledCutoff = calculateKeyboardControlledCutoff(
          filterCutoff,
          keyboardControlOffset
        );
        filterNode.port.postMessage({
          type: "parameter-update",
          parameter: "cutOff",
          value: keyboardControlledCutoff,
        });
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
