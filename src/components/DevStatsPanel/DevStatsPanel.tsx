import { useState, useEffect } from "react";
import { Rnd } from "react-rnd";
import {
  getMemoryStats,
  getAudioContextStats,
  getPoolStats,
  getAudioParamOptimizationStats,
  getAudioBufferOptimizationStats,
  getAudioWorkletOptimizationStats,
  type MemoryStats,
  type AudioNodeStats,
} from "@/utils";
import { cn } from "@/utils";
import styles from "./DevStatsPanel.module.css";
import { AudioParamOptimizationDemo } from "../AudioParamOptimizationDemo";
import { AudioBufferOptimizationDemo } from "../AudioBufferOptimizationDemo";
import { AudioWorkletOptimizationDemo } from "../AudioWorkletOptimizationDemo";

type DevStatsPanelProps = {
  audioContext: AudioContext | null;
  updateInterval?: number;
  isOpen: boolean;
  onClose: () => void;
};

export function DevStatsPanel({
  audioContext,
  updateInterval = 2000,
  onClose,
}: DevStatsPanelProps) {
  // Panel position and size state
  const [panelPosition, setPanelPosition] = useState({
    x: window.innerWidth - 270,
    y: 10,
  });
  const [panelSize, setPanelSize] = useState({ width: 250, height: 400 });

  const [memoryStats, setMemoryStats] = useState<MemoryStats | null>(null);
  const [audioStats, setAudioStats] = useState<AudioNodeStats | null>(null);
  const [poolStats, setPoolStats] =
    useState<ReturnType<typeof getPoolStats>>(null);
  const [audioParamStats, setAudioParamStats] =
    useState<ReturnType<typeof getAudioParamOptimizationStats>>(null);
  const [audioBufferStats, setAudioBufferStats] =
    useState<ReturnType<typeof getAudioBufferOptimizationStats>>(null);
  const [audioWorkletStats, setAudioWorkletStats] =
    useState<ReturnType<typeof getAudioWorkletOptimizationStats>>(null);

  useEffect(() => {
    const updateStats = () => {
      const memory = getMemoryStats();
      const audio = getAudioContextStats(audioContext);
      const pool = getPoolStats();
      const audioParam = getAudioParamOptimizationStats();
      const audioBuffer = getAudioBufferOptimizationStats();
      const audioWorklet = getAudioWorkletOptimizationStats();

      setMemoryStats(memory);
      setAudioStats(audio);
      setPoolStats(pool);
      setAudioParamStats(audioParam);
      setAudioBufferStats(audioBuffer);
      setAudioWorkletStats(audioWorklet);
    };

    updateStats();
    const interval = setInterval(updateStats, updateInterval);

    return () => clearInterval(interval);
  }, [audioContext, updateInterval]);

  if (!memoryStats && !audioStats) {
    return null;
  }

  const formatMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(1);
  const getMemoryStatus = (usedMB: number) => {
    if (usedMB > 200) return styles.memoryWarning;
    if (usedMB > 100) return styles.memoryHigh;
    return "";
  };

  return (
    <Rnd
      className={styles.statsPanel}
      position={panelPosition}
      size={panelSize}
      onDragStop={(e, d) => setPanelPosition({ x: d.x, y: d.y })}
      onResizeStop={(e, direction, ref, delta, position) => {
        setPanelSize({ width: ref.style.width, height: ref.style.height });
        setPanelPosition(position);
      }}
      minWidth={200}
      minHeight={300}
      maxWidth={500}
      maxHeight={800}
      bounds="window"
      enableResizing={{
        top: true,
        right: true,
        bottom: true,
        left: true,
        topRight: true,
        bottomRight: true,
        bottomLeft: true,
        topLeft: true,
      }}
    >
      <div className={styles.statsTitle} style={{ cursor: "move" }}>
        <span>DEV STATS</span>
        <button
          className={styles.closeButton}
          onClick={onClose}
          title="Close panel"
        >
          ×
        </button>
      </div>

      {memoryStats && (
        <>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Memory Used:</span>
            <span
              className={cn(
                styles.statValue,
                getMemoryStatus(memoryStats.usedJSHeapSize / (1024 * 1024))
              )}
            >
              {formatMB(memoryStats.usedJSHeapSize)} MB
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Memory Total:</span>
            <span className={styles.statValue}>
              {formatMB(memoryStats.totalJSHeapSize)} MB
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Memory Limit:</span>
            <span className={styles.statValue}>
              {formatMB(memoryStats.jsHeapSizeLimit)} MB
            </span>
          </div>
        </>
      )}

      {audioContext && (
        <>
          <div className={styles.separator} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Audio State:</span>
            <span
              className={cn(
                styles.statValue,
                audioContext.state === "running"
                  ? styles.audioContext
                  : styles.audioContextError
              )}
            >
              {audioContext.state}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Sample Rate:</span>
            <span className={styles.statValue}>
              {audioContext.sampleRate} Hz
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Base Latency:</span>
            <span className={styles.statValue}>
              {(audioContext.baseLatency * 1000).toFixed(1)} ms
            </span>
          </div>
          {audioContext.outputLatency !== undefined && (
            <div className={styles.statRow}>
              <span className={styles.statLabel}>Output Latency:</span>
              <span className={styles.statValue}>
                {(audioContext.outputLatency * 1000).toFixed(1)} ms
              </span>
            </div>
          )}
        </>
      )}

      {audioStats && (
        <>
          <div className={styles.separator} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Est. Latency:</span>
            <span className={styles.statValue}>
              {audioStats.activeNodes} ms
            </span>
          </div>
        </>
      )}

      {poolStats && (
        <>
          <div className={styles.separator} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Pool Hits:</span>
            <span className={cn(styles.statValue, styles.poolEfficient)}>
              {poolStats.poolHits}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Pool Misses:</span>
            <span className={cn(styles.statValue, styles.poolInefficient)}>
              {poolStats.poolMisses}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Nodes Created:</span>
            <span className={styles.statValue}>{poolStats.created}</span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Nodes Reused:</span>
            <span className={cn(styles.statValue, styles.poolEfficient)}>
              {poolStats.reused}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Pool Efficiency:</span>
            <span
              className={cn(
                styles.statValue,
                poolStats.poolHits > poolStats.poolMisses
                  ? styles.poolEfficient
                  : styles.poolInefficient
              )}
            >
              {poolStats.poolHits + poolStats.poolMisses > 0
                ? Math.round(
                    (poolStats.poolHits /
                      (poolStats.poolHits + poolStats.poolMisses)) *
                      100
                  )
                : 0}
              %
            </span>
          </div>
        </>
      )}

      {audioParamStats && (
        <>
          <div className={styles.separator} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>AudioParam Events:</span>
            <span className={styles.statValue}>
              {audioParamStats.totalEvents}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Tracked Params:</span>
            <span className={styles.statValue}>
              {audioParamStats.totalParams}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Needs Swap:</span>
            <span
              className={cn(
                styles.statValue,
                audioParamStats.paramsNeedingSwap > 0
                  ? styles.memoryWarning
                  : styles.poolEfficient
              )}
            >
              {audioParamStats.paramsNeedingSwap}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Avg Events/Param:</span>
            <span className={styles.statValue}>
              {audioParamStats.averageEventsPerParam.toFixed(1)}
            </span>
          </div>
        </>
      )}

      {audioBufferStats && (
        <>
          <div className={styles.separator} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Buffer Cache:</span>
            <span className={styles.statValue}>
              {audioBufferStats.totalBuffers} buffers
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Cache Size:</span>
            <span className={styles.statValue}>
              {audioBufferStats.totalSizeMB.toFixed(1)} MB
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Resampling Queue:</span>
            <span className={styles.statValue}>
              {audioBufferStats.queueLength}
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Processing:</span>
            <span
              className={cn(
                styles.statValue,
                audioBufferStats.isProcessing
                  ? styles.audioContext
                  : styles.poolEfficient
              )}
            >
              {audioBufferStats.isProcessing ? "Active" : "Idle"}
            </span>
          </div>
        </>
      )}

      {audioWorkletStats && (
        <>
          <div className={styles.separator} />
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Worklets:</span>
            <span className={styles.statValue}>
              {audioWorkletStats.performance.totalWorklets} active
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Avg CPU:</span>
            <span className={styles.statValue}>
              {audioWorkletStats.performance.averageCpuUsage.toFixed(1)}%
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Memory Pools:</span>
            <span className={styles.statValue}>
              {audioWorkletStats.memory.totalPools} pools,{" "}
              {audioWorkletStats.memory.totalSizeMB} MB
            </span>
          </div>
          <div className={styles.statRow}>
            <span className={styles.statLabel}>Parameter Batches:</span>
            <span className={styles.statValue}>
              {audioWorkletStats.batches.totalBatches} pending
            </span>
          </div>
        </>
      )}

      <AudioParamOptimizationDemo />
      <AudioBufferOptimizationDemo />
      <AudioWorkletOptimizationDemo />
    </Rnd>
  );
}
