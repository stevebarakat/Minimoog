import { useCallback, useEffect, useRef } from "react";
import { getPooledNode, releaseNode } from "@/utils/nodePoolingUtils";
import type { CustomDelayNode } from "@/types/audio";

export function useEffectsNodes(audioContext: AudioContext | null) {
  const delayNodeRef = useRef<CustomDelayNode | DelayNode | null>(null);
  const reverbNodeRef = useRef<ConvolverNode | null>(null);
  const reverbToneFilterRef = useRef<BiquadFilterNode | null>(null);
  const delayMixGainRef = useRef<GainNode | null>(null);
  const reverbMixGainRef = useRef<GainNode | null>(null);
  const dryGainRef = useRef<GainNode | null>(null);
  const effectsGainRef = useRef<GainNode | null>(null);

  const preloadImpulseResponse = useCallback(async (ctx: AudioContext) => {
    try {
      const response = await fetch(
        "/audio/impulse-responses/impulse-response.wav"
      );
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await ctx.decodeAudioData(arrayBuffer);
      return audioBuffer;
    } catch (error) {
      console.error("Failed to load impulse response:", error);
      return null;
    }
  }, []);

  const createDelay = useCallback(async (ctx: AudioContext) => {
    try {
      // Load the custom delay processor
      await ctx.audioWorklet.addModule(
        "/audio/audio-processors/delay-processor.js"
      );

      // Create the custom delay node
      delayNodeRef.current = new AudioWorkletNode(ctx, "delay-processor", {
        numberOfInputs: 1,
        numberOfOutputs: 1,
        outputChannelCount: [1], // Mono output for now
        processorOptions: {
          delayTime: 0.25, // 250ms default
          feedback: 0.3,
          wetLevel: 0.5,
          dryLevel: 0.5,
          enabled: true,
        },
      }) as CustomDelayNode;
    } catch (error) {
      console.error("Failed to create custom delay processor:", error);
      // Fallback to native delay node
      delayNodeRef.current = getPooledNode("delay", ctx, {
        maxDelayTime: 2.0,
      }) as DelayNode;
    }
  }, []);

  const createReverb = useCallback(
    async (ctx: AudioContext) => {
      try {
        // Load impulse response for reverb
        const impulseBuffer = await preloadImpulseResponse(ctx);

        if (impulseBuffer) {
          // Use native ConvolverNode for reverb
          const convolverNode = getPooledNode(
            "convolver",
            ctx
          ) as ConvolverNode;
          reverbNodeRef.current = convolverNode;
          convolverNode.buffer = impulseBuffer;

          // Create tone filter for reverb
          reverbToneFilterRef.current = ctx.createBiquadFilter();
          reverbToneFilterRef.current.type = "highpass";
          reverbToneFilterRef.current.frequency.setValueAtTime(
            200,
            ctx.currentTime
          );
          reverbToneFilterRef.current.Q.setValueAtTime(1.0, ctx.currentTime);
        } else {
          console.warn("Failed to load impulse response, skipping reverb");
        }
      } catch (error) {
        console.error("Failed to create reverb:", error);
      }
    },
    [preloadImpulseResponse]
  );

  const createMixGainNodes = useCallback((ctx: AudioContext) => {
    delayMixGainRef.current = getPooledNode("gain", ctx) as GainNode;
    delayMixGainRef.current.gain.setValueAtTime(0.5, ctx.currentTime);

    reverbMixGainRef.current = getPooledNode("gain", ctx) as GainNode;
    reverbMixGainRef.current.gain.setValueAtTime(1.0, ctx.currentTime);

    dryGainRef.current = getPooledNode("gain", ctx) as GainNode;
    dryGainRef.current.gain.setValueAtTime(1.0, ctx.currentTime);

    effectsGainRef.current = getPooledNode("gain", ctx) as GainNode;
    effectsGainRef.current.gain.setValueAtTime(1.0, ctx.currentTime);
  }, []);

  const createEffectsNodes = useCallback(
    async (ctx: AudioContext) => {
      await createDelay(ctx);
      await createReverb(ctx);
      createMixGainNodes(ctx);
    },
    [createDelay, createReverb, createMixGainNodes]
  );

  const setupEffectsChain = useCallback(() => {
    if (
      delayNodeRef.current &&
      reverbNodeRef.current &&
      delayMixGainRef.current &&
      reverbMixGainRef.current &&
      dryGainRef.current &&
      effectsGainRef.current
    ) {
      delayMixGainRef.current.connect(delayNodeRef.current);
      delayNodeRef.current.connect(effectsGainRef.current);

      reverbMixGainRef.current.connect(reverbNodeRef.current);
      if (reverbToneFilterRef.current) {
        reverbNodeRef.current.connect(reverbToneFilterRef.current);
        reverbToneFilterRef.current.connect(effectsGainRef.current);
      } else {
        reverbNodeRef.current.connect(effectsGainRef.current);
        console.warn(
          "Reverb tone filter not available, connecting reverb directly"
        );
      }
    } else {
      console.warn("Cannot setup effects chain - missing nodes:", {
        delayNode: !!delayNodeRef.current,
        reverbNode: !!reverbNodeRef.current,
        delayMixGain: !!delayMixGainRef.current,
        reverbMixGain: !!reverbMixGainRef.current,
        dryGain: !!dryGainRef.current,
        effectsGain: !!effectsGainRef.current,
      });
    }
  }, []);

  const cleanupEffectsNodes = useCallback(() => {
    if (delayNodeRef.current) {
      delayNodeRef.current.disconnect();
      releaseNode(delayNodeRef.current);
      delayNodeRef.current = null;
    }
    if (delayMixGainRef.current) {
      releaseNode(delayMixGainRef.current);
      delayMixGainRef.current = null;
    }
    if (reverbNodeRef.current) {
      reverbNodeRef.current.disconnect();
      releaseNode(reverbNodeRef.current);
      reverbNodeRef.current = null;
    }
    if (reverbToneFilterRef.current) {
      reverbToneFilterRef.current.disconnect();
      releaseNode(reverbToneFilterRef.current);
      reverbToneFilterRef.current = null;
    }
    if (reverbMixGainRef.current) {
      releaseNode(reverbMixGainRef.current);
      reverbMixGainRef.current = null;
    }
    if (dryGainRef.current) {
      releaseNode(dryGainRef.current);
      dryGainRef.current = null;
    }
    if (effectsGainRef.current) {
      releaseNode(effectsGainRef.current);
      effectsGainRef.current = null;
    }
  }, []);

  useEffect(() => {
    if (!audioContext) {
      cleanupEffectsNodes();
      return;
    }

    const setupEffects = async () => {
      await createEffectsNodes(audioContext);
      setupEffectsChain();
    };

    setupEffects();

    return cleanupEffectsNodes;
  }, [
    audioContext,
    createEffectsNodes,
    setupEffectsChain,
    cleanupEffectsNodes,
  ]);

  return {
    delayNode: delayNodeRef.current,
    delayMixGain: delayMixGainRef.current,
    reverbNode: reverbNodeRef.current,
    reverbToneFilter: reverbToneFilterRef.current,
    reverbMixGain: reverbMixGainRef.current,
    dryGain: dryGainRef.current,
    effectsGain: effectsGainRef.current,
  };
}
