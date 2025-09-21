import React, { useState, useEffect } from "react";
import styles from "./AudioWorkletOptimizationDemo.module.css";
import {
  getAudioWorkletOptimizationStats,
  isAudioWorkletOptimizationAvailable,
  batchParameterUpdate,
  getWorkletBuffer,
  returnWorkletBuffer,
  recordWorkletPerformance,
} from "@/utils";

export function AudioWorkletOptimizationDemo() {
  const [stats, setStats] =
    useState<ReturnType<typeof getAudioWorkletOptimizationStats>>(null);
  const [isOptimizationAvailable, setIsOptimizationAvailable] = useState(false);
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    const checkAvailability = () => {
      const available = isAudioWorkletOptimizationAvailable();
      setIsOptimizationAvailable(available);
    };

    checkAvailability();
    const interval = setInterval(checkAvailability, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const updateStats = () => {
      const currentStats = getAudioWorkletOptimizationStats();
      setStats(currentStats);
    };

    updateStats();
    const interval = setInterval(updateStats, 1000);
    return () => clearInterval(interval);
  }, []);

  const addTestResult = (result: string) => {
    setTestResults((prev) => [result, ...prev.slice(0, 9)]); // Keep last 10 results
  };

  const runParameterBatchingTest = async () => {
    if (!isOptimizationAvailable) {
      addTestResult("❌ Optimization not available");
      return;
    }

    setIsRunning(true);
    addTestResult("🚀 Starting parameter batching test...");

    try {
      const workletId = "test-worklet-" + Date.now();
      const startTime = performance.now();

      // Send many parameter updates
      for (let i = 0; i < 100; i++) {
        batchParameterUpdate(
          workletId,
          "cutoff",
          Math.sin(i * 0.1) * 0.5 + 0.5,
          i * 0.01,
          i % 10 === 0 ? "high" : "normal"
        );

        // Add progress indicator every 25 updates
        if (i % 25 === 0) {
          addTestResult(`📊 Sent ${i + 1}/100 updates...`);
        }
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      addTestResult(
        `✅ Sent 100 parameter updates in ${duration.toFixed(2)}ms`
      );
      addTestResult(`📊 Worklet ID: ${workletId}`);

      addTestResult("⏳ Waiting for stats update...");

      // Wait a bit for processing
      setTimeout(() => {
        const currentStats = getAudioWorkletOptimizationStats();
        if (currentStats) {
          addTestResult(`📈 Batches: ${currentStats.batches.totalBatches}`);
          addTestResult(`📈 Queued: ${currentStats.batches.totalQueuedTasks}`);

          // VERIFICATION: Check if batching actually worked
          if (
            currentStats.batches.totalBatches > 0 ||
            currentStats.batches.totalQueuedTasks > 0
          ) {
            addTestResult(
              "✅ VERIFIED: Parameter batching is actually working!"
            );
          } else {
            addTestResult(
              "❌ VERIFICATION FAILED: No batches or queued tasks detected!"
            );
            addTestResult(
              "⚠️ This means the optimization system is NOT processing updates!"
            );
          }

          addTestResult("✅ Test completed successfully!");
        } else {
          addTestResult("⚠️ No stats available - checking system status...");
          const available = isAudioWorkletOptimizationAvailable();
          addTestResult(`📊 Optimization available: ${available}`);
        }
      }, 100);
    } catch (error) {
      addTestResult(`❌ Test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runMemoryPoolingTest = async () => {
    if (!isOptimizationAvailable) {
      addTestResult("❌ Optimization not available");
      return;
    }

    setIsRunning(true);
    addTestResult("🧠 Starting memory pooling test...");

    try {
      const workletId = "memory-test-" + Date.now();
      const bufferSize = 1024;
      const iterations = 50;

      const startTime = performance.now();

      // Allocate and return many buffers
      for (let i = 0; i < iterations; i++) {
        const buffer = getWorkletBuffer(workletId, bufferSize, "float32");

        // Fill with some data
        for (let j = 0; j < bufferSize; j++) {
          buffer[j] = Math.sin(j * 0.1 + i) * 0.5;
        }

        // Return to pool
        returnWorkletBuffer(workletId, buffer, bufferSize, "float32");
      }

      const endTime = performance.now();
      const duration = endTime - startTime;

      addTestResult(
        `✅ Processed ${iterations} buffers in ${duration.toFixed(2)}ms`
      );
      addTestResult(`📊 Buffer size: ${bufferSize} samples`);

      // Check memory pool stats
      setTimeout(() => {
        const currentStats = getAudioWorkletOptimizationStats();
        if (currentStats) {
          addTestResult(`📈 Memory pools: ${currentStats.memory.totalPools}`);
          addTestResult(
            `📈 Pooled buffers: ${currentStats.memory.totalBuffers}`
          );

          // VERIFICATION: Check if memory pooling actually worked
          if (currentStats.memory.totalPools > 0) {
            addTestResult("✅ VERIFIED: Memory pooling is actually working!");
          } else {
            addTestResult("❌ VERIFICATION FAILED: No memory pools detected!");
            addTestResult(
              "⚠️ This means the memory optimization is NOT working!"
            );
          }
        }
      }, 100);
    } catch (error) {
      addTestResult(`❌ Test failed: ${error}`);
    } finally {
      setIsRunning(false);
    }
  };

  const runPerformanceMonitoringTest = async () => {
    if (!isOptimizationAvailable) {
      addTestResult("❌ Optimization not available");
      return;
    }

    setIsRunning(true);
    addTestResult("📊 Starting performance monitoring test...");

    try {
      const workletId = "perf-test-" + Date.now();

      // Record performance metrics
      for (let i = 0; i < 10; i++) {
        const processingTime = 100 + Math.random() * 200; // 100-300 microseconds
        const cpuUsage = 10 + Math.random() * 40; // 10-50%
        const memoryUsage = 512 * 1024 + Math.random() * 1024 * 1024; // 0.5-1.5MB
        const parameterUpdates = Math.floor(Math.random() * 20) + 1; // 1-20 updates
        const underruns = Math.random() > 0.8 ? 1 : 0; // 20% chance of underrun

        recordWorkletPerformance(
          workletId,
          processingTime,
          cpuUsage,
          memoryUsage,
          parameterUpdates,
          underruns
        );

        // Small delay to simulate real-time updates
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      addTestResult(`✅ Recorded performance metrics for ${workletId}`);

      // Check performance stats
      setTimeout(() => {
        const currentStats = getAudioWorkletOptimizationStats();
        if (currentStats) {
          addTestResult(
            `📈 Active worklets: ${currentStats.performance.totalWorklets}`
          );
          addTestResult(
            `📈 Avg CPU: ${currentStats.performance.averageCpuUsage.toFixed(
              1
            )}%`
          );
          addTestResult(
            `📈 Total memory: ${(
              currentStats.performance.totalMemoryUsage /
              (1024 * 1024)
            ).toFixed(1)}MB`
          );

          // VERIFICATION: Check if performance monitoring actually worked
          if (currentStats.performance.totalWorklets > 0) {
            addTestResult(
              "✅ VERIFIED: Performance monitoring is actually working!"
            );
          } else {
            addTestResult("❌ VERIFICATION FAILED: No worklets detected!");
            addTestResult(
              "⚠️ This means the performance monitoring is NOT working!"
            );
          }
        }
      }, 100);
    } catch (error) {
      addTestResult(`❌ Test failed: ${error}`);
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

    addTestResult("🔍 Debug Info:");
    addTestResult(
      `   Performance: ${stats.performance.totalWorklets} worklets`
    );
    addTestResult(
      `   Memory: ${stats.memory.totalPools} pools, ${stats.memory.totalSizeMB}MB`
    );
    addTestResult(
      `   Batches: ${stats.batches.totalBatches} pending, ${stats.batches.totalQueuedTasks} queued`
    );
  };

  if (!isOptimizationAvailable) {
    return (
      <div className={styles.container}>
        <h3>AudioWorklet Optimization Demo</h3>
        <div className={styles.info}>
          <p>
            AudioWorklet optimization is not available. Make sure the audio
            context is initialized.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <h3>AudioWorklet Optimization Demo</h3>

      <div className={styles.controls}>
        <button
          onClick={runParameterBatchingTest}
          disabled={isRunning}
          className={styles.button}
        >
          {isRunning ? "Running..." : "Test Parameter Batching"}
        </button>

        <button
          onClick={runMemoryPoolingTest}
          disabled={isRunning}
          className={styles.button}
        >
          {isRunning ? "Running..." : "Test Memory Pooling"}
        </button>

        <button
          onClick={runPerformanceMonitoringTest}
          disabled={isRunning}
          className={styles.button}
        >
          {isRunning ? "Running..." : "Test Performance Monitoring"}
        </button>

        <button onClick={debugInfo} className={styles.button}>
          Debug Info
        </button>

        <button
          onClick={() => {
            addTestResult("🔍 Checking system status...");
            const available = isAudioWorkletOptimizationAvailable();
            const stats = getAudioWorkletOptimizationStats();
            addTestResult(`📊 Optimization available: ${available}`);
            addTestResult(`📊 Stats available: ${stats ? "Yes" : "No"}`);
            if (stats) {
              addTestResult(`📊 Batches: ${stats.batches.totalBatches}`);
              addTestResult(`📊 Queued: ${stats.batches.totalQueuedTasks}`);
            }

            // Test a simple parameter update
            addTestResult("🧪 Testing simple parameter update...");
            try {
              batchParameterUpdate(
                "test-worklet",
                "test-param",
                0.5,
                0,
                "normal"
              );
              addTestResult("✅ Parameter update test passed");
            } catch (error) {
              addTestResult(`❌ Parameter update test failed: ${error}`);
            }
          }}
          className={styles.button}
        >
          Check Status
        </button>

        <button onClick={clearResults} className={styles.button}>
          Clear Results
        </button>
      </div>

      {stats && (
        <div className={styles.stats}>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Active Worklets:</span>
            <span className={styles.statValue}>
              {stats.performance.totalWorklets}
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Avg CPU Usage:</span>
            <span className={styles.statValue}>
              {stats.performance.averageCpuUsage.toFixed(1)}%
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Memory Pools:</span>
            <span className={styles.statValue}>
              {stats.memory.totalPools} pools, {stats.memory.totalSizeMB} MB
            </span>
          </div>

          <div className={styles.statRow}>
            <span className={styles.statLabel}>Parameter Batches:</span>
            <span className={styles.statValue}>
              {stats.batches.totalBatches} pending,{" "}
              {stats.batches.totalQueuedTasks} queued
            </span>
          </div>
        </div>
      )}

      <div className={styles.info}>
        <h4>What This Tests:</h4>
        <ol>
          <li>
            <strong>Parameter Batching:</strong> Tests efficient parameter
            update batching
          </li>
          <li>
            <strong>Memory Pooling:</strong> Tests buffer reuse and memory
            efficiency
          </li>
          <li>
            <strong>Performance Monitoring:</strong> Tests real-time performance
            tracking
          </li>
          <li>
            <strong>System Integration:</strong> Tests overall optimization
            system health
          </li>
        </ol>

        <h4>Expected Results:</h4>
        <ul>
          <li>
            Parameter batching: Should show batches being created and processed
          </li>
          <li>
            Memory pooling: Should show memory pools being created and buffers
            being reused
          </li>
          <li>
            Performance monitoring: Should show worklet performance metrics
            being recorded
          </li>
          <li>
            System stats: Should show real-time updates of all optimization
            metrics
          </li>
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
