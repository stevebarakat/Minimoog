# Node Pooling Implementation

## Overview

The Minimoog Web Audio synthesizer implements a comprehensive node pooling system to optimize performance by reusing audio nodes instead of constantly creating and destroying them. This is particularly important for real-time audio applications where garbage collection pauses can cause audio dropouts.

## Features

### 1. **Multi-Type Node Support**

- **Core Web Audio API nodes**: GainNode, AnalyserNode
- **AudioWorkletNode**: With processor-specific pooling and options matching
- **Indexed lookups**: O(1) performance instead of O(n) linear search
- **Smart options matching**: Hash-based matching for compatible node reuse

### 2. **Smart Pool Management**

- Automatic cleanup of unused nodes
- Configurable pool size and cleanup intervals
- Processor-specific matching for AudioWorkletNodes
- Node state reset for clean reuse
- Adaptive prewarming based on miss patterns

### 3. **Performance Monitoring**

- Pool hit/miss statistics with miss pattern analysis
- Node creation/reuse tracking
- Real-time efficiency metrics
- Detailed type breakdown for debugging
- Pool utilization insights

## Usage

### Basic Node Pooling

```typescript
import { getPooledNode, releaseNode } from "@/utils/data";

// Get a pooled gain node
const gainNode = getPooledNode<GainNode>("gain", audioContext);

// Use the node...

// Release back to pool when done
releaseNode(gainNode);
```

### AudioWorkletNode Pooling

```typescript
import { getPooledWorkletNode, releaseNode } from "@/utils/data";

// Get a pooled worklet node with specific processor
const workletNode = getPooledWorkletNode(audioContext, "pink-noise-processor");

// Use the node...

// Release back to pool when done
releaseNode(workletNode);
```

### Specialized Node Functions

```typescript
import {
  getPooledDelayNode,
  getPooledConvolverNode,
  getPooledBiquadFilterNode,
  getPooledStereoPannerNode,
  getPooledDynamicsCompressorNode,
  releaseNode,
} from "@/utils/data";

// Get specialized nodes with optimized configurations
const delayNode = getPooledDelayNode(audioContext, 2.0); // 2 second max delay
const convolverNode = getPooledConvolverNode(audioContext);
const filterNode = getPooledBiquadFilterNode(audioContext);
const pannerNode = getPooledStereoPannerNode(audioContext);
const compressorNode = getPooledDynamicsCompressorNode(audioContext);

// Use the nodes...

// Release back to pool when done
releaseNode(delayNode);
releaseNode(convolverNode);
releaseNode(filterNode);
releaseNode(pannerNode);
releaseNode(compressorNode);
```

### Batch Operations

```typescript
import { createNodeBatch, releaseNodeBatch } from "@/utils/data";

// Create multiple nodes at once
const gainNodes = createNodeBatch<GainNode>("gain", audioContext, 5);

// Use the nodes...

// Release all back to pool
releaseNodeBatch(gainNodes);
```

### Pool Initialization

The pool is automatically initialized when the AudioContext is created:

```typescript
// In useAudioContext.ts
initializeNodePool({
  maxPoolSize: 64,
  enablePooling: true,
  cleanupInterval: 30000, // 30 seconds
});
```

## Configuration

### Pool Configuration Options

```typescript
type NodePoolConfig = {
  maxPoolSize: number; // Maximum nodes in pool (default: 32)
  enablePooling: boolean; // Enable/disable pooling (default: true)
  cleanupInterval: number; // Cleanup interval in ms (default: 30000)
};
```

### Supported Node Types

**Currently Supported:**

- `gain` - GainNode (heavily used for mixer, master, envelopes, etc.)
- `analyser` - AnalyserNode (used by tuner)
- `audioWorklet` - AudioWorkletNode (with processor-specific matching)
- `delay` - DelayNode (used in delay effects)
- `convolver` - ConvolverNode (used in reverb effects)
- `biquadFilter` - BiquadFilterNode (used in filter processing)
- `stereoPanner` - StereoPannerNode (used in stereo processing)
- `dynamicsCompressor` - DynamicsCompressorNode (used in compression effects)

