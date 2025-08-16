import { log as logger } from "@/utils/logUtils";
const AUDIO = {
  DEFAULT_FFT_SIZE: 2048,
} as const;

export type NodeType =
  | "gain" // Used everywhere - mixer, master, envelopes, etc.
  | "oscillator" // Used in tuner and oscillators (but bypassed in pooling)
  | "analyser" // Used in tuner
  | "audioWorklet"; // Used for noise, overload meters, filters
// Removed unused types: filter, delay, convolver, waveShaper, panner,
// stereoPanner, dynamicsCompressor, channelSplitter, channelMerger

export type NodePoolConfig = {
  maxPoolSize: number;
  enablePooling: boolean;
  cleanupInterval: number; // milliseconds
};

export const DEFAULT_POOL_CONFIG: NodePoolConfig = {
  maxPoolSize: 32,
  enablePooling: true,
  cleanupInterval: 30000, // 30 seconds
};

export type AudioNodePool = {
  gain: GainNode[];
  oscillator: OscillatorNode[];
  analyser: AnalyserNode[];
  audioWorklet: AudioWorkletNode[];
};

export type PooledNode = {
  node: AudioNode;
  type: NodeType;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
  processorName?: string; // For AudioWorkletNode identification
  options?: Record<string, unknown>; // Store creation options for matching
  optionsHash?: string; // Hash of options for quick comparison
};

export type EnhancedAudioNodePool = {
  nodes: Map<AudioNode, PooledNode>;
  nodesByType: Map<NodeType, Set<AudioNode>>; // Index for faster lookups
  config: NodePoolConfig;
  stats: {
    created: number;
    reused: number;
    disposed: number;
    poolHits: number;
    poolMisses: number;
  };
  // Track miss patterns for intelligent prewarming
  missPatterns: Map<NodeType, number>;
};

let globalPool: EnhancedAudioNodePool | null = null;

/**
 * Create a simple hash from options for node matching
 */
function hashOptions(options?: Record<string, unknown>): string {
  if (!options || Object.keys(options).length === 0) {
    return "default";
  }
  return JSON.stringify(options, Object.keys(options).sort());
}

/**
 * Initialize the global audio node pool with optional configuration.
 * @param config - Optional configuration to override defaults
 * @returns The initialized enhanced audio node pool
 */
export function initializeNodePool(
  config: Partial<NodePoolConfig> = {}
): EnhancedAudioNodePool {
  if (globalPool) {
    return globalPool;
  }

  const finalConfig = { ...DEFAULT_POOL_CONFIG, ...config };

  globalPool = {
    nodes: new Map(),
    nodesByType: new Map(),
    config: finalConfig,
    stats: {
      created: 0,
      reused: 0,
      disposed: 0,
      poolHits: 0,
      poolMisses: 0,
    },
    missPatterns: new Map(),
  };

  // Set up periodic cleanup and adaptive prewarming
  if (finalConfig.enablePooling) {
    setInterval(() => {
      cleanupPool();
      // Run adaptive prewarming every cleanup cycle
      if (globalPool) {
        const audioCtx = Array.from(globalPool.nodes.keys())[0]?.context;
        if (audioCtx) {
          adaptivePrewarm(audioCtx as AudioContext);
        }
      }
    }, finalConfig.cleanupInterval);
  }

  return globalPool;
}

/**
 * Get a node from the pool or create a new one if none available.
 * @param type - The type of audio node to get
 * @param audioContext - The audio context for node creation
 * @param options - Optional parameters for node creation
 * @returns The pooled or newly created audio node
 */
