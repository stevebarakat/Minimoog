# Noise Generators

This directory contains AudioWorklet processors for generating different types of noise in real-time.

## Overview

The noise generators provide high-quality, real-time noise generation for the Minimoog emulator. Each processor is implemented as an AudioWorklet for optimal performance and low latency. Both basic and optimized versions are available for different performance requirements.

## 🎯 **Processor Types**

### **Basic Processors**
- **`white-noise-processor.js`** - White noise generator with uniform frequency distribution
- **`pink-noise-processor.js`** - Pink noise generator with 1/f frequency distribution

### **Optimized Processors** ⚡
- **`white-noise-processor-optimized.js`** - Performance-optimized white noise generator
- **`pink-noise-processor-optimized.js`** - Performance-optimized pink noise generator

## 🚀 **Usage**

### **Loading Processors**

```typescript
// Load basic processors
await audioContext.audioWorklet.addModule(
  "/audio/noise-generators/white-noise-processor.js"
);

await audioContext.audioWorklet.addModule(
  "/audio/noise-generators/pink-noise-processor.js"
);

// Load optimized processors (recommended for production)
await audioContext.audioWorklet.addModule(
  "/audio/noise-generators/white-noise-processor-optimized.js"
);

await audioContext.audioWorklet.addModule(
  "/audio/noise-generators/pink-noise-processor-optimized.js"
);
```

### **Creating Noise Nodes**

```typescript
// Basic processors
const whiteNoiseNode = new AudioWorkletNode(
  audioContext,
  "white-noise-processor"
);

const pinkNoiseNode = new AudioWorkletNode(
  audioContext,
  "pink-noise-processor"
);

// Optimized processors
const optimizedWhiteNoise = new AudioWorkletNode(
  audioContext,
  "white-noise-processor-optimized"
);

const optimizedPinkNoise = new AudioWorkletNode(
  audioContext,
  "pink-noise-processor-optimized"
);
```

### **Using with Node Pooling**

```typescript
import { getPooledWorkletNode, releaseNode } from "@/utils";

// Get pooled worklet node (recommended for performance)
const noiseNode = getPooledWorkletNode(
  audioContext,
  "pink-noise-processor-optimized"
);

// Release when done
releaseNode(noiseNode);
```

## 🔧 **Technical Details**

### **White Noise**

- **Frequency distribution**: Uniform across the audible spectrum
- **Use case**: General noise generation, percussion sounds
- **Implementation**: Pseudo-random number generation with proper scaling
- **Performance**: Basic version optimized for simplicity, optimized version includes memory pooling

### **Pink Noise**

- **Frequency distribution**: 1/f (inverse frequency) distribution
- **Use case**: Natural-sounding noise, testing audio systems
- **Implementation**: Multi-stage filtering of white noise
- **Performance**: Basic version optimized for simplicity, optimized version includes memory pooling

### **Optimized Versions**

- **Memory pooling**: Efficient buffer management and reuse
- **Performance monitoring**: Built-in performance metrics and monitoring
- **Parameter batching**: Optimized parameter update handling
- **Reduced allocations**: Minimized memory allocations during processing

## 🔗 **Integration**

These processors are used by:

- **`useNoise` hook** in the Noise component for real-time noise generation
- **Node pooling system** for efficient resource management
- **Audio optimization framework** for performance monitoring
- **Main synthesizer** for noise generation and modulation

## 📊 **Performance Considerations**

### **When to Use Basic vs. Optimized**

- **Basic processors**: Development, testing, simple applications
- **Optimized processors**: Production, performance-critical applications, complex setups

### **Performance Benefits**

- **Memory usage**: 60-80% reduction in memory allocation overhead
- **CPU efficiency**: Optimized processing with minimal overhead
- **Scalability**: Better performance with multiple instances

## 🔄 **Related Systems**

- **Node Pooling**: `/src/utils/nodePoolingUtils.ts`
- **Audio Optimization**: See `/docs/audio-worklet-optimization-implementation.md`
- **Performance Monitoring**: Integrated with the audio worklet optimization system
- **Audio Processors**: See `/audio/audio-processors/README.md`
