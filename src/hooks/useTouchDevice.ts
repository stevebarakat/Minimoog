import { useEffect, useState, useCallback } from "react";

interface UseTouchDeviceOptions {
  debounceMs?: number;
}

export function useTouchDevice(options: UseTouchDeviceOptions = {}): boolean {
  const { debounceMs = 100 } = options;
  const [isTouchDevice, setIsTouchDevice] = useState(false);

  const checkTouchDevice = useCallback(() => {
    const isTouch =
      "ontouchstart" in window ||
      navigator.maxTouchPoints > 0 ||
      ("msMaxTouchPoints" in navigator &&
        (navigator as Navigator & { msMaxTouchPoints: number })
          .msMaxTouchPoints > 0);

    setIsTouchDevice(isTouch);
  }, []);

  useEffect(() => {
    // Initial check
    checkTouchDevice();

    // Debounced resize handler
    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkTouchDevice, debounceMs);
    };

    // Only add resize listener if we're in a browser environment
    if (typeof window !== "undefined") {
      window.addEventListener("resize", debouncedCheck);

      // Also check on orientation change for mobile devices
      window.addEventListener("orientationchange", debouncedCheck);
    }

    return () => {
      clearTimeout(timeoutId);
      if (typeof window !== "undefined") {
        window.removeEventListener("resize", debouncedCheck);
        window.removeEventListener("orientationchange", debouncedCheck);
      }
    };
  }, [checkTouchDevice, debounceMs]);

  return isTouchDevice;
}
