import { useEffect, useRef, useState } from "react";
import { useSynthStore } from "@/store/synthStore";

export function useAudioContext() {
  const audioContextRef = useRef<AudioContext | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const setIsDisabled = useSynthStore((state) => state.setIsDisabled);

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
    } catch (error) {
      console.error("Error initializing AudioContext:", error);
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
  };
}