export function getPooledNode<T extends AudioNode>(
  type: NodeType,
  audioContext: AudioContext,
  options?: Record<string, unknown>
): T {
  if (!globalPool || !globalPool.config.enablePooling) {
    return createNewNode(type, audioContext, options) as T;
  }

  // Oscillators are single-use only and cannot be pooled effectively
  if (type === "oscillator") {
    return createNewNode(type, audioContext, options) as T;
  }

  // Create hash for options matching
  const optionsHash = hashOptions(options);
  const processorName = options?.processorName as string;

  // Use indexed lookup for better performance
  const nodesOfType = globalPool.nodesByType.get(type);
  if (nodesOfType) {
    for (const node of nodesOfType) {
      const metadata = globalPool.nodes.get(node);
      if (metadata && !metadata.isActive) {
        // Match based on options hash for better compatibility
        if (metadata.optionsHash !== optionsHash) {
          continue;
        }

        // For AudioWorkletNode, ensure processor name matches (double check)
        if (
          type === "audioWorklet" &&
          processorName &&
          metadata.processorName !== processorName
        ) {
          continue;
        }

        metadata.isActive = true;
        metadata.lastUsed = Date.now();
        globalPool.stats.poolHits++;
        globalPool.stats.reused++;

        // Reset node state
        resetNodeState(node, type, audioContext);

        return node as T;
      }
    }
  }

  // No available node in pool, create new one
  globalPool.stats.poolMisses++;

  // Track miss patterns for intelligent prewarming
  const currentMisses = globalPool.missPatterns.get(type) || 0;
  globalPool.missPatterns.set(type, currentMisses + 1);

  const newNode = createNewNode(type, audioContext, options);

  // Add to pool if we haven't reached max size
  if (globalPool.nodes.size < globalPool.config.maxPoolSize) {
    const metadata: PooledNode = {
      node: newNode,
      type,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      isActive: true,
      processorName: type === "audioWorklet" ? processorName : undefined,
      options: options,
      optionsHash: optionsHash,
    };
    globalPool.nodes.set(newNode, metadata);

    // Add to type index for faster lookups
    if (!globalPool.nodesByType.has(type)) {
      globalPool.nodesByType.set(type, new Set());
    }
    globalPool.nodesByType.get(type)!.add(newNode);

    globalPool.stats.created++;
  }

  return newNode as T;
}

/**
 * Release a node back to the pool for reuse.
 * @param node - The audio node to release back to the pool
 */
export function releaseNode(node: AudioNode): void {
  if (!globalPool || !globalPool.config.enablePooling) {
    disposeNode(node);
    return;
  }

  const metadata = globalPool.nodes.get(node);
  if (metadata) {
    metadata.isActive = false;
    metadata.lastUsed = Date.now();

    // Disconnect all connections
    try {
      node.disconnect();
    } catch {
      // Node might already be disconnected
    }
  } else {
    // Node not in pool, dispose it
    disposeNode(node);
  }
}

/**
 * Dispose a node completely (remove from pool and clean up).
 * @param node - The audio node to dispose and remove from pool
 */
export function disposeNode(node: AudioNode): void {
  if (!globalPool) {
    return;
  }

  const metadata = globalPool.nodes.get(node);
  if (metadata) {
    try {
      // Disconnect all connections
      node.disconnect();
    } catch {
      // Node might already be disconnected
    }

    // Remove from pool and type index
    globalPool.nodes.delete(node);
    const nodesOfType = globalPool.nodesByType.get(metadata.type);
    if (nodesOfType) {
      nodesOfType.delete(node);
      // Clean up empty sets
      if (nodesOfType.size === 0) {
        globalPool.nodesByType.delete(metadata.type);
      }
    }
    globalPool.stats.disposed++;
  }

  try {
    // For oscillator nodes, try to stop them
    if (node instanceof OscillatorNode) {
      node.stop();
    }
    // For AudioWorkletNode, send cleanup message
    else if (node instanceof AudioWorkletNode) {
      node.port.postMessage({ type: "cleanup" });
    }
  } catch {
    // Node might already be stopped or disposed
  }
}

/**
 * Clean up inactive nodes from the pool that haven't been used recently.
 */
