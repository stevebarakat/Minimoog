import { useEffect, useRef } from "react";
import { useSynthStore } from "@/store/synthStore";

// Global flag to track if we're currently loading from URL
let isLoadingFromURL = false;

export function setLoadingFromURL(loading: boolean) {
  isLoadingFromURL = loading;
}

export function useURLSync() {
  const synthState = useSynthStore();
  const isInitialLoad = useRef(true);

  useEffect(() => {
    // Skip the first render
    if (isInitialLoad.current) {
      isInitialLoad.current = false;
      // Add a small delay to ensure URL loading has happened
      setTimeout(() => {
        // Only update URL if we're not loading from URL and there are no URL params
        if (!isLoadingFromURL) {
          const urlParams = new URLSearchParams(window.location.search);
          if (urlParams.toString() === "") {
            // No longer automatically updating URL for performance
            // URL will only be updated when "Copy URL" button is pressed
          }
        }
      }, 100);
      return;
    }

    // Removed automatic URL synchronization for performance
    // URL will only be updated when "Copy URL" button is pressed
  }, [synthState]);
}
