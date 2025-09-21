import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { loadStateFromURL } from "@/utils/urlUtils";
import { useCountdownToast } from "./useCountdownToast";

/**
 * Hook to synchronize URL parameters with synth state on app startup.
 * This enables sharing synth settings via URL.
 * After loading from URL, clears the URL to prevent interference with localStorage.
 */
export function useURLSync() {
  const { loadPreset } = useSynthStore();
  const countdownToast = useCountdownToast(
    10,
    "Settings loaded from URL",
    "URL will clear in {seconds} seconds. Bookmark it now if you want to save it!",
    "success"
  );

  useEffect(() => {
    // Load state from URL parameters on mount
    const urlState = loadStateFromURL();

    if (urlState && Object.keys(urlState).length > 0) {
      // Apply the URL state to the store
      loadPreset(urlState);

      // Start countdown toast
      countdownToast.startCountdown();

      // Clear URL parameters after 10 seconds to prevent interference with localStorage
      // This gives users time to see/copy the URL while ensuring future reloads load from localStorage
      setTimeout(() => {
        countdownToast.stopCountdown();
        window.history.replaceState({}, "", window.location.pathname);
      }, 10000);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount

  return countdownToast;
}