export function cleanupPool(): void {
  if (!globalPool) return;

  const now = Date.now();
  const maxAge = 60000; // 1 minute

  for (const [node, metadata] of Array.from(globalPool.nodes.entries())) {
    if (!metadata.isActive && now - metadata.lastUsed > maxAge) {
      try {
        disposeNode(node);
      } catch (error) {
        // Node might already be disposed
        console.warn("Error disposing node during cleanup:", error);
      }
    }
  }
}

/**
 * Get current pool statistics for monitoring and debugging.
 * @returns Pool statistics object or null if pool not initialized
 */
export function getPoolStats(): EnhancedAudioNodePool["stats"] | null {
  return globalPool?.stats || null;
}

/**
 * Reset all pool statistics to zero for fresh monitoring.
 */
export function resetPoolStats(): void {
  if (globalPool) {
    globalPool.stats = {
      created: 0,
      reused: 0,
      disposed: 0,
      poolHits: 0,
      poolMisses: 0,
    };
    globalPool.missPatterns.clear();
  }
}

/**
 * Get detailed pool insights including miss patterns for optimization.
 */
export function getPoolInsights() {
  if (!globalPool) return null;

  const insights = {
    stats: globalPool.stats,
    missPatterns: Object.fromEntries(globalPool.missPatterns),
    poolUtilization: globalPool.nodes.size / globalPool.config.maxPoolSize,
    activeNodes: Array.from(globalPool.nodes.values()).filter((n) => n.isActive)
      .length,
    availableNodes: Array.from(globalPool.nodes.values()).filter(
      (n) => !n.isActive
    ).length,
  };

  return insights;
}

/**
 * Adaptive prewarming based on observed miss patterns.
 */
export function adaptivePrewarm(audioContext: AudioContext): void {
  if (!globalPool || !globalPool.config.enablePooling) {
    return;
  }

  // Analyze miss patterns and prewarm accordingly
  const sortedMisses = Array.from(globalPool.missPatterns.entries())
    .filter(([type]) => type !== "oscillator" && type !== "audioWorklet") // Skip oscillators and audioWorklets
    .sort(([, a], [, b]) => b - a); // Sort by miss count descending

  for (const [nodeType, missCount] of sortedMisses) {
    if (missCount > 2) {
      // Only prewarm if we've seen multiple misses
      const nodesToCreate = Math.min(Math.ceil(missCount / 2), 4); // Create up to 4 nodes
      const nodes: AudioNode[] = [];

      for (let i = 0; i < nodesToCreate; i++) {
        try {
          const node = getPooledNode(nodeType, audioContext);
          nodes.push(node);
        } catch (error) {
          logger.error("Error prewarming node:", error);
          break; // Stop if we can't create more nodes
        }
      }

      // Release them back to pool
      nodes.forEach((node) => releaseNode(node));
    }
  }
}

/**
 * Prewarm the pool with commonly used node types for better efficiency.
 * @param audioContext - The audio context to use for node creation
 */
export function prewarmPool(audioContext: AudioContext): void {
  if (!globalPool || !globalPool.config.enablePooling) {
    return;
  }

  // Focus on actually used node types only

  // Create gain nodes (heavily used everywhere - mixer, master, envelopes, etc.)
  const gainNodes: GainNode[] = [];
  for (let i = 0; i < 16; i++) {
    // Increased to 16 since these are used most
    const node = getPooledNode<GainNode>("gain", audioContext);
    gainNodes.push(node);
  }

  // Create analyser nodes (used by tuner)
  const analysers: AnalyserNode[] = [];
  for (let i = 0; i < 2; i++) {
    const node = getPooledNode<AnalyserNode>("analyser", audioContext);
    analysers.push(node);
  }

  // Release them back to pool immediately
  gainNodes.forEach((node) => releaseNode(node));
  analysers.forEach((node) => releaseNode(node));
}