**Note on Oscillators:**

- `oscillator` - OscillatorNode (used in tuner and oscillators)
- **Oscillators cannot be pooled** due to their single-use nature
- The system automatically bypasses pooling for oscillator nodes

## Performance Benefits

### 1. **Reduced Garbage Collection**

- Nodes are reused instead of created/destroyed
- Significantly reduces GC pressure
- Eliminates audio dropouts from GC pauses

### 2. **Faster Node Creation**

- Pool hits are ~10x faster than creating new nodes
- Indexed lookups provide O(1) performance
- Pre-warmed nodes ready for immediate use

### 3. **Memory Efficiency**

- Controlled memory usage with configurable pool size
- Automatic cleanup of unused nodes
- Prevents memory leaks from orphaned nodes

### 4. **Intelligent Prewarming**

- Adaptive prewarming based on miss patterns
- Automatic creation of commonly needed node types
- Optimized for actual usage patterns

## Monitoring and Debugging

### Development Statistics Panel

When in development mode, the DevStatsPanel shows:

- Pool hit/miss ratios
- Node creation/reuse counts
- Pool efficiency percentage
- Memory usage statistics
- Miss pattern analysis

### Pool Statistics API

```typescript
import { getPoolStats } from "@/utils/data";

// Get basic stats
const stats = getPoolStats();
if (stats) {
  console.log(
    `Pool efficiency: ${
      (stats.poolHits / (stats.poolHits + stats.poolMisses)) * 100
    }%`
  );
  console.log("Pool hits:", stats.poolHits);
  console.log("Pool misses:", stats.poolMisses);
  console.log("Nodes created:", stats.created);
  console.log("Nodes reused:", stats.reused);
}
```

## Implementation Details

### Node Reset Strategy

Each node type has specific reset logic to ensure clean reuse:

- **GainNode**: Reset gain to 1.0
- **AnalyserNode**: Reset FFT size and smoothing
- **AudioWorkletNode**: Send reset message to processor

### Options Hash Matching

The system uses intelligent matching for node reuse:

```typescript
// Create hash for options matching
const optionsHash = hashOptions(options);

// Match based on options hash for better compatibility
if (metadata.optionsHash !== optionsHash) {
  continue;
}
```

This ensures that nodes with different creation options are not mixed, maintaining audio quality and consistency.

### AudioWorkletNode Considerations

AudioWorkletNodes require special handling:

- **Processor name matching**: Ensures correct reuse of worklet processors
- **Options matching**: Hash-based matching for compatible configurations
- **Reset messages**: Optional reset messages to processors
- **Cleanup messages**: Proper disposal messages on cleanup

### Memory Management

- **Automatic cleanup**: Every 30 seconds (configurable)
- **Node disposal**: Nodes unused for >1 minute are disposed
- **Pool size limits**: Prevents unbounded growth
- **Type-indexed storage**: Efficient lookups by node type
- **Adaptive prewarming**: Creates nodes based on miss patterns

### Adaptive Prewarming

The system automatically analyzes miss patterns and prewarms accordingly:

```typescript
// Analyze miss patterns and prewarm accordingly
const sortedMisses = Array.from(globalPool.missPatterns.entries())
  .filter(([type]) => type !== "oscillator" && type !== "audioWorklet")
  .sort(([, a], [, b]) => b - a); // Sort by miss count descending

for (const [nodeType, missCount] of sortedMisses) {
  if (missCount > 2) {
    // Only prewarm if we've seen multiple misses
    const nodesToCreate = Math.min(Math.ceil(missCount / 2), 4);
    // Create and release nodes back to pool
  }
}
```

## Advanced Features

### 1. **Batch Operations**

