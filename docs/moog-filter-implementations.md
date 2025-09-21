# Moog Filter Implementation

This document describes the WASM-based Moog ladder filter implementation used in the Model D synthesizer.

## Overview

The Moog filter is implemented using WebAssembly for optimal performance and authentic sound reproduction. The current implementation uses the Huovilainen filter model for physically accurate emulation of the original Moog ladder filter.

## Directory Structure

```
public/audio/moog-filters/
└── huovilainen/               # Huovilainen filter (physically accurate)
    ├── huovilainen-worklet-processor.js          # Basic AudioWorklet processor
    ├── huovilainen-worklet-processor-optimized.js # Optimized processor with performance enhancements
    ├── huovilainenFilterKernel.c                 # C source code for Huovilainen filter
    └── huovilainenFilterKernel.wasm             # Compiled WASM bytecode
```

## Current Implementation

### Huovilainen Filter

The synthesizer uses the Huovilainen filter model, which provides the most physically accurate emulation of the original Moog ladder filter. This implementation is based on Antti Huovilainen's research and provides authentic nonlinear behavior and self-oscillation characteristics.

**Files:**

- `public/audio/moog-filters/huovilainen/huovilainenFilterKernel.c` - C source code for Huovilainen filter
- `public/audio/moog-filters/huovilainen/huovilainenFilterKernel.wasm` - Compiled WASM bytecode
- `public/audio/moog-filters/huovilainen/huovilainen-worklet-processor.js` - Basic AudioWorklet processor
- `public/audio/moog-filters/huovilainen/huovilainen-worklet-processor-optimized.js` - **Optimized processor with performance enhancements**

### Filter Type System

The synthesizer now supports multiple filter implementations:

```typescript
// Current filter type configuration
SYNTH_CONFIG.FILTER.TYPE = {
  VALUES: ["huovilainen"] as const,
  DEFAULT: "huovilainen" as const,
};

// Filter type in synth state
filterType: "huovilainen";
```

#### Available Filter Types

1. **Huovilainen Filter** (Default)

   - Most physically accurate emulation
   - Requires 2x oversampling for optimal quality
   - Authentic nonlinear behavior and self-oscillation
   - Higher computational cost

**Note**: The synthesizer now uses only the Huovilainen filter for authentic Moog ladder filter emulation.

## Research Foundation

The Huovilainen implementation is part of extensive research into digital Moog filter emulation. The project includes multiple filter implementations in the `resources/moog-filters/` directory:

### Research Foundation

The Huovilainen implementation is based on extensive research into digital Moog filter emulation. The project includes research implementations in the `resources/moog-ladders/` directory for reference and study purposes.

### Why Huovilainen?

The Huovilainen model was chosen for the synthesizer because it provides:

- **Physical Accuracy**: Most faithful to the original analog circuit
- **Nonlinear Behavior**: Authentic saturation and distortion characteristics
- **Self-Oscillation**: Proper resonance behavior at high feedback levels
- **Research Validation**: Peer-reviewed academic implementation
- **Performance**: Efficient WASM-based execution

## Implementation Details

### WASM Compilation

The Huovilainen filter is compiled using Emscripten with the following flags:

```bash
# Actual compilation directive from source code
emcc -O3 -s WASM=1 huovilainenFilterKernel.c -o huovilainenFilterKernel.wasm --no-entry

# Note: -O3 provides maximum optimization for performance
# The --no-entry flag is used since this is a library module
```

### AudioWorklet Integration

Each filter is wrapped in an AudioWorklet processor that handles:

- WASM module loading and initialization
- Parameter updates via message port
- Real-time audio processing
- Error handling and fallbacks

#### **Basic vs. Optimized Processors**

- **Basic Processor**: Standard implementation with core functionality
- **Optimized Processor**: Enhanced version with:
  - Parameter batching for better performance
  - Memory pooling for efficient buffer management
  - Performance monitoring and metrics
  - Enhanced error handling and fallbacks

### Performance Characteristics

The Huovilainen filter provides:

- **CPU Usage**: Medium (optimized WASM implementation with -O3)
- **Latency**: Low (real-time processing with minimal buffering)
- **Authenticity**: High (physically accurate modeling)
- **Memory**: Efficient (optimized buffer management in optimized version)
- **Scalability**: Good (supports real-time parameter updates)

## Usage

### Filter Implementation

The synthesizer uses the **Huovilainen filter** for authentic Moog ladder filter emulation with physical modeling.

### Loading the Filter

The filter type is automatically selected based on your choice in the Filter Type dropdown. The system will load the appropriate processor and WASM module:

