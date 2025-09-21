import { useRef, useState, useEffect, useCallback } from "react";
import { useSynthStore } from "@/store/synthStore";
import {
  logger,
  initializeNodePool,
  prewarmPool,
  prewarmWorkletProcessors,
  disposeNodePool,
} from "@/utils";
import {
  initializeAudioParamOptimizer,
  shouldUseNodeSwapping,
  disposeAudioParamOptimizer,
} from "@/utils/audioParamOptimization";
import {
  initializeAudioBufferOptimizer,
  disposeAudioBufferOptimizer,
} from "@/utils/audioBufferOptimization";
import {
  initializeAudioWorkletOptimizer,
  disposeAudioWorkletOptimizer,
} from "@/utils/audioWorkletOptimization";
import { initializeAudioWorkletPerformanceHandler } from "@/utils/audioWorkletPerformance";
import { useToast } from "@/components/Toast/hooks/useToast";

export function useAudioContext() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [audioContext, setAudioContextState] = useState<AudioContext | null>(
    null
  );
  const [error, setError] = useState<string | null>(null);
  const setAudioContext = useSynthStore((state) => state.setAudioContext);
  const showToast = useToast();

  const initialize = async () => {
    try {
      // Only create if we don't have a context or it's closed
      if (
        !audioContextRef.current ||
        audioContextRef.current.state === "closed"
      ) {
        audioContextRef.current = new AudioContext();

        // Initialize the node pool for performance optimization
        initializeNodePool({
          maxPoolSize: 32, // Reduced from 64 to prevent memory bloat
          enablePooling: true,
          cleanupInterval: 15000, // More frequent cleanup
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
          maxCacheSize: 25, // Reduced from 100MB to 25MB to prevent memory bloat
          resamplingQuality: "balanced",
          logLevel: "info",
        });

        // Initialize AudioWorklet optimization for better performance
        initializeAudioWorkletOptimizer({
          enableParameterBatching: true,
          enableMemoryPooling: true,
          enablePerformanceMonitoring: true,
          maxBatchSize: 32, // Reduced from 64
          memoryPoolSize: 10, // Reduced from 50MB to 10MB
          monitoringInterval: 2000, // Reduced frequency from 1 second
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

      setAudioContextState(audioContextRef.current);
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

  const dispose = useCallback(async () => {
    if (audioContextRef.current) {
      try {
        if (audioContextRef.current.state === "running") {
          await audioContextRef.current.suspend();
        }
        // Close the audio context to free all resources
        await audioContextRef.current.close();
        logger.info("Audio context closed successfully");
      } catch (error) {
        logger.warn("Error closing audio context:", error);
      }

      // Dispose all optimizers to prevent memory leaks
      try {
        logger.info("Disposing all audio optimizers...");
        disposeNodePool();
        disposeAudioParamOptimizer();
        disposeAudioBufferOptimizer();
        disposeAudioWorkletOptimizer();
        logger.info("All audio optimizers disposed successfully");
      } catch (error) {
        logger.warn("Error disposing optimizers:", error);
      }

      // Clear the reference and state
      audioContextRef.current = null;
      setAudioContextState(null);

      setAudioContext({
        isReady: false,
        error: null,
        context: null,
      });
    }
  }, [setAudioContext]);

  const resume = async () => {
    if (
      audioContextRef.current &&
      audioContextRef.current.state === "suspended"
    ) {
      try {
        await audioContextRef.current.resume();
        setAudioContextState(audioContextRef.current);
        setAudioContext({
          isReady: true,
          error: null,
          context: audioContextRef.current,
        });
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
        setAudioContextState(audioContextRef.current);
        setAudioContext({
          isReady: false,
          error: null,
          context: audioContextRef.current,
        });
      } catch (error) {
        logger.warn("Error suspending audio context:", error);
      }
    }
  };

  // Cleanup on component unmount
  useEffect(() => {
    return () => {
      // Dispose audio context and all optimizers when component unmounts
      if (audioContextRef.current) {
        logger.warn("Cleaning up audio context on unmount...");
        dispose();
      }
    };
  }, [dispose]);

  return {
    audioContext,
    error,
    initialize,
    dispose,
    resume,
    suspend,
  };
}
