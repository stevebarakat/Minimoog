import { useEffect } from "react";
import { loadStateFromURL } from "@/utils/urlState";
import { useURLSync, setLoadingFromURL } from "@/hooks/useURLSync";
import { useSynthStore } from "@/store/synthStore";

export function useMinimoogURLSync() {
  const loadPreset = useSynthStore((state) => state.loadPreset);

  // Load settings from URL parameters on mount - run immediately
  useEffect(() => {
    const urlState = loadStateFromURL();

    if (urlState) {
      setLoadingFromURL(true);
      loadPreset(urlState);
      // Reset the flag after a short delay to allow URL sync to resume
      setTimeout(() => setLoadingFromURL(false), 200);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount

  // Sync state changes with URL
  useURLSync();
}
