# Audio Processors

This directory contains general-purpose AudioWorklet processors for audio processing, monitoring, and analysis.

## Overview

The audio processors provide real-time audio processing capabilities for the Minimoog emulator, including signal monitoring, overload detection, and modulation analysis. These processors integrate with the broader audio optimization systems including node pooling and performance monitoring.

## 🎯 **Processor Types**

### **Core Processors**

- **`modulation-monitor-processor.js`** - Real-time modulation signal monitoring and analysis
- **`overload-meter-processor.js`** - Audio level monitoring and clipping detection
- **`delay-processor.js`** - Custom delay effect with feedback and wet/dry mixing

### **Related Processors**

For complete audio processing capabilities, see also:

- **Moog Filters**: `/audio/moog-filters/huovilainen/` (including optimized versions)
- **Noise Generators**: `/audio/noise-generators/` (including optimized versions)

## 🚀 **Usage**

### **Loading Processors**

```typescript
// Load modulation monitor processor
await audioContext.audioWorklet.addModule(
  "/audio/audio-processors/modulation-monitor-processor.js"
);

// Load overload meter processor
await audioContext.audioWorklet.addModule(
  "/audio/audio-processors/overload-meter-processor.js"
);

// Load delay processor
await audioContext.audioWorklet.addModule(
  "/audio/audio-processors/delay-processor.js"
);
```

### **Creating Processor Nodes**

```typescript
// Create modulation monitor node
const modulationMonitor = new AudioWorkletNode(
  audioContext,
  "modulation-monitor-processor"
);

// Create overload meter node
const overloadMeter = new AudioWorkletNode(
  audioContext,
  "overload-meter-processor"
);

// Create delay processor node
const delayNode = new AudioWorkletNode(audioContext, "delay-processor", {
  processorOptions: {
    delayTime: 0.25, // 250ms default
    feedback: 0.3,
    wetLevel: 0.5,
    dryLevel: 0.5,
    enabled: true,
  },
});
```

### **Using with Node Pooling**

```typescript
import { getPooledWorkletNode, releaseNode } from "@/utils";

// Get pooled worklet node (recommended for performance)
const overloadMeter = getPooledWorkletNode(
  audioContext,
  "overload-meter-processor"
);

// Release when done
releaseNode(overloadMeter);
```

## 🔧 **Technical Details**

### **Modulation Monitor**

- **Purpose**: Real-time monitoring of modulation signals
- **Use case**: Debugging and analysis of LFO and envelope modulation
- **Output**: Modulation level data via message port
- **Performance**: Lightweight processing with minimal CPU overhead

### **Overload Meter**

- **Purpose**: Audio level monitoring and clipping detection
- **Use case**: Preventing audio distortion and overload
- **Output**: Overload status via message port
- **Threshold**: Configurable overload detection at 0.3 amplitude
- **Performance**: Efficient frame-based processing with debug logging

### **Delay Processor**

- **Purpose**: Custom delay effect with feedback and wet/dry mixing
- **Use case**: Adding spatial depth and echo effects to audio
- **Parameters**: Delay time (0.001-2.0s), feedback (0-0.95), wet/dry levels (0-1)
- **Features**: Real-time parameter updates, bypass mode, circular buffer implementation
- **Performance**: Efficient buffer management with minimal CPU overhead

## 🔗 **Integration**

These processors are used throughout the application for:

- **Modulation monitoring** in the main audio context
- **Overload detection** in external input and output components
- **Delay effects** in the effects processing chain
- **Signal analysis** for debugging and optimization
- **Performance monitoring** and audio quality assurance

## 📊 **Performance Considerations**

### **Node Pooling Integration**

- Processors are automatically prewarmed by the node pooling system
- Use `getPooledWorkletNode()` for optimal performance
- Processors support the performance monitoring system

### **Optimization Features**

- **Efficient processing**: Minimal CPU overhead per frame
- **Smart messaging**: Only sends updates when values change
- **Debug support**: Configurable debug output for development

## 🔄 **Related Systems**

- **Node Pooling**: `/src/utils/nodePoolingUtils.ts`
- **Audio Optimization**: See `audio-worklet-optimization-implementation.md`
- **Performance Monitoring**: Integrated with the audio worklet optimization system
