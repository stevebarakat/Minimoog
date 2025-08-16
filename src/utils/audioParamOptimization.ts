import { getPooledNode, releaseNode } from "./nodePoolingUtils";
import { log as logger } from "./index";

/**
 * Configuration for AudioParam event management optimization
 */
export type AudioParamOptimizationConfig = {
  /** Maximum number of events before triggering node swap */
  maxEventsPerNode: number;
  /** Minimum time between node swaps (seconds) */
  minSwapInterval: number;
  /** Periodic swap interval (seconds) */
  swapInterval: number;
  /** Whether to enable automatic node swapping */
  enableNodeSwapping: boolean;
  /** Log level for optimization events */
  logLevel: "none" | "warn" | "info" | "debug";
};

/**
 * Default configuration for AudioParam optimization
 */
export const DEFAULT_AUDIO_PARAM_CONFIG: AudioParamOptimizationConfig = {
  maxEventsPerNode: 50, // Swap after 50 events (recommended for 140 BPM usage)
  minSwapInterval: 10, // Minimum 10 seconds between swaps
  swapInterval: 15, // Swap every 15 seconds by default
  enableNodeSwapping: true,
  logLevel: "warn",
};

/**
 * Tracks AudioParam event usage for optimization
 */
export type AudioParamTracker = {
  /** The AudioParam being tracked */
  param: AudioParam;
  /** Number of events scheduled */
  eventCount: number;
  /** Last event time */
  lastEventTime: number;
  /** First event time */
  firstEventTime: number;
  /** Whether this param should be swapped */
  needsSwap: boolean;
};

/**
 * Manages AudioParam event optimization through node swapping
 */
export class AudioParamOptimizer {
  private config: AudioParamOptimizationConfig;
  private trackers = new Map<AudioParam, AudioParamTracker>();
  private swapTimers = new Map<AudioParam, ReturnType<typeof setTimeout>>();
  private lastSwapTime = 0;

  constructor(config: Partial<AudioParamOptimizationConfig> = {}) {
    this.config = { ...DEFAULT_AUDIO_PARAM_CONFIG, ...config };
  }

  /**
   * Track an AudioParam event and determine if node swapping is needed
   */
  trackEvent(param: AudioParam, eventType: string): void {
    if (!this.config.enableNodeSwapping) return;

    const now = performance.now();
    let tracker = this.trackers.get(param);

    if (!tracker) {
      tracker = {
        param,
        eventCount: 0,
        lastEventTime: now,
        firstEventTime: now,
        needsSwap: false,
      };
      this.trackers.set(param, tracker);
    }

    tracker.eventCount++;
    tracker.lastEventTime = now;

    // Check if we need to swap based on event count
    if (tracker.eventCount >= this.config.maxEventsPerNode) {
      tracker.needsSwap = true;
      this.log(
        "warn",
        `AudioParam ${eventType} has ${tracker.eventCount} events, marking for swap`
      );
    }

    // Schedule periodic swap if not already scheduled
    this.schedulePeriodicSwap(param);
  }

  /**
   * Schedule a periodic swap for an AudioParam
   */
  private schedulePeriodicSwap(param: AudioParam): void {
    if (this.swapTimers.has(param)) return;

    const timer = setTimeout(() => {
      this.swapTimers.delete(param);
      this.forceSwap(param);
    }, this.config.swapInterval * 1000);

    this.swapTimers.set(param, timer);
  }

  /**
   * Force a swap for an AudioParam that has accumulated too many events
   */
  forceSwap(param: AudioParam): void {
    const tracker = this.trackers.get(param);
    if (!tracker || !tracker.needsSwap) return;

    const now = performance.now();
    if (now - this.lastSwapTime < this.config.minSwapInterval * 1000) {
      this.log("debug", "Skipping swap due to minimum interval");
      return;
    }

    this.log("info", `Swapping AudioParam with ${tracker.eventCount} events`);
    this.lastSwapTime = now;

    // Reset tracker
    tracker.eventCount = 0;
    tracker.needsSwap = false;
    tracker.firstEventTime = now;
  }

  /**
   * Create a new GainNode and swap it for the current one
   * This is the core optimization strategy from the performance document
   */
  async swapGainNode(
    oldGainNode: GainNode,
    audioContext: AudioContext,
    connections: { input?: AudioNode; output?: AudioNode }
  ): Promise<GainNode> {
    if (!this.config.enableNodeSwapping) return oldGainNode;

    try {
      // Create new gain node from pool
      const newGainNode = getPooledNode("gain", audioContext) as GainNode;

      // Transfer current gain value
      const currentGain = oldGainNode.gain.value;
      newGainNode.gain.setValueAtTime(currentGain, audioContext.currentTime);

      // Disconnect old node
      oldGainNode.disconnect();

      // Connect new node
      if (connections.input) {
        connections.input.connect(newGainNode);
      }
      if (connections.output) {
        newGainNode.connect(connections.output);
      }

      // Release old node back to pool
      releaseNode(oldGainNode);

      // Clear tracker for old param
      this.trackers.delete(oldGainNode.gain);

      this.log(
        "info",
        "Successfully swapped GainNode for AudioParam optimization"
      );
      return newGainNode;
    } catch (error) {
      this.log("warn", "Failed to swap GainNode:", error);
      return oldGainNode;
    }
  }

