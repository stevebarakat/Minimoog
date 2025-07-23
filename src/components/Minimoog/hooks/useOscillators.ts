import { useOscillatorFactory } from "@/components/OscillatorBank/hooks/useOscillatorFactory";
import { getOscillatorFactory } from "@/components/OscillatorBank/oscillatorRegistry";
import { useSynthStore } from "@/store/synthStore";
import type {
  OscillatorInstance,
  OscillatorCreateConfig,
} from "@/components/OscillatorBank/hooks/useOscillatorFactory";

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

function useOscillators(
  audioContext: AudioContext | null,
  mixerNode: AudioNode | null,
  vibratoAmount: number
) {
  // Get current waveform types from synth store
  const osc1State = useSynthStore((state) => state.oscillator1);
  const osc2State = useSynthStore((state) => state.oscillator2);
  const osc3State = useSynthStore((state) => state.oscillator3);

  // Get factories from registry based on current waveform
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
      detuneCents: 0, // Could be dynamic or from config
      volumeBoost: 1, // Could be dynamic or from config
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