```typescript
// The synthesizer uses the Huovilainen filter by default
const processorUrl =
  "/audio/moog-filters/huovilainen/huovilainen-worklet-processor.js";
const wasmUrl = "/audio/moog-filters/huovilainen/huovilainenFilterKernel.wasm";

// Load the selected processor
await audioContext.audioWorklet.addModule(processorUrl);
```

### Creating Filter Nodes

```typescript
// Load the WASM module
const response = await fetch(
  "/audio/moog-filters/huovilainen/huovilainenFilterKernel.wasm"
);
const wasmBuffer = await response.arrayBuffer();

// Create the filter node
const filterNode = new AudioWorkletNode(
  audioContext,
  "huovilainen-worklet-processor", // Use basic version
  {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
  }
);

// Send WASM buffer to the worklet
filterNode.port.postMessage(wasmBuffer);
```

### Parameter Control

The filter supports comprehensive parameter control:

```typescript
// Cutoff frequency (10Hz - 32kHz, mapped from 0-10 control)
filterNode.port.postMessage({ type: "cutoff", cutOff: 1000 });

// Resonance (0.0 - 1.0, with self-oscillation at high values)
filterNode.port.postMessage({ type: "resonance", resonance: 0.8 });

// Filter envelope modulation
filterNode.port.postMessage({
  type: "envelopeAttack",
  envelopeAttack: {
    startCutoff: 1000,
    peakCutoff: 5000,
    attackTime: 0.1,
    decayTime: 0.5,
    sustainLevel: 0.7,
  },
});
```

## Testing

The filter is tested through the main synthesizer application. The implementation includes comprehensive parameter control for:

- Cutoff frequency modulation
- Resonance control
- Filter envelope modulation
- Keyboard tracking
- Performance monitoring (in optimized version)

## Development

### Compiling WASM Module

To recompile the WASM module after making changes to the C source:

```bash
cd public/audio/moog-filters/huovilainen

# Use the exact flags from the source code
emcc -O3 -s WASM=1 huovilainenFilterKernel.c -o huovilainenFilterKernel.wasm --no-entry

# For development with debugging
emcc -O0 -g -s WASM=1 huovilainenFilterKernel.c -o huovilainenFilterKernel.wasm --no-entry
```

### Debugging

The filter implementation includes debug logging that can be enabled by setting the `DEBUG` flag in the AudioWorklet processor.

### Performance Optimization

The optimized processor includes:

- **Parameter Batching**: Groups multiple parameter updates for efficiency
- **Memory Pooling**: Reuses audio buffers to reduce allocation overhead
- **Performance Monitoring**: Real-time metrics for optimization
- **Error Recovery**: Graceful fallbacks for edge cases

## Integration

The filters are integrated into the main synthesizer through the `useAudioNodeCreation` hook, which handles:

- **Filter Loading**: Automatically loads the Huovilainen filter implementation
- **Audio Graph Connection**: Routes audio through the Huovilainen filter
- **Parameter Updates**: Real-time control of cutoff, resonance, and envelope parameters
- **Filter Envelope**: Full ADSR envelope support
- **Modulation Routing**: LFO and modulation wheel integration
- **Performance Monitoring**: Real-time metrics and optimization

## Future Enhancements

### Current Implementation

The synthesizer uses the Huovilainen filter model for authentic Moog ladder filter emulation:

1. **Huovilainen Model** (Implemented): Authentic physical modeling with oversampling

### Performance Improvements

- **SIMD Instructions**: Vectorized processing for better performance
- **Web Workers**: Background processing for complex calculations
- **Adaptive Quality**: Dynamic quality adjustment based on CPU load
- **Real-time Tuning**: Automatic parameter optimization

## Best Practices

### Production Use

- **Filter Implementation**: The synthesizer uses the Huovilainen filter for authentic Moog ladder filter emulation
- **Processor**: Use the optimized processor (`huovilainen-worklet-processor-optimized.js`) for production
- **Monitor performance metrics** to ensure optimal operation
- **Handle parameter updates efficiently** using the batching system
- **Test with various parameter ranges** to ensure stability

### Development

- **Use the basic processor** for debugging and development
- **Test with extreme parameter values** to catch edge cases
- **Monitor memory usage** during development
- **Validate audio quality** across different sample rates

## Conclusion

The Huovilainen filter implementation provides an authentic, high-performance Moog ladder filter experience. The synthesizer now uses only this implementation for the most physically accurate emulation of the original Moog ladder filter.

The optimized processor version offers significant performance improvements for production use, while the research foundation provides a solid academic basis for the implementation choices.
