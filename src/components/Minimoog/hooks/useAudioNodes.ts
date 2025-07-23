import { useRef, useEffect, useState } from "react";
import { useSynthStore } from "@/store/synthStore";
import { AudioNodes } from "../types/synthTypes";
import { mapCutoff } from "../utils/synthUtils";

export function useAudioNodes(audioContext: AudioContext | null): AudioNodes {
  const mixerNodeRef = useRef<GainNode | null>(null);
  const filterNodeRef = useRef<BiquadFilterNode | null>(null);
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

        // --- Biquad Filter (replacing Moog ZDF) ---
        const biquadFilter = audioContext.createBiquadFilter();
        biquadFilter.type = "lowpass";
        filterNodeRef.current = biquadFilter;

        // --- Loudness Envelope Gain ---
        const loudnessGain = audioContext.createGain();
        loudnessGain.gain.value = 1;
        loudnessEnvelopeGainRef.current = loudnessGain;

        // --- Master Gain ---
        const masterGain = audioContext.createGain();
        masterGain.gain.value = 1;
        masterGainRef.current = masterGain;

        // --- Connect: Mixer -> Saturation -> Biquad Filter -> Loudness Envelope -> Master -> Destination ---
        if (
          isMounted &&
          mixer &&
          saturationNode &&
          biquadFilter &&
          loudnessGain &&
          masterGain
        ) {
          mixer.connect(biquadFilter);
          // saturationNode.connect(biquadFilter);
          biquadFilter.connect(loudnessGain);
          loudnessGain.connect(masterGain);
          masterGain.connect(audioContext.destination);
        }
      } catch (error) {
        console.error("Failed to initialize Biquad filter:", error);
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

  // Set filter cutoff and emphasis (Biquad Filter)
  useEffect(() => {
    if (!filterNodeRef.current || !audioContext) return;

    // Use the mapCutoff function to get the actual frequency
    const actualFreq = mapCutoff(filterCutoff);

    // Clamp frequency to Web Audio API safe range
    const clampedFreq = Math.max(20, Math.min(22050, actualFreq));

    // Set Biquad filter parameters
    filterNodeRef.current.frequency.setValueAtTime(
      clampedFreq,
      audioContext.currentTime
    );

    // Map emphasis (0-10) to Q value (0-5) for Biquad filter
    const qValue = filterEmphasis / 2;
    filterNodeRef.current.Q.setValueAtTime(qValue, audioContext.currentTime);
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
