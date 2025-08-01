import { useEffect } from "react";
import { loadStateFromURL } from "@/utils";
import { useSynthStore } from "@/store/synthStore";

export function useURLSync() {
  const loadPreset = useSynthStore((state) => state.loadPreset);

  // Load settings from URL parameters on mount - run immediately
  useEffect(() => {
    const urlState = loadStateFromURL();

    if (urlState) {
      loadPreset(urlState);
    }
    // If URL is blank, the default vintage Minimoog settings from initialState will be used
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Empty dependency array to run only once on mount
}

export function setLoadingFromURL() {
  // This function is used for testing purposes
  return Promise.resolve();
}
