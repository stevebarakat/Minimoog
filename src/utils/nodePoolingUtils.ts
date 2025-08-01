// Audio constants for node pooling
const AUDIO = {
  DEFAULT_FFT_SIZE: 2048,
} as const;

// Node types that can be pooled
export type NodeType =
  | "gain"
  | "oscillator"
  | "filter"
  | "analyser"
  | "delay"
  | "convolver"
  | "waveShaper"
  | "panner"
  | "stereoPanner"
  | "dynamicsCompressor"
  | "channelSplitter"
  | "channelMerger";

// Pool configuration
export interface NodePoolConfig {
  maxPoolSize: number;
  enablePooling: boolean;
  cleanupInterval: number; // milliseconds
}

// Default pool configuration
export const DEFAULT_POOL_CONFIG: NodePoolConfig = {
  maxPoolSize: 32,
  enablePooling: true,
  cleanupInterval: 30000, // 30 seconds
};

// Pool state
export interface AudioNodePool {
  gain: GainNode[];
  oscillator: OscillatorNode[];
  filter: BiquadFilterNode[];
  analyser: AnalyserNode[];
  delay: DelayNode[];
  convolver: ConvolverNode[];
  waveShaper: WaveShaperNode[];
  panner: PannerNode[];
  stereoPanner: StereoPannerNode[];
  dynamicsCompressor: DynamicsCompressorNode[];
  channelSplitter: ChannelSplitterNode[];
  channelMerger: ChannelMergerNode[];
}

// Node metadata for tracking
export interface PooledNode {
  node: AudioNode;
  type: NodeType;
  createdAt: number;
  lastUsed: number;
  isActive: boolean;
}

// Enhanced pool with metadata tracking
export interface EnhancedAudioNodePool {
  nodes: Map<AudioNode, PooledNode>;
  config: NodePoolConfig;
  stats: {
    created: number;
    reused: number;
    disposed: number;
    poolHits: number;
    poolMisses: number;
  };
}

// Global pool instance
let globalPool: EnhancedAudioNodePool | null = null;

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
    config: finalConfig,
    stats: {
      created: 0,
      reused: 0,
      disposed: 0,
      poolHits: 0,
      poolMisses: 0,
    },
  };

  // Set up periodic cleanup
  if (finalConfig.enablePooling) {
    setInterval(() => {
      cleanupPool();
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

  // Try to find an available node in the pool
  for (const [node, metadata] of Array.from(globalPool.nodes.entries())) {
    if (metadata.type === type && !metadata.isActive) {
      metadata.isActive = true;
      metadata.lastUsed = Date.now();
      globalPool.stats.poolHits++;
      globalPool.stats.reused++;

      // Reset node state
      resetNodeState(node, type, audioContext);

      return node as T;
    }
  }

  // No available node in pool, create new one
  globalPool.stats.poolMisses++;
  const newNode = createNewNode(type, audioContext, options);

  // Add to pool if we haven't reached max size
  if (globalPool.nodes.size < globalPool.config.maxPoolSize) {
    const metadata: PooledNode = {
      node: newNode,
      type,
      createdAt: Date.now(),
      lastUsed: Date.now(),
      isActive: true,
    };
    globalPool.nodes.set(newNode, metadata);
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
    globalPool.nodes.delete(node);
    globalPool.stats.disposed++;
  }

  try {
    node.disconnect();

    // Stop oscillators
    if (node instanceof OscillatorNode) {
      node.stop();
    }

    // Close any worklet nodes
    if (
      "port" in node &&
      node.port &&
      typeof (node.port as { close?: () => void }).close === "function"
    ) {
      (node.port as { close: () => void }).close();
    }
  } catch {
    // Node might already be disposed
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
      disposeNode(node);
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
    case "filter":
      return audioContext.createBiquadFilter();
    case "analyser":
      return audioContext.createAnalyser();
    case "delay":
      return audioContext.createDelay((options?.maxDelayTime as number) || 1);
    case "convolver":
      return audioContext.createConvolver();
    case "waveShaper":
      return audioContext.createWaveShaper();
    case "panner":
      return audioContext.createPanner();
    case "stereoPanner":
      return audioContext.createStereoPanner();
    case "dynamicsCompressor":
      return audioContext.createDynamicsCompressor();
    case "channelSplitter":
      return audioContext.createChannelSplitter(
        (options?.numberOfOutputs as number) || 6
      );
    case "channelMerger":
      return audioContext.createChannelMerger(
        (options?.numberOfInputs as number) || 6
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
    case "filter":
      if (node instanceof BiquadFilterNode) {
        node.frequency.setValueAtTime(1000, now);
        node.Q.setValueAtTime(1, now);
        node.type = "lowpass";
      }
      break;
    case "analyser":
      if (node instanceof AnalyserNode) {
        node.fftSize = AUDIO.DEFAULT_FFT_SIZE;
        node.smoothingTimeConstant = 0.8;
      }
      break;
    case "delay":
      if (node instanceof DelayNode) {
        node.delayTime.setValueAtTime(0, now);
      }
      break;
    case "stereoPanner":
      if (node instanceof StereoPannerNode) {
        node.pan.setValueAtTime(0, now);
      }
      break;
    case "dynamicsCompressor":
      if (node instanceof DynamicsCompressorNode) {
        node.threshold.setValueAtTime(-24, now);
        node.knee.setValueAtTime(30, now);
        node.ratio.setValueAtTime(12, now);
        node.attack.setValueAtTime(0.003, now);
        node.release.setValueAtTime(0.25, now);
      }
      break;
  }
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
 * Legacy function for backward compatibility.
 * @param type - The type of audio node to get
 * @param audioContext - The audio context for node creation
 * @returns The pooled or newly created audio node
 */
export function getPooledNodeLegacy(
  type: NodeType,
  audioContext: AudioContext
): AudioNode {
  return getPooledNode(type, audioContext);
}
