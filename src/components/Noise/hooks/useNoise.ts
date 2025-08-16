import { useEffect, useRef, useState } from "react";
import { useSynthStore } from "@/store/synthStore";
import {
  resetGain,
  disconnectNode,
  getPooledNode,
  getPooledWorkletNode,
  releaseNode,
} from "@/utils";

export function useNoise(
  audioContext: AudioContext | null,
  mixerNode?: AudioNode | null
) {
  const { mixer } = useSynthStore();
  const gainRef = useRef<GainNode | null>(null);
  const noiseRef = useRef<AudioWorkletNode | null>(null);
  const isConnectedRef = useRef(false);
  const [isSetupComplete, setIsSetupComplete] = useState(false);

  // Core audio setup effect - only when audioContext changes
  useEffect(() => {
    if (!audioContext) {
      gainRef.current = null;
      noiseRef.current = null;
      isConnectedRef.current = false;
      setIsSetupComplete(false);
      return;
    }
    let cancelled = false;

    async function setup() {
      if (!audioContext) return;

      // Skip audio worklet setup in test environment
      if (process.env.NODE_ENV === "test") {
        console.warn("Skipping audio worklet setup in test environment");
        return;
      }

      try {
        const moduleUrl =
          mixer.noise.noiseType === "pink"
            ? "/audio/noise-generators/pink-noise-processor.js"
            : "/audio/noise-generators/white-noise-processor.js";
        await audioContext.audioWorklet.addModule(moduleUrl);
        if (cancelled) return;

        // Always create the nodes
        gainRef.current = getPooledNode("gain", audioContext) as GainNode;
        // Start with zero gain, will be set to correct value after worklet creation
        gainRef.current.gain.setValueAtTime(0, audioContext.currentTime);

        noiseRef.current = getPooledWorkletNode(
          audioContext,
          mixer.noise.noiseType === "pink"
            ? "pink-noise-processor"
            : "white-noise-processor"
        );
        noiseRef.current.connect(gainRef.current);

        // Mark setup as complete so other effects can run
        setIsSetupComplete(true);
      } catch (error) {
        // Handle errors gracefully, especially in test environment
        if (process.env.NODE_ENV === "test") {
          console.warn(
            "Audio worklet setup failed in test environment:",
            error
          );
        } else {
          console.error("Failed to setup noise audio worklet:", error);
        }
      }
    }

    // Handle the async setup properly
    setup().catch((error) => {
      // Handle any unhandled promise rejections
      if (process.env.NODE_ENV === "test") {
        console.warn(
          "Audio worklet setup promise rejected in test environment:",
          error
        );
      } else {
        console.error("Audio worklet setup promise rejected:", error);
      }
    });

    return () => {
      cancelled = true;
      if (gainRef.current) {
        releaseNode(gainRef.current);
        gainRef.current = null;
      }
      if (noiseRef.current) {
        releaseNode(noiseRef.current);
        noiseRef.current = null;
      }
      isConnectedRef.current = false;
      setIsSetupComplete(false);
    };
  }, [audioContext, mixer.noise.noiseType]);

  // Handle connection/disconnection based on enabled state - wait for setup to complete
  useEffect(() => {
    if (!gainRef.current || !audioContext || !isSetupComplete) return;

    if (mixer.noise.enabled && !isConnectedRef.current) {
      // Connect to audio graph
      if (mixerNode) {
        gainRef.current.connect(mixerNode);
      } else {
        gainRef.current.connect(audioContext.destination);
      }
      isConnectedRef.current = true;
    } else if (!mixer.noise.enabled && isConnectedRef.current) {
      // Disconnect from audio graph
      disconnectNode(gainRef.current);
      isConnectedRef.current = false;
    }
  }, [mixer.noise.enabled, mixerNode, audioContext, isSetupComplete]);

  // Volume control effect - wait for setup to complete
  useEffect(() => {
    if (gainRef.current && audioContext && isSetupComplete) {
      const newGain = mixer.noise.volume / 10;
      resetGain(gainRef.current, isFinite(newGain) ? newGain : 0, audioContext);
    }
  }, [mixer.noise.volume, audioContext, isSetupComplete]);
}
