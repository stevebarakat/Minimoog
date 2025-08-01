import { useNoise } from "@/components/Noise/hooks";
import { useTuner } from "@/components/Tuner/hooks";
import { useAuxOutput } from "@/components/Output/hooks";

export function useNoiseAndAux(
  audioContext: AudioContext | null,
  mixerNode: AudioNode | null,
  masterGain: GainNode | null
) {
  // Set up noise
  const validCtx = audioContext && mixerNode ? audioContext : null;
  const validMixer =
    audioContext && mixerNode instanceof GainNode ? mixerNode : null;
  useNoise(validCtx, validMixer);

  // Set up tuner
  useTuner(audioContext);

  // Set up aux output
  useAuxOutput(audioContext, masterGain);
}
