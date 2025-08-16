import { useEffect } from "react";
import { useSynthStore } from "@/store/synthStore";
import { loadStateFromURL } from "@/utils/urlUtils";

/**
 * Hook to synchronize URL parameters with synth state on app startup.
 * This enables sharing synth settings via URL.
 */
export function useURLSync() {
  const { loadPreset } = useSynthStore();

  useEffect(() => {
    // Load state from URL parameters on mount
    const urlState = loadStateFromURL();

    if (urlState) {
      // Apply the URL state to the store
      loadPreset(urlState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Only run once on mount
}