// Add global functions for debugging
if (typeof window !== "undefined") {
  (
    window as unknown as {
      poolDebug: {
        getInsights: () => EnhancedAudioNodePool["stats"] | null;
        adaptivePrewarm: (audioContext: AudioContext) => void;
        resetStats: () => void;
      };
    }
  ).poolDebug = {
    getInsights: () => globalPool?.stats || null,
    adaptivePrewarm: (audioContext: AudioContext) =>
      adaptivePrewarm(audioContext),
    resetStats: resetPoolStats,
  };
}

/**
 * Prewarm worklet processors that are commonly used.
 * This is separate from main prewarming since worklets require async loading.
 */
export async function prewarmWorkletProcessors(
  audioContext: AudioContext
): Promise<void> {
  if (!globalPool || !globalPool.config.enablePooling) {
    return;
  }

  try {
    // Load common audio processors
    const processorModules = [
      "/audio/audio-processors/overload-meter-processor.js",
      "/audio/noise-generators/pink-noise-processor.js",
      "/audio/noise-generators/white-noise-processor.js",
    ];

    // Load all processor modules in parallel
    await Promise.all(
      processorModules.map(async (url) => {
        try {
          await audioContext.audioWorklet.addModule(url);
        } catch (error) {
          logger.error("Error prewarming worklet processor:", error);
        }
      })
    );

    // Prewarm common worklet nodes
    const workletNodes: AudioWorkletNode[] = [];

    // Create overload meter nodes (used by external input)
    for (let i = 0; i < 2; i++) {
      try {
        const node = getPooledWorkletNode(
          audioContext,
          "overload-meter-processor"
        );
        workletNodes.push(node);
      } catch (error) {
        logger.error("Error prewarming worklet node:", error);
      }
    }

    // Create noise generator nodes
    try {
      const pinkNoise = getPooledWorkletNode(
        audioContext,
        "pink-noise-processor"
      );
      const whiteNoise = getPooledWorkletNode(
        audioContext,
        "white-noise-processor"
      );
      workletNodes.push(pinkNoise, whiteNoise);
    } catch (error) {
      logger.error("Error prewarming worklet node:", error);
    }

    // Release all worklet nodes back to pool
    workletNodes.forEach((node) => releaseNode(node));
  } catch (error) {
    logger.error("Error prewarming worklet processors:", error);
  }
}

/**
 * Create a new audio node of the specified type.
 * @param type - The type of audio node to create
 * @param audioContext - The audio context for node creation
 * @param options - Optional parameters for node creation
 * @returns The newly created audio node
 */
function createNewNode(
  type: NodeType,
  audioContext: AudioContext,
  options?: Record<string, unknown>
): AudioNode {
  switch (type) {
    case "gain":
      return audioContext.createGain();
    case "oscillator":
      return audioContext.createOscillator();
    case "analyser":
      return audioContext.createAnalyser();
    case "audioWorklet":
      if (!options?.processorName) {
        throw new Error("AudioWorkletNode requires processorName in options");
      }
      return new AudioWorkletNode(
        audioContext,
        options.processorName as string,
        options.workletOptions as AudioWorkletNodeOptions
      );
    default:
      throw new Error(`Unknown node type: ${type}`);
  }
}

/**
 * Reset a node to its default state for reuse.
 * @param node - The audio node to reset
 * @param type - The type of the audio node
 * @param audioContext - The audio context for timing
 */
function resetNodeState(
  node: AudioNode,
  type: NodeType,
  audioContext: AudioContext
): void {
  const now = audioContext.currentTime;

  switch (type) {
    case "gain":
      if (node instanceof GainNode) {
        node.gain.setValueAtTime(1, now);
      }
      break;
    case "oscillator":
      if (node instanceof OscillatorNode) {
        node.frequency.setValueAtTime(440, now);
        node.type = "sine";
      }
      break;
    case "analyser":
      if (node instanceof AnalyserNode) {
        node.fftSize = AUDIO.DEFAULT_FFT_SIZE;
        node.smoothingTimeConstant = 0.8;
      }
      break;
    case "audioWorklet":
      if (node instanceof AudioWorkletNode) {
        // Reset AudioWorkletNode by sending a reset message
        // This is processor-specific, so we keep it minimal
        try {
          node.port.postMessage({ type: "reset" });
        } catch {
          // Some processors might not support reset messages
        }
      }
      break;
  }
}

