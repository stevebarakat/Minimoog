import { useRef, useEffect, useState } from "react";

export function useAudioNodeCreation(audioContext: AudioContext | null) {
  const [isMixerReady, setIsMixerReady] = useState(false);
  const mixerNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<AudioWorkletNode | null>(null);
  const loudnessEnvelopeGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (!audioContext) return;

    let isMounted = true;

    (async () => {
      try {
        // Create mixer first
        const mixer = audioContext.createGain();
        mixer.gain.value = 1;
        mixerNodeRef.current = mixer;
        setIsMixerReady(true);

        // Create loudness envelope gain immediately after mixer
        const loudnessGain = audioContext.createGain();
        loudnessGain.gain.value = 1;
        loudnessEnvelopeGainRef.current = loudnessGain;

        // Create master gain
        const masterGain = audioContext.createGain();
        masterGain.gain.value = 1;
        masterGainRef.current = masterGain;

        // Load filter module
        await audioContext.audioWorklet.addModule(
          "/moog-filters/moog-hybrid-processor.js"
        );

        const moogFilter = new AudioWorkletNode(
          audioContext,
          "moog-hybrid-processor",
          {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [1],
          }
        );

        console.log(
          "Filter initialized with Hybrid style (ZDF accuracy + Authentic character)"
        );
        filterNodeRef.current = moogFilter;

        // Connect everything
        if (isMounted && mixer && moogFilter && loudnessGain && masterGain) {
          mixer.connect(moogFilter);
          moogFilter.connect(loudnessGain);
          loudnessGain.connect(masterGain);
          masterGain.connect(audioContext.destination);
        }
      } catch (error) {
        console.error("Failed to initialize Moog Hybrid filter:", error);
        return;
      }
    })();

    return () => {
      isMounted = false;
      if (mixerNodeRef.current) {
        mixerNodeRef.current.disconnect();
        mixerNodeRef.current = null;
        setIsMixerReady(false);
      }
      if (filterNodeRef.current) {
        filterNodeRef.current.disconnect();
        filterNodeRef.current = null;
      }
      if (loudnessEnvelopeGainRef.current) {
        loudnessEnvelopeGainRef.current.disconnect();
        loudnessEnvelopeGainRef.current = null;
      }
      if (masterGainRef.current) {
        masterGainRef.current.disconnect();
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
