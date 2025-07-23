import { useEffect } from "react";
import { loadStateFromURL } from "@/utils/urlState";
import { useSynthStore } from "@/store/synthStore";

export function useURLSync() {
  const loadPreset = useSynthStore((state) => state.loadPreset);

  // Load settings from URL parameters on mount - run immediately
  useEffect(() => {
    const urlState = loadStateFromURL();

    if (urlState) {
      loadPreset(urlState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount
}

export function setLoadingFromURL() {
  // This function is used for testing purposes
  return Promise.resolve();
}
