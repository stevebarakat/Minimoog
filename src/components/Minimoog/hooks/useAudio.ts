import { useSynthStore } from "@/store/synthStore";
import { useAudioNodes } from "./useAudioNodes";
import { useModulation } from "./useModulation";
import { useEnvelopes } from "./useEnvelopes";
import { useOverflowDirection } from "./useOverflowDirection";
import { useNoise } from "@/components/Noise/hooks";
import { useOscillatorFactory } from "@/components/OscillatorBank/hooks/useOscillatorFactory";
import { createOscillator1 } from "@/components/OscillatorBank/audio/oscillator1";
import { createOscillator2 } from "@/components/OscillatorBank/audio/oscillator2";
import { createOscillator3 } from "@/components/OscillatorBank/audio/oscillator3";
import { useTuner } from "@/components/Tuner/hooks";
import { useAuxOutput } from "@/components/Output/hooks";
import { useMidiHandling } from "@/components/Keyboard/hooks";

// Oscillator 1 types
type Osc1Waveform =
  | "triangle"
  | "tri_saw"
  | "sawtooth"
  | "pulse1"
  | "pulse2"
  | "pulse3";
type Osc1Range = "32" | "16" | "8" | "4" | "2" | "lo";
// Oscillator 2 types
type Osc2Waveform =
  | "triangle"
  | "tri_saw"
  | "sawtooth"
  | "pulse1"
  | "pulse2"
  | "pulse3";
type Osc2Range = "32" | "16" | "8" | "4" | "2" | "lo";
// Oscillator 3 types
type Osc3Waveform =
  | "triangle"
  | "rev_saw"
  | "sawtooth"
  | "pulse1"
  | "pulse2"
  | "pulse3";
type Osc3Range = "32" | "16" | "8" | "4" | "2" | "lo";

export function useAudio(audioContext: AudioContext | null) {
  const { mixerNode, filterNode, loudnessEnvelopeGain, masterGain } =
    useAudioNodes(audioContext);
  const containerRef = useOverflowDirection();

  // Set up oscillators
  const validCtx = audioContext && mixerNode ? audioContext : null;
  const validMixer =
    audioContext && mixerNode instanceof GainNode ? mixerNode : null;

  // Set up noise
  useNoise(validCtx, validMixer);

  // Set up tuner
  useTuner(audioContext);

  // Set up aux output
  useAuxOutput(audioContext, masterGain);

  // Vibrato amount
  const vibratoAmount = useSynthStore((state) => {
    if (!state.oscillatorModulationOn || state.modWheel <= 0) return 0;
    const clampedModWheel = Math.max(0, Math.min(100, state.modWheel));
    return clampedModWheel / 100;
  });

  // Helper to cast range and waveform to correct types
  function castOsc1(config: { range: string; waveform: string }) {
    return {
      range: config.range as Osc1Range,
      waveform: config.waveform as Osc1Waveform,
    };
  }
  function castOsc2(config: { range: string; waveform: string }) {
    return {
      range: config.range as Osc2Range,
      waveform: config.waveform as Osc2Waveform,
    };
  }
  function castOsc3(config: { range: string; waveform: string }) {
    return {
      range: config.range as Osc3Range,
      waveform: config.waveform as Osc3Waveform,
    };
  }

  const osc1 = useOscillatorFactory(
    validCtx,
    validMixer,
    {
      oscillatorKey: "oscillator1",
      mixerKey: "osc1",
      createOscillator: (config, mixerNode) =>
        createOscillator1({ ...config, ...castOsc1(config) }, mixerNode),
      detuneCents: 2, // osc1 slightly sharp
      volumeBoost: 1.2,
    },
    vibratoAmount
  );

  const osc2 = useOscillatorFactory(
    validCtx,
    validMixer,
    {
      oscillatorKey: "oscillator2",
      mixerKey: "osc2",
      createOscillator: (config, mixerNode) =>
        createOscillator2({ ...config, ...castOsc2(config) }, mixerNode),
      detuneCents: -3, // osc2 slightly flat
      volumeBoost: 1.15,
    },
    vibratoAmount
  );

  const osc3 = useOscillatorFactory(
    validCtx,
    validMixer,
    {
      oscillatorKey: "oscillator3",
      mixerKey: "osc3",
      createOscillator: (config, mixerNode) =>
        createOscillator3({ ...config, ...castOsc3(config) }, mixerNode),
      detuneCents: 1, // osc3 slightly sharp
      volumeBoost: 1.1,
    },
    vibratoAmount
  );

  // Set up modulation
  useModulation({ audioContext, osc1, osc2, osc3, filterNode });

  // Set up envelopes and get synth object
  const synthObj = useEnvelopes({
    audioContext,
    filterNode,
    loudnessEnvelopeGain,
    osc1,
    osc2,
    osc3,
  });

  // Set up MIDI handling with the synth object
  useMidiHandling(synthObj);

  return {
    mixerNode,
    filterNode,
    loudnessEnvelopeGain,
    masterGain,
    containerRef,
    osc1,
    osc2,
    osc3,
    synthObj,
  };
}
