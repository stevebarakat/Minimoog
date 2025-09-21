import { useEffect } from "react";
import { isDevMode } from "@/config";
import {
  startMemoryMonitoring,
  setupGlobalStatsLogging,
  logger,
} from "@/utils";

export function usePerformanceMonitoring(audioContext: AudioContext | null) {
  useEffect(() => {
    if (isDevMode()) {
      const stopMonitoring = startMemoryMonitoring(120000, 2000);

      if (audioContext) {
        setupGlobalStatsLogging(audioContext);
      }

      return () => {
        stopMonitoring();
      };
    } else {
      const stopMonitoring = startMemoryMonitoring(60000, 500);

      return () => {
        stopMonitoring();
      };
    }
  }, [audioContext]);
}
