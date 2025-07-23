import { useEffect, useRef, useState } from "react";
import { useSynthStore } from "@/store/synthStore";
import logger from "@/utils/logger";
import { reportError } from "@/utils/errorReporter";
import { useToast } from "@/components/ToastProvider";

export function useAudioContext() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const setIsDisabled = useSynthStore((state) => state.setIsDisabled);
  const showToast = useToast();

  const initialize = async () => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new AudioContext();
      }

      if (audioContextRef.current.state === "suspended") {
        await audioContextRef.current.resume();
      }

      await audioContextRef.current.audioWorklet.addModule(
        "/modulation-monitor-processor.js"
      );

      setIsInitialized(true);
      setIsDisabled(false);
      setError(null);
    } catch (error) {
      logger.error("Error initializing AudioContext:", error);
      reportError(error instanceof Error ? error : new Error(String(error)), {
        context: "AudioContext initialization",
      });
      const msg =
        "Failed to initialize audio engine. Please check your browser settings and try again.";
      setError(msg);
      showToast({ title: "Audio Error", description: msg, variant: "error" });
      setIsInitialized(false);
      setIsDisabled(true);
    }
  };

  const dispose = async () => {
    if (audioContextRef.current) {
      // Use suspend instead of close to allow resuming later
      if (audioContextRef.current.state === "running") {
        await audioContextRef.current.suspend();
      }
      setIsInitialized(false);
      setIsDisabled(true);
    }
  };

  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        // Only close the context when the component unmounts
        audioContextRef.current.close();
        audioContextRef.current = null;
        setIsInitialized(false);
        setIsDisabled(true);
      }
    };
  }, [setIsDisabled]);

  return {
    audioContext: audioContextRef.current,
    isInitialized,
    initialize,
    dispose,
    error,
  };
}
