import { useCallback } from "react";
import { useAudioContext } from "@/hooks/useAudioContext";

export function useAudioContextManagement() {
  const { audioContext, initialize, dispose, suspend, resume } =
    useAudioContext();
  const isInitialized = audioContext?.state === "running";

  console.log(
    "useAudioContextManagement - audioContext:",
    audioContext,
    "state:",
    audioContext?.state,
    "isInitialized:",
    isInitialized
  );

  // Power button should suspend/resume, not dispose/initialize
  const handlePowerOn = useCallback(async () => {
    console.log(
      "handlePowerOn called, audioContext:",
      audioContext,
      "state:",
      audioContext?.state
    );

    if (audioContext && audioContext.state === "suspended") {
      console.log("Resuming suspended audio context");
      await resume();
    } else if (!audioContext) {
      console.log("Initializing new audio context");
      await initialize();
    } else {
      console.log("Audio context already running, state:", audioContext.state);
    }
  }, [audioContext, resume, initialize]);

  const handlePowerOff = useCallback(async () => {
    if (audioContext && audioContext.state === "running") {
      await suspend();
    }
  }, [audioContext, suspend]);

  return {
    audioContext,
    isInitialized,
    initialize,
    dispose,
    onInitialize: handlePowerOn,
    onDispose: handlePowerOff,
  };
}
