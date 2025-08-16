import { useRef, useState } from "react";
import { useSynthStore } from "@/store/synthStore";
import {
  log as logger,
  initializeNodePool,
  prewarmPool,
  prewarmWorkletProcessors,
} from "@/utils";
import {
  initializeAudioParamOptimizer,
  shouldUseNodeSwapping,
} from "@/utils/audioParamOptimization";
import { initializeAudioBufferOptimizer } from "@/utils/audioBufferOptimization";
import { initializeAudioWorkletOptimizer } from "@/utils/audioWorkletOptimization";
import { initializeAudioWorkletPerformanceHandler } from "@/utils/audioWorkletPerformanceHandler";
import { useToast } from "@/components/Toast/hooks/useToast";

export function useAudioContext() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [error, setError] = useState<string | null>(null);
  const setAudioContext = useSynthStore((state) => state.setAudioContext);
  const showToast = useToast();

  const initialize = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();

        // Initialize the node pool for performance optimization
        initializeNodePool({
          maxPoolSize: 64, // Increase pool size for better performance
          enablePooling: true,
          cleanupInterval: 30000,
        });

        // Initialize AudioParam optimization for better performance
        const shouldOptimize = shouldUseNodeSwapping();
        initializeAudioParamOptimizer({
          enableNodeSwapping: shouldOptimize,
          maxEventsPerNode: shouldOptimize ? 50 : 100, // Less aggressive for Gecko browsers
          logLevel: shouldOptimize ? "warn" : "none",
        });

        // Initialize AudioBuffer optimization for better performance
        initializeAudioBufferOptimizer({
          enablePreResampling: true,
          enableBufferCaching: true,
          maxCacheSize: 100, // 100MB cache limit
          resamplingQuality: "balanced",
          logLevel: "info",
        });

        // Initialize AudioWorklet optimization for better performance
        initializeAudioWorkletOptimizer({
          enableParameterBatching: true,
          enableMemoryPooling: true,
          enablePerformanceMonitoring: true,
          maxBatchSize: 64,
          memoryPoolSize: 50, // 50MB pool
          monitoringInterval: 1000, // 1 second
          logLevel: "info",
        });

        // Initialize AudioWorklet performance handler
        initializeAudioWorkletPerformanceHandler();

        // Prewarm the pool with commonly used nodes
        prewarmPool(audioContextRef.current);

        // Prewarm worklet processors asynchronously (don't block initialization)
        prewarmWorkletProcessors(audioContextRef.current).catch(() => {
          // Worklet prewarming is optional, ignore errors
        });
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      await audioContextRef.current.audioWorklet.addModule(
        "/audio/audio-processors/modulation-monitor-processor.js"
      );

      setAudioContext({
        isReady: true,
        error: null,
        context: audioContextRef.current,
      });
      setError(null);
    } catch (error) {
      logger.error("Error initializing AudioContext:", error);
      const msg =
        "Failed to initialize audio engine. Please check your browser settings and try again.";
      setError(msg);
      showToast({ title: "Audio Error", description: msg, variant: "error" });
      setAudioContext({
        isReady: false,
        error: msg,
        context: null,
      });
    }
  };

  const dispose = async () => {
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state === "running") {
          await audioContextRef.current.suspend();
        }
      } catch (error) {
        logger.warn("Error suspending audio context:", error);
      }
      setAudioContext({
        isReady: false,
        error: null,
        context: null,
      });
    }
  };

  const resume = async () => {
    if (
      audioContextRef.current &&
      audioContextRef.current.state === "suspended"
    ) {
      try {
        await audioContextRef.current.resume();
      } catch (error) {
        logger.warn("Error resuming audio context:", error);
      }
    }
  };

  const suspend = async () => {
    if (
      audioContextRef.current &&
      audioContextRef.current.state === "running"
    ) {
      try {
        await audioContextRef.current.suspend();
      } catch (error) {
        logger.warn("Error suspending audio context:", error);
      }
    }
  };

  return {
    audioContext: audioContextRef.current,
    error,
    initialize,
    dispose,
    resume,
    suspend,
  };
}