/**
 * Create a pooled AudioWorkletNode with specific processor.
 * @param audioContext - The audio context for node creation
 * @param processorName - The name of the audio worklet processor
 * @param workletOptions - Optional AudioWorkletNode options
 * @returns The pooled or newly created AudioWorkletNode
 */
export function getPooledWorkletNode(
  audioContext: AudioContext,
  processorName: string,
  workletOptions?: AudioWorkletNodeOptions
): AudioWorkletNode {
  return getPooledNode<AudioWorkletNode>("audioWorklet", audioContext, {
    processorName,
    workletOptions,
  });
}

/**
 * Batch create multiple nodes of the same type using the pool.
 * @param type - The type of audio nodes to create
 * @param audioContext - The audio context for node creation
 * @param count - The number of nodes to create
 * @param options - Optional parameters for node creation
 * @returns Array of created audio nodes
 */
export function createNodeBatch<T extends AudioNode>(
  type: NodeType,
  audioContext: AudioContext,
  count: number,
  options?: Record<string, unknown>
): T[] {
  const nodes: T[] = [];
  for (let i = 0; i < count; i++) {
    nodes.push(getPooledNode<T>(type, audioContext, options));
  }
  return nodes;
}

/**
 * Batch release multiple nodes back to the pool.
 * @param nodes - Array of audio nodes to release
 */
export function releaseNodeBatch(nodes: AudioNode[]): void {
  nodes.forEach((node) => releaseNode(node));
}

/**
 * Check if a node is currently in the pool.
 * @param node - The audio node to check
 * @returns True if the node is in the pool, false otherwise
 */
export function isNodeInPool(node: AudioNode): boolean {
  return globalPool?.nodes.has(node) || false;
}

/**
 * Get the type of a pooled node.
 * @param node - The audio node to check
 * @returns The node type or null if not in pool
 */
export function getNodeType(node: AudioNode): NodeType | null {
  return globalPool?.nodes.get(node)?.type || null;
}

/**
 * Force cleanup of all nodes in the pool.
 */
export function clearPool(): void {
  if (!globalPool) return;

  for (const [node] of Array.from(globalPool.nodes.entries())) {
    disposeNode(node);
  }
}

/**
 * Update pool configuration with new settings.
 * @param config - Partial configuration to update
 */
export function updatePoolConfig(config: Partial<NodePoolConfig>): void {
  if (globalPool) {
    globalPool.config = { ...globalPool.config, ...config };
  }
}

/**
 * Get detailed pool information for debugging.
 * @returns Detailed pool information or null if pool not initialized
 */
export function getDetailedPoolInfo() {
  if (!globalPool) return null;

  const typeBreakdown: Record<NodeType, { active: number; inactive: number }> =
    {} as Record<NodeType, { active: number; inactive: number }>;

  for (const [type, nodes] of globalPool.nodesByType.entries()) {
    typeBreakdown[type] = { active: 0, inactive: 0 };
    for (const node of nodes) {
      const metadata = globalPool.nodes.get(node);
      if (metadata) {
        if (metadata.isActive) {
          typeBreakdown[type].active++;
        } else {
          typeBreakdown[type].inactive++;
        }
      }
    }
  }

  return {
    totalNodes: globalPool.nodes.size,
    maxPoolSize: globalPool.config.maxPoolSize,
    enablePooling: globalPool.config.enablePooling,
    stats: globalPool.stats,
    typeBreakdown,
  };
}
