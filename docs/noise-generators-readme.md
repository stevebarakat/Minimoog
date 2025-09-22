# Noise Generators

This directory contains AudioWorklet processors for generating different types of noise in real-time.

## Overview

The noise generators provide high-quality, real-time noise generation for the Minimoog emulator. Each processor is implemented as an AudioWorklet for optimal performance and low latency.

## 🎯 **Processor Types**

- **`white-noise-processor.js`** - White noise generator with uniform frequency distribution
- **`pink-noise-processor.js`** - Pink noise generator with 1/f frequency distribution

## 🚀 **Usage**

### **Loading Processors**

```typescript
// Load noise processors
await audioContext.audioWorklet.addModule(
  "/audio/noise-generators/white-noise-processor.js"
);

await audioContext.audioWorklet.addModule(
  "/audio/noise-generators/pink-noise-processor.js"
);
```

### **Creating Noise Nodes**

```typescript
// Create noise worklet nodes
const whiteNoiseNode = new AudioWorkletNode(
  audioContext,
  "white-noise-processor"
);

const pinkNoiseNode = new AudioWorkletNode(
  audioContext,
  "pink-noise-processor"
);
```

### **Integration with useNoise Hook**

The noise generators are primarily used through the `useNoise` hook which handles the complete setup:

```typescript
// In useNoise.ts - the actual implementation
const moduleUrl =
  mixer.noise.noiseType === "pink"
    ? "/audio/noise-generators/pink-noise-processor.js"
    : "/audio/noise-generators/white-noise-processor.js";

await audioContext.audioWorklet.addModule(moduleUrl);

const processorName =
  mixer.noise.noiseType === "pink"
    ? "pink-noise-processor"
    : "white-noise-processor";

const noiseNode = new AudioWorkletNode(audioContext, processorName);
```

## 🔧 **Technical Details**

### **White Noise**

- **Frequency distribution**: Uniform across the audible spectrum
- **Use case**: General noise generation, percussion sounds
- **Implementation**: Pseudo-random number generation with proper scaling
- **Performance**: Efficient real-time generation using `Math.random()`

### **Pink Noise**

- **Frequency distribution**: 1/f (inverse frequency) distribution
- **Use case**: Natural-sounding noise, testing audio systems
- **Implementation**: Multi-stage filtering of white noise using 6-pole filter
- **Performance**: Efficient filtering with optimized coefficients for real-time processing

### **Implementation Details**

**White Noise Algorithm:**

```javascript
// Simple pseudo-random generation
channel[i] = Math.random() * 2 - 1;
```

**Pink Noise Algorithm:**

```javascript
// 6-pole filter with optimized coefficients
const white = Math.random() * 2 - 1;
this.b0 = 0.99886 * this.b0 + white * 0.0555179;
this.b1 = 0.99332 * this.b1 + white * 0.0750759;
this.b2 = 0.969 * this.b2 + white * 0.153852;
this.b3 = 0.8665 * this.b3 + white * 0.3104856;
this.b4 = 0.55 * this.b4 + white * 0.5329522;
this.b5 = -0.7616 * this.b5 - white * 0.016898;
const b6 = white * 0.5362;
channel[i] =
  (this.b0 + this.b1 + this.b2 + this.b3 + this.b4 + this.b5 + b6) * 0.11;
```

## 🔗 **Integration**

These processors are used by:

- **`useNoise` hook** in the Noise component for real-time noise generation
- **Main synthesizer** for noise generation and modulation
- **Mixer component** for noise volume and type control

## 📊 **Performance Considerations**

### **Real-time Performance**

- **Low latency**: AudioWorklet implementation provides minimal processing delay
- **CPU efficiency**: Simple algorithms optimized for real-time audio processing
- **Memory usage**: Minimal memory footprint with efficient processing
- **Scalability**: Can handle multiple noise instances simultaneously

## 🔄 **Related Systems**

- **Audio Worklets**: `/public/audio/noise-generators/` - The actual processor implementations
- **Noise Component**: `/src/components/Noise/` - UI and integration components
- **Audio Processors**: See `audio-processors-readme.md` for other audio processors
- **Audio Worklet Integration**: See `audio-worklet-integration-guide.md` for setup details
