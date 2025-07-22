import { useRef, useEffect, useState } from "react";
import { useSynthStore } from "@/store/synthStore";
import { AudioNodes } from "../types/synthTypes";
import { mapCutoff } from "../utils/synthUtils";

function useAudioNodes(audioContext: AudioContext | null): AudioNodes {
  const mixerNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<AudioWorkletNode | null>(null);
  const loudnessEnvelopeGainRef = useRef<GainNode | null>(null);
  const masterGainRef = useRef<GainNode | null>(null);
  const [isMixerReady, setIsMixerReady] = useState(false);

  const { filterCutoff, filterEmphasis, mainVolume, isMainActive } =
    useSynthStore();

  // Initialize audio nodes
  useEffect(() => {
    if (!audioContext) return;

    let isMounted = true;
    (async () => {
      try {
        // Register the Moog ZDF processor
        await audioContext.audioWorklet.addModule("/moog-zdf-processor.js");

        // Create nodes
        // --- Mixer ---
        const mixer = audioContext.createGain();
        mixer.gain.value = 1;
        mixerNodeRef.current = mixer;
        setIsMixerReady(true);

        // --- Saturation (unchanged) ---
        const saturationNode = audioContext.createWaveShaper();
        const saturationCurve = new Float32Array(4096);
        for (let i = 0; i < 4096; i++) {
          const x = (i * 2) / 4096 - 1;
          saturationCurve[i] = Math.tanh(x * 1.5) / 1.5; // Subtle saturation
        }
        saturationNode.curve = saturationCurve;
        saturationNode.oversample = "4x";

        // --- Moog ZDF Filter ---
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

        // --- Connect: Mixer -> Saturation -> Moog Filter -> Loudness Envelope -> Master -> Destination ---
        if (
          isMounted &&
          mixer &&
          saturationNode &&
          moogFilter &&
          loudnessGain &&
          masterGain
        ) {
          mixer.connect(moogFilter);
          // saturationNode.connect(moogFilter);
          moogFilter.connect(loudnessGain);
          loudnessGain.connect(masterGain);
          masterGain.connect(audioContext.destination);
        }
      } catch (error) {
        console.error("Failed to initialize Moog ZDF filter:", error);
        // If AudioWorklet fails, we can't proceed - this should work in modern browsers
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

    // Use the mapCutoff function to get the actual frequency
    const actualFreq = mapCutoff(filterCutoff);

    // Set Moog ZDF filter parameters
    filterNodeRef.current.parameters
      .get("cutoff")
      ?.setValueAtTime(actualFreq, audioContext.currentTime);

    // Map emphasis (0-10) to resonance (0-4) for Moog filter
    // Authentic to original Minimoog emphasis behavior
    const normalizedEmphasis = filterEmphasis / 10; // 0 to 1
    let resonanceValue;

    if (normalizedEmphasis < 0.6) {
      // Linear mapping for lower values (0-6 on emphasis = 0-2.0 resonance)
      resonanceValue = normalizedEmphasis * (2.0 / 0.6);
    } else if (normalizedEmphasis < 0.85) {
      // Curved mapping for middle values (6-8.5 on emphasis = 2.0-3.2 resonance)
      const remaining = normalizedEmphasis - 0.6;
      const curve = Math.pow(remaining / 0.25, 1.2);
      resonanceValue = 2.0 + curve * 1.2;
    } else {
      // Steep curve for self-oscillation (8.5-10 on emphasis = 3.2-4.0 resonance)
      const remaining = normalizedEmphasis - 0.85;
      const steepCurve = Math.pow(remaining / 0.15, 0.8);
      resonanceValue = 3.2 + steepCurve * 0.8;
    }

    resonanceValue = Math.max(0, Math.min(4, resonanceValue));

    filterNodeRef.current.parameters
      .get("resonance")
      ?.setValueAtTime(resonanceValue, audioContext.currentTime);
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

export default useAudioNodes;
