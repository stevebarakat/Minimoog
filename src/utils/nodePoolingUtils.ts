import { logger } from "@/utils/logUtils";
const AUDIO = {
  DEFAULT_FFT_SIZE: 2048,
} as const;

export type NodeType =
  | "gain" // Used everywhere - mixer, master, envelopes, etc.
  | "oscillator" // Used in tuner and oscillators (but bypassed in pooling)
  | "analyser" // Used in tuner
  | "audioWorklet" // Used for noise, overload meters, filters
  | "delay" // Used in delay effects
  | "convolver" // Used in reverb effects
  | "biquadFilter" // Used in filter processing
  | "stereoPanner" // Used in stereo processing
  | "dynamicsCompressor"; // Used in compression effects

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
  delay: DelayNode[];
  convolver: ConvolverNode[];
  biquadFilter: BiquadFilterNode[];
  stereoPanner: StereoPannerNode[];
  dynamicsCompressor: DynamicsCompressorNode[];
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
  // Cleanup interval ID for proper disposal
  cleanupInterval: number | null;
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
 * Type guard to check if a node has a specific property
 */
function hasProperty<K extends string>(
  node: unknown,
  property: K
): node is Record<K, unknown> {
  return node !== null && typeof node === "object" && property in node;
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
    cleanupInterval: null,
  };

  // Set up periodic cleanup and adaptive prewarming
  if (finalConfig.enablePooling) {
    globalPool.cleanupInterval = window.setInterval(() => {
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
 * Dispose the global node pool and clean up all resources
 */
export function disposeNodePool(): void {
  if (globalPool) {
    // Clear the cleanup interval
    if (globalPool.cleanupInterval) {
      clearInterval(globalPool.cleanupInterval);
    }

    // Dispose all nodes in the pool
    for (const node of globalPool.nodes.keys()) {
      try {
        disposeNode(node);
      } catch (error) {
        console.warn("Error disposing node during pool disposal:", error);
      }
    }

    // Clear all data structures
    globalPool.nodes.clear();
    globalPool.nodesByType.clear();
    globalPool.missPatterns.clear();
    globalPool = null;
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

  // Create delay nodes (used in delay effects)
  const delayNodes: DelayNode[] = [];
  for (let i = 0; i < 4; i++) {
    const node = getPooledNode<DelayNode>("delay", audioContext, {
      maxDelayTime: 2.0,
    });
    delayNodes.push(node);
  }

  // Create convolver nodes (used in reverb effects)
  const convolverNodes: ConvolverNode[] = [];
  for (let i = 0; i < 2; i++) {
    const node = getPooledNode<ConvolverNode>("convolver", audioContext);
    convolverNodes.push(node);
  }

  // Create biquad filter nodes (used in filter processing)
  const filterNodes: BiquadFilterNode[] = [];
  for (let i = 0; i < 4; i++) {
    const node = getPooledNode<BiquadFilterNode>("biquadFilter", audioContext);
    filterNodes.push(node);
  }

  // Release them back to pool immediately
  gainNodes.forEach((node) => releaseNode(node));
  analysers.forEach((node) => releaseNode(node));
  delayNodes.forEach((node) => releaseNode(node));
  convolverNodes.forEach((node) => releaseNode(node));
  filterNodes.forEach((node) => releaseNode(node));
}

// Debug functions removed for optimization

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

  // Check if AudioWorklet is supported
  if (!audioContext.audioWorklet) {
    logger.warn("AudioWorklet not supported, skipping worklet prewarming");
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
    case "delay": {
      const maxDelayTime = (options?.maxDelayTime as number) || 1.0;
      return audioContext.createDelay(maxDelayTime);
    }
    case "convolver":
      return audioContext.createConvolver();
    case "biquadFilter":
      return audioContext.createBiquadFilter();
    case "stereoPanner":
      return audioContext.createStereoPanner();
    case "dynamicsCompressor":
      return audioContext.createDynamicsCompressor();
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
    case "delay":
      if (hasProperty(node, "delayTime")) {
        try {
          const delayNode = node as {
            delayTime: {
              setValueAtTime: (value: number, time: number) => void;
            };
          };
          delayNode.delayTime.setValueAtTime(0, now);
        } catch {
          // Ignore errors in test environment
        }
      }
      break;
    case "convolver":
      if (hasProperty(node, "buffer")) {
        // Convolver nodes don't have many resettable parameters
        // The buffer is set externally, so we just ensure it's connected
      }
      break;
    case "biquadFilter":
      if (
        hasProperty(node, "frequency") &&
        hasProperty(node, "Q") &&
        hasProperty(node, "gain") &&
        hasProperty(node, "type")
      ) {
        try {
          const filterNode = node as Record<string, unknown>;
          const frequency = filterNode.frequency as {
            setValueAtTime: (value: number, time: number) => void;
          };
          const Q = filterNode.Q as {
            setValueAtTime: (value: number, time: number) => void;
          };
          const gain = filterNode.gain as {
            setValueAtTime: (value: number, time: number) => void;
          };
          const type = filterNode.type as { value: string };

          frequency.setValueAtTime(1000, now);
          Q.setValueAtTime(1, now);
          gain.setValueAtTime(0, now);
          type.value = "lowpass";
        } catch {
          // Ignore errors in test environment
        }
      }
      break;
    case "stereoPanner":
      if (hasProperty(node, "pan")) {
        try {
          const pannerNode = node as {
            pan: { setValueAtTime: (value: number, time: number) => void };
          };
          pannerNode.pan.setValueAtTime(0, now);
        } catch {
          // Ignore errors in test environment
        }
      }
      break;
    case "dynamicsCompressor":
      if (
        hasProperty(node, "threshold") &&
        hasProperty(node, "knee") &&
        hasProperty(node, "ratio") &&
        hasProperty(node, "attack") &&
        hasProperty(node, "release")
      ) {
        try {
          const compressorNode = node as Record<string, unknown>;
          const threshold = compressorNode.threshold as {
            setValueAtTime: (value: number, time: number) => void;
          };
          const knee = compressorNode.knee as {
            setValueAtTime: (value: number, time: number) => void;
          };
          const ratio = compressorNode.ratio as {
            setValueAtTime: (value: number, time: number) => void;
          };
          const attack = compressorNode.attack as {
            setValueAtTime: (value: number, time: number) => void;
          };
          const release = compressorNode.release as {
            setValueAtTime: (value: number, time: number) => void;
          };

          threshold.setValueAtTime(-24, now);
          knee.setValueAtTime(30, now);
          ratio.setValueAtTime(12, now);
          attack.setValueAtTime(0.003, now);
          release.setValueAtTime(0.25, now);
        } catch {
          // Ignore errors in test environment
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
 * Create a pooled DelayNode with optional max delay time.
 * @param audioContext - The audio context for node creation
 * @param maxDelayTime - Maximum delay time in seconds (default: 1.0)
 * @returns The pooled or newly created DelayNode
 */
export function getPooledDelayNode(
  audioContext: AudioContext,
  maxDelayTime: number = 1.0
): DelayNode {
  return getPooledNode<DelayNode>("delay", audioContext, { maxDelayTime });
}

/**
 * Create a pooled ConvolverNode for reverb effects.
 * @param audioContext - The audio context for node creation
 * @returns The pooled or newly created ConvolverNode
 */
export function getPooledConvolverNode(
  audioContext: AudioContext
): ConvolverNode {
  return getPooledNode<ConvolverNode>("convolver", audioContext);
}

/**
 * Create a pooled BiquadFilterNode for audio filtering.
 * @param audioContext - The audio context for node creation
 * @returns The pooled or newly created BiquadFilterNode
 */
export function getPooledBiquadFilterNode(
  audioContext: AudioContext
): BiquadFilterNode {
  return getPooledNode<BiquadFilterNode>("biquadFilter", audioContext);
}

/**
 * Create a pooled StereoPannerNode for stereo positioning.
 * @param audioContext - The audio context for node creation
 * @returns The pooled or newly created StereoPannerNode
 */
export function getPooledStereoPannerNode(
  audioContext: AudioContext
): StereoPannerNode {
  return getPooledNode<StereoPannerNode>("stereoPanner", audioContext);
}

/**
 * Create a pooled DynamicsCompressorNode for compression effects.
 * @param audioContext - The audio context for node creation
 * @returns The pooled or newly created DynamicsCompressorNode
 */
export function getPooledDynamicsCompressorNode(
  audioContext: AudioContext
): DynamicsCompressorNode {
  return getPooledNode<DynamicsCompressorNode>(
    "dynamicsCompressor",
    audioContext
  );
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
