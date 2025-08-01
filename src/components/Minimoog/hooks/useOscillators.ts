import { useOscillatorFactory } from "@/components/OscillatorBank/hooks/useOscillatorFactory";
import { getOscillatorFactory } from "@/components/OscillatorBank/oscillatorRegistry";
import { useSynthStore } from "@/store/synthStore";
import type {
  OscillatorInstance,
  OscillatorCreateConfig,
} from "@/components/OscillatorBank/hooks/useOscillatorFactory";

/**
 * Fallback oscillator factory that creates a no-op oscillator instance
 * Used when the requested oscillator type is not available
 * @param {OscillatorCreateConfig} __config - Unused configuration parameter
 * @param {AudioNode} [__mixerNode] - Unused mixer node parameter
 * @returns {OscillatorInstance} A no-op oscillator instance
 */
const fallbackOscillatorFactory = (
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __config: OscillatorCreateConfig,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  __mixerNode?: AudioNode
): OscillatorInstance => ({
  start: () => {},
  stop: () => {},
  getNode: () => null,
  getGainNode: () =>
    ({
      gain: { value: 0, setValueAtTime: () => {} },
      connect: () => {},
      disconnect: () => {},
    } as unknown as GainNode),
  update: () => {},
  setFrequency: () => {},
});

/**
 * Hook that manages all three Minimoog oscillators (OSC1, OSC2, OSC3)
 * Creates and configures oscillators based on their waveform types and current state
 *
 * @param {AudioContext | null} audioContext - The Web Audio API context, or null if not initialized
 * @param {AudioNode | null} mixerNode - The mixer node to connect oscillators to, or null if not available
 * @param {number} vibratoAmount - The current vibrato amount (0-1) to apply to oscillators
 * @returns {Object} Object containing the three oscillator instances
 * @returns {OscillatorInstance} returns.osc1 - Oscillator 1 instance with start/stop/update methods
 * @returns {OscillatorInstance} returns.osc2 - Oscillator 2 instance with start/stop/update methods
 * @returns {OscillatorInstance} returns.osc3 - Oscillator 3 instance with start/stop/update methods
 */
function useOscillators(
  audioContext: AudioContext | null,
  mixerNode: AudioNode | null,
  vibratoAmount: number
) {
  const osc1State = useSynthStore((state) => state.oscillator1);
  const osc2State = useSynthStore((state) => state.oscillator2);
  const osc3State = useSynthStore((state) => state.oscillator3);

  const osc1Factory =
    getOscillatorFactory(osc1State.waveform) ?? fallbackOscillatorFactory;
  const osc2Factory =
    getOscillatorFactory(osc2State.waveform) ?? fallbackOscillatorFactory;
  const osc3Factory =
    getOscillatorFactory(osc3State.waveform) ?? fallbackOscillatorFactory;

  const osc1 = useOscillatorFactory(
    audioContext,
    mixerNode,
    {
      oscillatorKey: "oscillator1",
      mixerKey: "osc1",
      createOscillator: osc1Factory,
      detuneCents: 0,
      volumeBoost: 1,
    },
    vibratoAmount
  );

  const osc2 = useOscillatorFactory(
    audioContext,
    mixerNode,
    {
      oscillatorKey: "oscillator2",
      mixerKey: "osc2",
      createOscillator: osc2Factory,
      detuneCents: 0,
      volumeBoost: 1,
    },
    vibratoAmount
  );

  const osc3 = useOscillatorFactory(
    audioContext,
    mixerNode,
    {
      oscillatorKey: "oscillator3",
      mixerKey: "osc3",
      createOscillator: osc3Factory,
      detuneCents: 0,
      volumeBoost: 1,
    },
    vibratoAmount
  );

  return { osc1, osc2, osc3 };
}

export { useOscillators };
