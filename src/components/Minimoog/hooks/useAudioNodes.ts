import { useRef, useEffect, useState } from "react";
import { useSynthStore } from "@/store/synthStore";
import { AudioNodes } from "../types/synthTypes";
import { mapCutoff } from "../utils/synthUtils";

export function useAudioNodes(audioContext: AudioContext | null): AudioNodes {
  const [isMixerReady, setIsMixerReady] = useState(false);
  const mixerNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<AudioWorkletNode | null>(null); // Changed back to AudioWorkletNode
  const loudnessEnvelopeGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);

  const { filterCutoff, filterEmphasis, mainVolume, isMainActive } =
    useSynthStore();

  // Initialize audio nodes
  useEffect(() => {
    if (!audioContext) return;

    let isMounted = true;

    (async () => {
      try {
        // --- Mixer ---
        const mixer = audioContext.createGain();
        mixer.gain.value = 1;
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
        loudnessGain.gain.value = 1;
        loudnessEnvelopeGainRef.current = loudnessGain;

        // --- Master Gain ---
        const masterGain = audioContext.createGain();
        masterGain.gain.value = 1;
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

  // Set filter cutoff and emphasis (Moog ZDF Filter)
  useEffect(() => {
    if (!filterNodeRef.current || !audioContext) return;

    const cutoffParam = filterNodeRef.current.parameters.get("cutoff");
    const resonanceParam = filterNodeRef.current.parameters.get("resonance");

    if (cutoffParam && resonanceParam) {
      // Use the mapCutoff function to get the actual frequency
      const actualFreq = mapCutoff(filterCutoff);

      // Set Moog ZDF filter parameters
      cutoffParam.setValueAtTime(actualFreq, audioContext.currentTime);

      // Map emphasis (0-10) to resonance value (0-4) for Moog ZDF filter
      const resonanceValue = filterEmphasis / 2.5; // Scale to 0-4 range
      resonanceParam.setValueAtTime(resonanceValue, audioContext.currentTime);
    }
  }, [filterCutoff, filterEmphasis, audioContext]);

  // Set master volume
  useEffect(() => {
    if (!masterGainRef.current || !audioContext) return;
    const gain = Math.pow(mainVolume / 10, 2);
    masterGainRef.current.gain.setValueAtTime(gain, audioContext.currentTime);
  }, [mainVolume, audioContext]);

  // Set mixer volume based on master active state
  useEffect(() => {
    if (!audioContext || !mixerNodeRef.current) return;

    console.log("Mixer gain update:", {
      isMainActive,
      newGain: isMainActive ? 1 : 0,
      currentTime: audioContext.currentTime,
    });

    if (!isMainActive) {
      mixerNodeRef.current.gain.setValueAtTime(0, audioContext.currentTime);
    } else {
      // Mixer should pass through at unity gain when active
      mixerNodeRef.current.gain.setValueAtTime(1, audioContext.currentTime);
    }
  }, [isMainActive, audioContext]);

  return {
    mixerNode: mixerNodeRef.current,
    filterNode: filterNodeRef.current,
    loudnessEnvelopeGain: loudnessEnvelopeGainRef.current,
    masterGain: masterGainRef.current,
    isMixerReady,
  };
}
