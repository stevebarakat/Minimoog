import { useEffect, useRef, useState } from "react";
import { getPooledNode, releaseNode, createMinimoogSaturation } from "@/utils";
import { log as logger } from "@/utils";

export function useAudioNodeCreation(audioContext: AudioContext | null) {
  const [isMixerReady, setIsMixerReady] = useState(false);

  // Store actual nodes
  const mixerNodeRef = useRef<GainNode | null>(null);
  const saturationNodeRef = useRef<WaveShaperNode | null>(null);
  const filterNodeRef = useRef<AudioWorkletNode | BiquadFilterNode | null>(
    null
  );
  const masterGainRef = useRef<GainNode | null>(null);
  const loudnessEnvelopeGainRef = useRef<GainNode | null>(null);
  const delayNodeRef = useRef<DelayNode | null>(null);
  const delayMixGainRef = useRef<GainNode | null>(null);
  const delayFeedbackGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);

  // Create and manage basic audio nodes (not filter)
  useEffect(() => {
    if (!audioContext) {
      // Cleanup existing nodes
      if (mixerNodeRef.current) {
        releaseNode(mixerNodeRef.current);
        mixerNodeRef.current = null;
      }
      if (saturationNodeRef.current) {
        saturationNodeRef.current.disconnect();
        saturationNodeRef.current = null;
      }
      if (filterNodeRef.current) {
        filterNodeRef.current.disconnect();
        filterNodeRef.current = null;
      }
      if (masterGainRef.current) {
        releaseNode(masterGainRef.current);
        masterGainRef.current = null;
      }
      if (loudnessEnvelopeGainRef.current) {
        releaseNode(loudnessEnvelopeGainRef.current);
        loudnessEnvelopeGainRef.current = null;
      }
      if (delayNodeRef.current) {
        delayNodeRef.current.disconnect();
        delayNodeRef.current = null;
      }
      if (delayMixGainRef.current) {
        releaseNode(delayMixGainRef.current);
        delayMixGainRef.current = null;
      }
      if (delayFeedbackGainRef.current) {
        releaseNode(delayFeedbackGainRef.current);
        delayFeedbackGainRef.current = null;
      }
      if (dryGainRef.current) {
        releaseNode(dryGainRef.current);
        dryGainRef.current = null;
      }
      setIsMixerReady(false);
      return;
    }

    // Create basic nodes (mixer, saturation, master gain, loudness envelope)
    mixerNodeRef.current = getPooledNode("gain", audioContext) as GainNode;
    saturationNodeRef.current = createMinimoogSaturation(audioContext);
    masterGainRef.current = getPooledNode("gain", audioContext) as GainNode;
    loudnessEnvelopeGainRef.current = getPooledNode(
      "gain",
      audioContext
    ) as GainNode;

    // Create delay node with reasonable defaults
    delayNodeRef.current = audioContext.createDelay(2.0); // Max 2 second delay
    delayNodeRef.current.delayTime.setValueAtTime(
      1.5,
      audioContext.currentTime
    ); // 1500ms default

    // Create delay mix and feedback gain nodes
    delayMixGainRef.current = getPooledNode("gain", audioContext) as GainNode;
    delayMixGainRef.current.gain.setValueAtTime(0.5, audioContext.currentTime); // 50% mix default

    delayFeedbackGainRef.current = getPooledNode(
      "gain",
      audioContext
    ) as GainNode;
    delayFeedbackGainRef.current.gain.setValueAtTime(
      0.3,
      audioContext.currentTime
    ); // 30% feedback default

    // Create dry gain node for dry signal path
    dryGainRef.current = getPooledNode("gain", audioContext) as GainNode;
    dryGainRef.current.gain.setValueAtTime(0.5, audioContext.currentTime); // 50% dry default

    // Initialize loudness envelope gain to 0 (silent) so envelope can control volume
    if (loudnessEnvelopeGainRef.current && audioContext) {
      loudnessEnvelopeGainRef.current.gain.setValueAtTime(
        0,
        audioContext.currentTime
      );
    }

    // Set up the basic audio chain: loudness envelope -> delay -> master gain -> destination
    // Also set up delay feedback: delay -> feedback gain -> delay
    if (
      masterGainRef.current &&
      delayNodeRef.current &&
      loudnessEnvelopeGainRef.current &&
      delayMixGainRef.current &&
      delayFeedbackGainRef.current &&
      dryGainRef.current
    ) {
      // Split signal: loudness envelope -> dry gain + delay mix gain
      loudnessEnvelopeGainRef.current.connect(dryGainRef.current);
      loudnessEnvelopeGainRef.current.connect(delayMixGainRef.current);

      // Wet path: delay mix gain -> delay -> master gain
      delayMixGainRef.current.connect(delayNodeRef.current);
      delayNodeRef.current.connect(masterGainRef.current);

      // Dry path: dry gain -> master gain
      dryGainRef.current.connect(masterGainRef.current);

      // Feedback path: delay -> feedback gain -> delay
      delayNodeRef.current.connect(delayFeedbackGainRef.current);
      delayFeedbackGainRef.current.connect(delayNodeRef.current);

      masterGainRef.current.connect(audioContext.destination);
      setIsMixerReady(true);
    }

    return () => {
      // Cleanup basic nodes when audioContext changes
      if (mixerNodeRef.current) {
        releaseNode(mixerNodeRef.current);
        mixerNodeRef.current = null;
      }
      if (masterGainRef.current) {
        releaseNode(masterGainRef.current);
        masterGainRef.current = null;
      }
      if (loudnessEnvelopeGainRef.current) {
        releaseNode(loudnessEnvelopeGainRef.current);
        loudnessEnvelopeGainRef.current = null;
      }
      if (delayNodeRef.current) {
        delayNodeRef.current.disconnect();
        delayNodeRef.current = null;
      }
      if (delayMixGainRef.current) {
        releaseNode(delayMixGainRef.current);
        delayMixGainRef.current = null;
      }
      if (delayFeedbackGainRef.current) {
        releaseNode(delayFeedbackGainRef.current);
        delayFeedbackGainRef.current = null;
      }
      if (dryGainRef.current) {
        releaseNode(dryGainRef.current);
        dryGainRef.current = null;
      }
      setIsMixerReady(false);
    };
  }, [audioContext]);

  // Separate effect for filter creation and management
  useEffect(() => {
    if (
      !audioContext ||
      !mixerNodeRef.current ||
      !loudnessEnvelopeGainRef.current
    ) {
      return;
    }

    let cancelled = false;

    async function setupFilter() {
      // audioContext is guaranteed to be non-null here due to the guard above
      const ctx = audioContext!;

      try {
        // Clean up existing filter first
        if (filterNodeRef.current) {
          filterNodeRef.current.disconnect();
          filterNodeRef.current = null;
        }

        // Use Huovilainen WASM-based filter (the authentic Moog ladder filter)
        const processorUrl =
          "/audio/moog-filters/huovilainen/huovilainen-worklet-processor.js";
        const wasmUrl =
          "/audio/moog-filters/huovilainen/huovilainenFilterKernel.wasm";

        // Load the processor
        await ctx.audioWorklet.addModule(processorUrl);

        // Load the WASM module
        const response = await fetch(wasmUrl);
        if (!response.ok) {
          throw new Error(`Failed to load WASM module: ${response.statusText}`);
        }
        const wasmBuffer = await response.arrayBuffer();

        if (cancelled) return;

        // Create the filter node
        const workletNode = new AudioWorkletNode(
          ctx,
          "huovilainen-worklet-processor",
          {
            numberOfInputs: 1,
            numberOfOutputs: 1,
            outputChannelCount: [1],
          }
        );

        // Send WASM buffer to the worklet
        workletNode.port.postMessage(wasmBuffer);

        filterNodeRef.current = workletNode;

        // Connect the complete chain: mixer -> saturation -> filter -> loudness envelope
        if (
          mixerNodeRef.current &&
          saturationNodeRef.current &&
          filterNodeRef.current &&
          loudnessEnvelopeGainRef.current
        ) {
          // Disconnect mixer from any existing connections
          mixerNodeRef.current.disconnect();
          saturationNodeRef.current.disconnect();
          // Connect the new chain with saturation for warmth
          mixerNodeRef.current.connect(saturationNodeRef.current);
          saturationNodeRef.current.connect(filterNodeRef.current);
          filterNodeRef.current.connect(loudnessEnvelopeGainRef.current);
        }
      } catch (error) {
        logger.error("Failed to create filter node:", error);
        // Fallback: connect mixer through saturation to loudness envelope (bypass filter)
        if (
          mixerNodeRef.current &&
          saturationNodeRef.current &&
          loudnessEnvelopeGainRef.current
        ) {
          mixerNodeRef.current.disconnect();
          saturationNodeRef.current.disconnect();
          mixerNodeRef.current.connect(saturationNodeRef.current);
          saturationNodeRef.current.connect(loudnessEnvelopeGainRef.current);
        }
      }
    }

    setupFilter();

    return () => {
      cancelled = true;
    };
  }, [audioContext]);



  return {
    mixerNode: mixerNodeRef.current,
    saturationNode: saturationNodeRef.current,
    filterNode: filterNodeRef.current,
    loudnessEnvelopeGain: loudnessEnvelopeGainRef.current,
    delayNode: delayNodeRef.current,
    delayMixGain: delayMixGainRef.current,
    delayFeedbackGain: delayFeedbackGainRef.current,
    dryGain: dryGainRef.current,
    masterGain: masterGainRef.current,
    isMixerReady,
  };
}
