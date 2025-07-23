import { useEffect, useState, useCallback } from "react";

type Breakpoint = "mobile" | "tablet" | "desktop";

interface UseMediaQueryOptions {
  debounceMs?: number;
}

export function useMediaQuery(
  breakpoint: Breakpoint,
  options: UseMediaQueryOptions = {}
): boolean {
  const { debounceMs = 100 } = options;

  const getMediaQuery = useCallback((bp: Breakpoint): string => {
    switch (bp) {
      case "mobile":
        return "(max-width: 767px)";
      case "tablet":
        return "(min-width: 768px) and (max-width: 979px)";
      case "desktop":
        return "(min-width: 980px)";
      default:
        return "";
    }
  }, []);

  const [matches, setMatches] = useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(getMediaQuery(breakpoint)).matches;
  });

  useEffect(() => {
    if (typeof window === "undefined") return;

    const mediaQuery = window.matchMedia(getMediaQuery(breakpoint));

    const updateMatches = () => {
      setMatches(mediaQuery.matches);
    };

    let timeoutId: NodeJS.Timeout;
    const debouncedUpdate = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateMatches, debounceMs);
    };

    updateMatches();

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", debouncedUpdate);
    } else {
      mediaQuery.addListener(debouncedUpdate);
    }

    return () => {
      clearTimeout(timeoutId);
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", debouncedUpdate);
      } else {
        mediaQuery.removeListener(debouncedUpdate);
      }
    };
  }, [breakpoint, getMediaQuery, debounceMs]);

  return matches;
}

export function useIsMobile(): boolean {
  return useMediaQuery("mobile");
}

export function useIsTablet(): boolean {
  return useMediaQuery("tablet");
}

export function useIsDesktop(): boolean {
  return useMediaQuery("desktop");
}

export function useViewType(): Breakpoint {
  const isMobile = useIsMobile();
  const isTablet = useIsTablet();
  const isDesktop = useIsDesktop();

  if (isMobile) return "mobile";
  if (isTablet) return "tablet";
  if (isDesktop) return "desktop";

  return "desktop";
}
