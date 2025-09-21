import { useVibratoEffect } from "./useVibratoEffect";

// Hook for oscillator modulation that integrates with the vibrato effect system
type OscillatorModulationProps = {
  audioContext: AudioContext | null;
  osc1: OscillatorNode | null;
  osc2: OscillatorNode | null;
  osc3: OscillatorNode | null;
  lfoNode: OscillatorNode | null;
};

export function useOscillatorModulation({
  audioContext,
  osc1,
  osc2,
  osc3,
  lfoNode,
}: OscillatorModulationProps) {
  // Create wrapper objects that match the expected interface for useVibratoEffect
  const osc1Wrapper = osc1 ? { getNode: () => osc1 } : null;
  const osc2Wrapper = osc2 ? { getNode: () => osc2 } : null;
  const osc3Wrapper = osc3 ? { getNode: () => osc3 } : null;

  // Use the existing vibrato effect hook for oscillator modulation
  useVibratoEffect({
    audioContext,
    lfoNode: lfoNode, // Pass the LFO node from the parent useModulation hook
    osc1: osc1Wrapper,
    osc2: osc2Wrapper,
    osc3: osc3Wrapper,
  });

  // Note: Oscillator modulation is handled by the LFO system through useVibratoEffect
}
