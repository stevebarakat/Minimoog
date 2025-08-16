import { useAudioContext } from "@/hooks/useAudioContext";
import { useIsSynthReady } from "@/store/selectors";

export function useAudioContextManagement() {
  const { audioContext, initialize, dispose } = useAudioContext();
  const isInitialized = useIsSynthReady();

  return {
    audioContext,
    isInitialized,
    initialize,
    dispose,
  };
}
