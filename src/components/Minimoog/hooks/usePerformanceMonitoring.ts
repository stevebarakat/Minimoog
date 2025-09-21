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
      // Less frequent monitoring to prevent cleanup loops
      const stopMonitoring = startMemoryMonitoring(120000); // Every 2 minutes

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
        // Lower threshold for production monitoring
        if (memoryStats && memoryStats.usedJSHeapSize > 50 * 1024 * 1024) {
          logger.warn("High memory usage detected in production");
        }
      }, 30000); // More frequent monitoring in production too

      return () => clearInterval(interval);
    }
  }, []);
}
