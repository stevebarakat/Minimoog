import { useMasterVolume } from "./useMasterVolume";
import { useEffectsVolume } from "./useEffectsVolume";
import { useDelayParameters } from "./useDelayParameters";
import { useReverbParameters } from "./useReverbParameters";
import { useFilterParameters } from "./useFilterParameters";
type AudioNodeParametersProps = {
  audioContext: AudioContext | null;
  filterNode: AudioWorkletNode | BiquadFilterNode | null;
  delayNode: DelayNode | null;
  reverbToneFilter: BiquadFilterNode | null;
  delayMixGain: GainNode | null;
  reverbMixGain: GainNode | null;
  dryGain: GainNode | null;
  effectsGain: GainNode | null;
  masterGain: GainNode | null;
  mixerNode: GainNode | null;
};

export function useAudioNodeParameters({
  audioContext,
  filterNode,
  delayNode,
  reverbToneFilter,
  delayMixGain,
  reverbMixGain,
  dryGain,
  effectsGain,
  masterGain,
  mixerNode,
}: AudioNodeParametersProps) {
  useMasterVolume({ audioContext, masterGain, mixerNode });
  useEffectsVolume({ audioContext, effectsGain, dryGain });
  useDelayParameters({ audioContext, delayNode, delayMixGain });
  useReverbParameters({
    audioContext,
    reverbMixGain,
    dryGain,
    reverbToneFilter,
  });
  useFilterParameters({ audioContext, filterNode });
}
