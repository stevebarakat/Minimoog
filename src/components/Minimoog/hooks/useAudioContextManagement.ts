import { useAudioContext } from "@/hooks/useAudioContext";

export function useAudioContextManagement() {
  const { audioContext, isInitialized, initialize, dispose } =
    useAudioContext();

  return {
    audioContext,
    isInitialized,
    initialize,
    dispose,
  };
}
