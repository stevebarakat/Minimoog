import { useRef, useEffect, useState } from "react";
import { disconnectNode } from "@/utils/audioUtils";

export function useAudioNodeCreation(audioContext: AudioContext | null) {
  const [isMixerReady, setIsMixerReady] = useState(false);
  const mixerNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<AudioWorkletNode | null>(null);
  const loudnessEnvelopeGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  // Initialize audio nodes
  useEffect(() => {
    if (!audioContext) return;

    let isMounted = true;

    (async () => {
      try {
        // --- Mixer ---
        const mixer = audioContext.createGain();
        mixer.gain.setValueAtTime(1, audioContext.currentTime);
        mixerNodeRef.current = mixer;
        setIsMixerReady(true);

        // --- Moog ZDF Filter ---
        await audioContext.audioWorklet.addModule("/moog-zdf-processor.js");
        const moogFilter = new AudioWorkletNode(
          audioContext,
          "moog-zdf-processor",
          {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [1],
          }
        );
        filterNodeRef.current = moogFilter;

        // --- Loudness Envelope Gain ---
        const loudnessGain = audioContext.createGain();
        loudnessGain.gain.setValueAtTime(1, audioContext.currentTime);
        loudnessEnvelopeGainRef.current = loudnessGain;

        // --- Master Gain ---
        const masterGain = audioContext.createGain();
        masterGain.gain.setValueAtTime(1, audioContext.currentTime);
        masterGainRef.current = masterGain;

        // --- Connect: Mixer -> Moog ZDF Filter -> Loudness Envelope -> Master -> Destination ---
        if (isMounted && mixer && moogFilter && loudnessGain && masterGain) {
          mixer.connect(moogFilter);
          moogFilter.connect(loudnessGain);
          loudnessGain.connect(masterGain);
          masterGain.connect(audioContext.destination);
        }
      } catch (error) {
        console.error("Failed to initialize Moog ZDF filter:", error);
        return;
      }
    })();

    return () => {
      isMounted = false;
      if (mixerNodeRef.current) {
        disconnectNode(mixerNodeRef.current);
        mixerNodeRef.current = null;
        setIsMixerReady(false);
      }
      if (filterNodeRef.current) {
        disconnectNode(filterNodeRef.current);
        filterNodeRef.current = null;
      }
      if (loudnessEnvelopeGainRef.current) {
        disconnectNode(loudnessEnvelopeGainRef.current);
        loudnessEnvelopeGainRef.current = null;
      }
      if (masterGainRef.current) {
        disconnectNode(masterGainRef.current);
        masterGainRef.current = null;
      }
    };
  }, [audioContext]);

  return {
    mixerNode: mixerNodeRef.current,
    filterNode: filterNodeRef.current,
    loudnessEnvelopeGain: loudnessEnvelopeGainRef.current,
    masterGain: masterGainRef.current,
    isMixerReady,
  };
}
