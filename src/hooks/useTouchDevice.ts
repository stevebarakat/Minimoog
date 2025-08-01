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
    checkTouchDevice();

    let timeoutId: NodeJS.Timeout;
    const debouncedCheck = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(checkTouchDevice, debounceMs);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", debouncedCheck);
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