```typescript
// Create multiple nodes efficiently
const nodes = createNodeBatch<GainNode>("gain", audioContext, 10);

// Release multiple nodes at once
releaseNodeBatch(nodes);
```

### 2. **Worklet Processor Prewarming**

```typescript
import { prewarmWorkletProcessors } from "@/utils/data";

// Prewarm common worklet processors for better performance
await prewarmWorkletProcessors(audioContext);
```

### 3. **Configuration Updates**

```typescript
import { updatePoolConfig } from "@/utils/data";

// Update pool configuration at runtime
updatePoolConfig({ maxPoolSize: 128 });
```

### 4. **Pool Management**

```typescript
import { clearPool, disposeNodePool } from "@/utils/data";

// Clear all nodes from pool
clearPool();

// Dispose the entire pool and clean up resources
disposeNodePool();
```

## Best Practices

1. **Always Release Nodes**: Use `releaseNode()` instead of just disconnecting
2. **Use Appropriate Pool Size**: Balance memory usage vs. performance (32-64 recommended)
3. **Monitor Pool Efficiency**: Aim for >80% hit rate in production
4. **Handle AudioWorkletNodes**: Use `getPooledWorkletNode()` for worklet processors
5. **Test Cleanup Logic**: Ensure proper cleanup in component unmount
6. **Monitor Miss Patterns**: Use insights to optimize node creation
7. **Avoid Oscillator Pooling**: Oscillators are single-use and cannot be pooled

## Performance Optimization

### 1. **Prewarming Strategy**

The system automatically prewarms based on usage patterns:

- **Gain nodes**: 16 nodes (heavily used everywhere)
- **Analyser nodes**: 2 nodes (used by tuner)
- **Delay nodes**: 4 nodes with 2.0 second max delay time
- **Convolver nodes**: 2 nodes (used in reverb effects)
- **Biquad filter nodes**: 4 nodes (used in filter processing)
- **Adaptive prewarming**: Based on observed miss patterns

### 2. **Miss Pattern Analysis**

Track and analyze miss patterns for optimization:

```typescript
import { getPoolStats } from "@/utils/data";

const stats = getPoolStats();
if (stats && stats.poolMisses > stats.poolHits) {
  // Consider increasing pool size or prewarming
  console.log("Low pool efficiency, consider optimization");
}
```

### 3. **Pool Size Tuning**

Recommended pool sizes for different use cases:

- **Small applications**: 16-32 nodes
- **Medium applications**: 32-64 nodes
- **Large applications**: 64-128 nodes
- **Production**: Monitor and adjust based on hit rates

## Future Enhancements

- **Voice-specific pooling**: For polyphonic synthesis
- **Preemptive node creation**: Based on usage patterns
- **Advanced cleanup strategies**: Based on usage frequency
- **Performance profiling**: Detailed CPU and memory analysis
- **Dynamic pool sizing**: Automatic adjustment based on load

## Troubleshooting

### Common Issues

1. **Low Pool Hit Rate**: Check if nodes are being released properly
2. **Memory Growth**: Monitor pool size and cleanup intervals
3. **Audio Dropouts**: Ensure proper node disposal and cleanup
4. **Performance Issues**: Use insights to identify bottlenecks

### Debug Information

```typescript
// Enable detailed logging
import { logger } from "@/utils/core";

// Check pool status
const stats = getPoolStats();
console.log("Pool Status:", stats);

// Check if nodes are in pool
import { isNodeInPool, getNodeType } from "@/utils/data";
const nodeInPool = isNodeInPool(someNode);
const nodeType = getNodeType(someNode);
```

## Conclusion

The node pooling system provides significant performance improvements for real-time audio applications. By focusing on the most commonly used node types and implementing intelligent prewarming, it achieves high efficiency while maintaining audio quality.

The system is designed for extensibility, allowing easy addition of new node types and optimization strategies based on actual usage patterns.
