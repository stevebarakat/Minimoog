import { useCallback } from "react";
import { useAudioContext } from "@/hooks/useAudioContext";

export function useAudioContextManagement(closeToast?: () => void) {
  const { audioContext, initialize, dispose, suspend, resume } =
    useAudioContext();
  const isInitialized = audioContext?.state === "running";

  // Power button should suspend/resume, not dispose/initialize
  const handlePowerOn = useCallback(async () => {
    if (audioContext && audioContext.state === "suspended") {
      await resume();
      closeToast?.();
    } else if (!audioContext) {
      await initialize();
      closeToast?.();
    }
  }, [audioContext, resume, initialize, closeToast]);

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