  /**
   * Check if an AudioParam needs swapping
   */
  needsSwap(param: AudioParam): boolean {
    const tracker = this.trackers.get(param);
    return tracker?.needsSwap || false;
  }

  /**
   * Get optimization statistics
   */
  getStats() {
    const totalParams = this.trackers.size;
    const paramsNeedingSwap = Array.from(this.trackers.values()).filter(
      (t) => t.needsSwap
    ).length;
    const totalEvents = Array.from(this.trackers.values()).reduce(
      (sum, t) => sum + t.eventCount,
      0
    );

    return {
      totalParams,
      paramsNeedingSwap,
      totalEvents,
      averageEventsPerParam: totalParams > 0 ? totalEvents / totalParams : 0,
    };
  }

  /**
   * Clean up all timers and trackers
   */
  dispose(): void {
    // Clear all swap timers
    this.swapTimers.forEach((timer) => clearTimeout(timer));
    this.swapTimers.clear();

    // Clear all trackers
    this.trackers.clear();

    this.log("info", "AudioParamOptimizer disposed");
  }

  /**
   * Log messages based on configured log level
   */
  private log(
    level: "none" | "warn" | "info" | "debug",
    message: string,
    ...args: unknown[]
  ): void {
    const logLevels = { none: 0, warn: 1, info: 2, debug: 3 };
    const currentLevel = logLevels[this.config.logLevel] || 0;
    const messageLevel = logLevels[level] || 0;

    if (messageLevel <= currentLevel) {
      switch (level) {
        case "warn":
          logger.warn(`[AudioParamOpt] ${message}`, ...args);
          break;
        case "info":
          logger.info(`[AudioParamOpt] ${message}`, ...args);
          break;
        case "debug":
          logger.debug(`[AudioParamOpt] ${message}`, ...args);
          break;
      }
    }
  }
}

/**
 * Global AudioParam optimizer instance
 */
let globalOptimizer: AudioParamOptimizer | null = null;

/**
 * Initialize the global AudioParam optimizer
 */
export function initializeAudioParamOptimizer(
  config: Partial<AudioParamOptimizationConfig> = {}
): AudioParamOptimizer {
  if (!globalOptimizer) {
    globalOptimizer = new AudioParamOptimizer(config);
  }
  return globalOptimizer;
}

/**
 * Get the global AudioParam optimizer instance
 */
export function getAudioParamOptimizer(): AudioParamOptimizer | null {
  return globalOptimizer;
}

/**
 * Dispose the global AudioParam optimizer
 */
export function disposeAudioParamOptimizer(): void {
  if (globalOptimizer) {
    globalOptimizer.dispose();
    globalOptimizer = null;
  }
}

/**
 * Enhanced AudioParam wrapper that automatically tracks events
 */
export function createOptimizedAudioParam(
  param: AudioParam,
  eventType: string = "unknown"
): AudioParam {
  const optimizer = getAudioParamOptimizer();
  if (!optimizer) return param;

  // Create a proxy to intercept AudioParam method calls
  return new Proxy(param, {
    get(target, prop) {
      const value = target[prop as keyof AudioParam];

      // Track events for methods that schedule values
      if (
        typeof value === "function" &&
        [
          "setValueAtTime",
          "setTargetAtTime",
          "linearRampToValueAtTime",
          "exponentialRampToValueAtTime",
          "setValueCurveAtTime",
        ].includes(prop as string)
      ) {
        return function (...args: unknown[]) {
          optimizer.trackEvent(target, eventType);
          return (value as (...args: unknown[]) => unknown).apply(target, args);
        };
      }

      return value;
    },
  });
}

/**
 * Check if AudioParam optimization is available in the current environment
 */
export function isAudioParamOptimizationAvailable(): boolean {
  return typeof AudioParam !== "undefined" && typeof Proxy !== "undefined";
}

/**
 * Check if AudioParam optimization is ready and initialized
 */
export function isAudioParamOptimizationReady(): boolean {
  return getAudioParamOptimizer() !== null;
}

/**
 * Get statistics about AudioParam optimization
 */
export function getAudioParamOptimizationStats() {
  const optimizer = getAudioParamOptimizer();
  if (!optimizer) return null;

  return optimizer.getStats();
}

/**
 * Utility to check if node swapping is recommended for current browser
 */
export function shouldUseNodeSwapping(): boolean {
  // Gecko-based browsers handle events more efficiently, so swapping is less critical
  const isGecko = navigator.userAgent.includes("Firefox");

  // For non-Gecko browsers, node swapping is more important
  return !isGecko;
}
