import { useEffect, useRef } from "react";
import { useSynthStore } from "@/store/synthStore";
import { resetGain, disconnectNode, getPooledNode, releaseNode } from "@/utils";

export function useNoise(
  audioContext: AudioContext | null,
  mixerNode?: AudioNode | null
) {
  const { mixer, activeKeys } = useSynthStore();
  const gainRef = useRef<GainNode | null>(null);
  const noiseRef = useRef<AudioWorkletNode | null>(null);
  const isConnectedRef = useRef(false);

  useEffect(() => {
    if (!audioContext) {
      gainRef.current = null;
      noiseRef.current = null;
      isConnectedRef.current = false;
      return;
    }
    let cancelled = false;

    async function setup() {
      if (!audioContext || !activeKeys) return;

      const moduleUrl =
        mixer.noise.noiseType === "pink"
          ? "/noise-processors/pink-noise-processor.js"
          : "/noise-processors/white-noise-processor.js";
      await audioContext.audioWorklet.addModule(moduleUrl);
      if (cancelled) return;

      // Always create the nodes
      gainRef.current = getPooledNode("gain", audioContext) as GainNode;
      const initialGain = mixer.noise.volume / 10;
      gainRef.current.gain.setValueAtTime(
        isFinite(initialGain) ? initialGain : 0,
        audioContext.currentTime
      );

      noiseRef.current = new AudioWorkletNode(
        audioContext,
        mixer.noise.noiseType === "pink"
          ? "pink-noise-processor"
          : "white-noise-processor"
      );
      noiseRef.current.connect(gainRef.current);

      // Only connect to the audio graph if noise is enabled
      if (mixer.noise.enabled && !isConnectedRef.current) {
        if (mixerNode) {
          gainRef.current.connect(mixerNode);
        } else {
          gainRef.current.connect(audioContext.destination);
        }
        isConnectedRef.current = true;
      }
    }
    setup();

    return () => {
      cancelled = true;
      if (gainRef.current) {
        releaseNode(gainRef.current);
        gainRef.current = null;
      }
      if (noiseRef.current) {
        noiseRef.current.disconnect();
        noiseRef.current = null;
      }
      isConnectedRef.current = false;
    };
  }, [
    audioContext,
    mixer.noise.noiseType,
    mixerNode,
    activeKeys,
    mixer.noise.volume,
    mixer.noise.enabled,
  ]);

  // Handle connection/disconnection based on enabled state
  useEffect(() => {
    if (!gainRef.current || !audioContext) return;

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
  }, [mixer.noise.enabled, mixerNode, audioContext]);

  useEffect(() => {
    if (gainRef.current && audioContext) {
      const newGain = mixer.noise.volume / 10;
      resetGain(gainRef.current, isFinite(newGain) ? newGain : 0, audioContext);
    }
  }, [mixer.noise.volume, audioContext]);
}
