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

The synthesizer is designed to support multiple filter implementations, but currently only implements the Huovilainen model:

```typescript
// Current filter type configuration
SYNTH_CONFIG.FILTER.TYPE = {
  VALUES: ["huovilainen"] as const,
  DEFAULT: "huovilainen" as const,
};

// Filter type in synth state
filterType: "huovilainen";
```

**Future Extensibility**: The system is architected to support additional filter types, with the type system already in place for easy expansion.

## Research Foundation

The Huovilainen implementation is part of extensive research into digital Moog filter emulation. The project includes multiple filter implementations in the `resources/moog-filters/` directory:

### Available Research Implementations

- **Stilson Model** - Tim Stilson's analysis and implementation
- **Microtracker Model** - Magnus Jonsson's optimized version
- **Krajeski Model** - Aaron Krajeski's improved implementation
- **Simplified Model** - Simplified nonlinear Moog filter
- **Improved Model** - Enhanced differential equation approach
- **RK Simulation Model** - Runge-Kutta numerical integration
- **MusicDSP Model** - Community-driven implementation

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

### Loading the Filter

```typescript
// Load Huovilainen filter processor (choose optimized for production)
await audioContext.audioWorklet.addModule(
  "/audio/moog-filters/huovilainen/huovilainen-worklet-processor-optimized.js"
);
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
  "huovilainen-worklet-processor-optimized", // Use optimized version
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

The filter is integrated into the main synthesizer through the `useAudioNodeCreation` hook, which handles:

- Loading of the Huovilainen filter module (optimized version recommended)
- Audio graph connection and routing
- Parameter updates and real-time control
- Filter envelope and modulation routing
- Performance monitoring and optimization

## Future Enhancements

### Planned Filter Types

The system architecture supports easy addition of new filter implementations:

1. **Stilson Model**: For users preferring Tim Stilson's approach
2. **Microtracker Model**: For performance-critical applications
3. **Custom Models**: User-defined filter implementations
4. **Hybrid Systems**: Combinations of different filter approaches

### Performance Improvements

- **SIMD Instructions**: Vectorized processing for better performance
- **Web Workers**: Background processing for complex calculations
- **Adaptive Quality**: Dynamic quality adjustment based on CPU load
- **Real-time Tuning**: Automatic parameter optimization

## Best Practices

### Production Use

- **Use the optimized processor** (`huovilainen-worklet-processor-optimized.js`) for production
- **Monitor performance metrics** to ensure optimal operation
- **Handle parameter updates efficiently** using the batching system
- **Test with various parameter ranges** to ensure stability

### Development

- **Use the basic processor** for debugging and development
- **Test with extreme parameter values** to catch edge cases
- **Monitor memory usage** during development
- **Validate audio quality** across different sample rates

## Conclusion

The Huovilainen filter implementation provides an authentic, high-performance Moog ladder filter experience. The system is designed for extensibility, allowing future addition of alternative filter models while maintaining the current high-quality implementation.

The optimized processor version offers significant performance improvements for production use, while the research foundation provides a solid academic basis for the implementation choices.
