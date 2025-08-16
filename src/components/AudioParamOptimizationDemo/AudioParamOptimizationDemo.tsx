import { useState, useEffect, useCallback } from "react";
import {
  getAudioParamOptimizer,
  isAudioParamOptimizationAvailable,
  isAudioParamOptimizationReady,
  getAudioParamOptimizationStats,
  createOptimizedAudioParam,
} from "@/utils";
import styles from "./AudioParamOptimizationDemo.module.css";

export function AudioParamOptimizationDemo() {
  const [isOptimizationAvailable, setIsOptimizationAvailable] = useState(false);
  const [isOptimizationReady, setIsOptimizationReady] = useState(false);
  const [stats, setStats] =
    useState<ReturnType<typeof getAudioParamOptimizationStats>>(null);
  const [isRunning, setIsRunning] = useState(false);

  const updateStats = useCallback(() => {
    const currentStats = getAudioParamOptimizationStats();
    setStats(currentStats);
  }, []);

  useEffect(() => {
    const checkOptimization = () => {
      const available = isAudioParamOptimizationAvailable();
      const ready = isAudioParamOptimizationReady();

      setIsOptimizationAvailable(available);
      setIsOptimizationReady(ready);

      if (available && ready) {
        updateStats();
      }
    };

    // Check immediately
    checkOptimization();

    // Check again after a short delay to catch late initialization
    const initialCheck = setTimeout(checkOptimization, 500);

    // Then check periodically
    const interval = setInterval(checkOptimization, 1000);

    return () => {
      clearTimeout(initialCheck);
      clearInterval(interval);
    };
  }, [updateStats]);

  const runManualTest = useCallback(() => {
    if (!isOptimizationAvailable) return;

    const optimizer = getAudioParamOptimizer();
    if (!optimizer) return;

    // Create a test AudioParam and add many events
    const audioContext = new (window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext)();
    const gainNode = audioContext.createGain();

    // IMPORTANT: Use the optimization system to track these events
    // This ensures the events are actually counted by the optimizer
    const optimizedGain = createOptimizedAudioParam(
      gainNode.gain,
      "test-manual"
    );

    // Add many events to trigger optimization
    for (let i = 0; i < 60; i++) {
      optimizedGain.setValueAtTime(
        Math.random(),
        audioContext.currentTime + i * 0.1
      );
    }

    // Wait a moment for the optimizer to process the events
    setTimeout(() => {
      updateStats();
    }, 100);

    // Cleanup
    audioContext.close();
  }, [isOptimizationAvailable, updateStats]);

  const runAutomatedTest = useCallback(() => {
    if (!isOptimizationAvailable) return;

    setIsRunning(true);

    const interval = setInterval(() => {
      runManualTest();
      // Stats will be updated by the manual test with a delay
    }, 200); // Slightly slower to allow for processing

    // Stop after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      setIsRunning(false);
      // Final stats update
      updateStats();
    }, 5000);
  }, [isOptimizationAvailable, runManualTest, updateStats]);

  const resetOptimizer = useCallback(() => {
    const optimizer = getAudioParamOptimizer();
    if (optimizer) {
      // Force cleanup of all trackers
      optimizer.dispose();
      updateStats();
    }
  }, [updateStats]);

  if (!isOptimizationAvailable) {
    return (
      <div className={styles.container}>
        <h3>AudioParam Optimization Demo</h3>
        <p className={styles.warning}>
          AudioParam optimization system is not initialized. This happens when
          the audio context is created.
        </p>
        <div className={styles.info}>
          <h4>How to enable:</h4>
          <ol>
            <li>Power on the synthesizer (click the power button)</li>
            <li>Wait for audio context initialization</li>
            <li>Refresh this page or wait for auto-detection</li>
          </ol>
        </div>
      </div>
    );
  }

  if (!isOptimizationReady) {
    return (
      <div className={styles.container}>
        <h3>AudioParam Optimization Demo</h3>
        <p className={styles.warning}>
          AudioParam optimization is initialized but waiting for audio context
          to be ready.
        </p>
        <div className={styles.info}>
          <h4>Status:</h4>
          <ul>
            <li>✅ Optimization system: Ready</li>
            <li>⏳ Audio context: Initializing...</li>
            <li>💡 Try playing a note to activate the audio system</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3>AudioParam Optimization Demo</h3>

      <div className={styles.controls}>
        <button
          onClick={runManualTest}
          disabled={isRunning}
          className={styles.button}
        >
          Run Manual Test
        </button>

        <button
          onClick={runAutomatedTest}
          disabled={isRunning}
          className={styles.button}
        >
          {isRunning ? "Running..." : "Run Automated Test"}
        </button>

        <button onClick={resetOptimizer} className={styles.button}>
          Reset Optimizer
        </button>
      </div>

      {stats ? (
        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Total AudioParams:</span>
            <span className={styles.statValue}>{stats.totalParams}</span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Total Events:</span>
            <span className={styles.statValue}>{stats.totalEvents}</span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Needs Swap:</span>
            <span
              className={`${styles.statValue} ${
                stats.paramsNeedingSwap > 0 ? styles.warning : styles.success
              }`}
            >
              {stats.paramsNeedingSwap}
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Avg Events/Param:</span>
            <span className={styles.statValue}>
              {stats.averageEventsPerParam.toFixed(1)}
            </span>
          </div>

          {isRunning && (
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Test Status:</span>
              <span className={styles.statValue} style={{ color: "#ffaa00" }}>
                🚀 Running automated test...
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Status:</span>
            <span className={styles.statValue}>
              Waiting for audio activity...
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Tip:</span>
            <span className={styles.statValue}>
              Play some notes to see optimization in action
            </span>
          </div>
        </div>
      )}

      <div className={styles.info}>
        <h4>How it works:</h4>
        <ul>
          <li>AudioParam events are automatically tracked</li>
          <li>When a param accumulates 50+ events, it's marked for swapping</li>
          <li>New nodes are created with empty event lists</li>
          <li>This prevents performance issues in non-Gecko browsers</li>
        </ul>
      </div>
    </div>
  );
}
