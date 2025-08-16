import React, { useState, useEffect } from "react";
import styles from "./AudioBufferOptimizationDemo.module.css";
import {
  getAudioBufferOptimizationStats,
  isAudioBufferOptimizationAvailable,
  preResampleBuffer,
  RESAMPLING_PRESETS,
} from "@/utils";

export function AudioBufferOptimizationDemo() {
  const [stats, setStats] =
    useState<ReturnType<typeof getAudioBufferOptimizationStats>>(null);
  const [isOptimizationAvailable, setIsOptimizationAvailable] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const checkAvailability = () => {
      const available = isAudioBufferOptimizationAvailable();
      setIsOptimizationAvailable(available);
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateStats = () => {
      const currentStats = getAudioBufferOptimizationStats();
      setStats(currentStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const createTestBuffer = (
    sampleRate: number,
    length: number
  ): AudioBuffer => {
    const audioContext = new (window.AudioContext ||
      (window as typeof window & { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext)();
    const buffer = audioContext.createBuffer(1, length, sampleRate);
    const data = buffer.getChannelData(0);

    // Fill with test tone
    for (let i = 0; i < length; i++) {
      data[i] = Math.sin(i * 0.1) * 0.5;
    }

    return buffer;
  };

  const runBufferTest = async () => {
    if (!isOptimizationAvailable) {
      addTestResult("❌ Optimization not available");
      return;
    }

    setIsRunning(true);
    addTestResult("🚀 Starting buffer optimization test...");

    try {
      // Create test buffers with different sample rates
      const buffer22k = createTestBuffer(22050, 1024);
      const buffer48k = createTestBuffer(48000, 1024);

      // Test resampling to 44.1kHz
      const startTime = performance.now();

      const resampled22k = await preResampleBuffer(
        buffer22k,
        44100,
        "balanced"
      );
      const resampled48k = await preResampleBuffer(
        buffer48k,
        44100,
        "balanced"
      );

      const endTime = performance.now();
      const duration = endTime - startTime;

      addTestResult(`✅ Resampled 2 buffers in ${duration.toFixed(2)}ms`);
      addTestResult(`📊 22kHz → 44.1kHz: ${resampled22k.length} samples`);
      addTestResult(`📊 48kHz → 44.1kHz: ${resampled48k.length} samples`);

      // Test cache hit
      const cacheStart = performance.now();
      await preResampleBuffer(buffer22k, 44100, "balanced");
      const cacheEnd = performance.now();
      const cacheDuration = cacheEnd - cacheStart;

      addTestResult(
        `⚡ Cache hit: ${cacheDuration.toFixed(2)}ms (${(
          duration / cacheDuration
        ).toFixed(1)}x faster)`
      );
    } catch (error) {
      addTestResult(`❌ Test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runQualityTest = async () => {
    if (!isOptimizationAvailable) {
      addTestResult("❌ Optimization not available");
      return;
    }

    setIsRunning(true);
    addTestResult("🎵 Testing different quality presets...");

    try {
      const buffer = createTestBuffer(22050, 2048);
      const qualities: Array<keyof typeof RESAMPLING_PRESETS> = [
        "fast",
        "balanced",
        "high",
      ];

      for (const quality of qualities) {
        const startTime = performance.now();
        const resampled = await preResampleBuffer(buffer, 44100, quality);
        const endTime = performance.now();
        const duration = endTime - startTime;

        addTestResult(
          `${quality.toUpperCase()}: ${duration.toFixed(2)}ms, ${
            resampled.length
          } samples`
        );
      }
    } catch (error) {
      addTestResult(`❌ Quality test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const clearResults = () => {
    setTestResults([]);
  };

  const debugInfo = () => {
    if (!stats) {
      addTestResult("❌ No stats available");
      return;
    }

    addTestResult(`🔍 Debug Info:`);
    addTestResult(
      `   Cache: ${stats.totalBuffers} buffers, ${stats.totalSizeMB.toFixed(
        1
      )}MB`
    );
    addTestResult(`   Queue: ${stats.queueLength} pending`);
    addTestResult(`   Processing: ${stats.isProcessing ? "Active" : "Idle"}`);
    addTestResult(
      `   Config: ${stats.config.enablePreResampling ? "Enabled" : "Disabled"}`
    );
  };

  if (!isOptimizationAvailable) {
    return (
      <div className={styles.container}>
        <h3>Audio Buffer Optimization Demo</h3>
        <div className={styles.info}>
          <p>
            Audio buffer optimization is not available. Make sure the audio
            context is initialized.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3>Audio Buffer Optimization Demo</h3>

      <div className={styles.controls}>
        <button
          onClick={runBufferTest}
          disabled={isRunning}
          className={styles.button}
        >
          {isRunning ? "Running..." : "Test Buffer Optimization"}
        </button>

        <button
          onClick={runQualityTest}
          disabled={isRunning}
          className={styles.button}
        >
          {isRunning ? "Running..." : "Test Quality Presets"}
        </button>

        <button onClick={debugInfo} className={styles.button}>
          Debug Info
        </button>

        <button onClick={clearResults} className={styles.button}>
          Clear Results
        </button>
      </div>

      {stats && (
        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Cache Status:</span>
            <span className={styles.statValue}>
              {stats.totalBuffers} buffers, {stats.totalSizeMB.toFixed(1)} MB
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Queue:</span>
            <span className={styles.statValue}>
              {stats.queueLength} pending
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Processing:</span>
            <span className={styles.statValue}>
              {stats.isProcessing ? "🔄 Active" : "✅ Idle"}
            </span>
          </div>
        </div>
      )}

      <div className={styles.info}>
        <h4>What This Tests:</h4>
        <ol>
          <li>
            <strong>Buffer Optimization:</strong> Tests resampling performance
            and caching
          </li>
          <li>
            <strong>Quality Presets:</strong> Compares fast/balanced/high
            quality resampling
          </li>
          <li>
            <strong>Cache Performance:</strong> Shows speed improvement from
            cached buffers
          </li>
          <li>
            <strong>Memory Management:</strong> Monitors cache size and buffer
            count
          </li>
        </ol>

        <h4>Expected Results:</h4>
        <ul>
          <li>First resampling: Takes longer (processing + caching)</li>
          <li>Second resampling: Much faster (cache hit)</li>
          <li>
            Quality presets: Fast &lt; Balanced &lt; High (performance vs
            quality)
          </li>
          <li>Cache efficiency: Should show significant speed improvements</li>
        </ul>
      </div>

      {testResults.length > 0 && (
        <div className={styles.results}>
          <h4>Test Results:</h4>
          <div className={styles.resultList}>
            {testResults.map((result, index) => (
              <div key={index} className={styles.resultItem}>
                {result}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
