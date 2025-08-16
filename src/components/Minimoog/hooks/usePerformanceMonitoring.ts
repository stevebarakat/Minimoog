import { useEffect } from "react";
import { isDevMode } from "@/config";
import {
  startMemoryMonitoring,
  setupGlobalStatsLogging,
  log as logger,
} from "@/utils";

export function usePerformanceMonitoring(audioContext: AudioContext | null) {
  useEffect(() => {
    if (isDevMode()) {
      const stopMonitoring = startMemoryMonitoring(30000);

      if (audioContext) {
        setupGlobalStatsLogging(audioContext);
      }

      return () => {
        stopMonitoring();
      };
    }
  }, [audioContext]);

  useEffect(() => {
    if (!isDevMode()) {
      const interval = setInterval(() => {
        const memoryStats = (
          performance as Performance & { memory?: { usedJSHeapSize: number } }
        ).memory;
        if (memoryStats && memoryStats.usedJSHeapSize > 100 * 1024 * 1024) {
          logger.warn("High memory usage detected in production");
        }
      }, 60000);

      return () => clearInterval(interval);
    }
  }, []);
}
