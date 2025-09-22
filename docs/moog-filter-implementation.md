# Moog Filter Implementation

## Overview

The Moog filter is implemented using WebAssembly for optimal performance and authentic sound reproduction. The current implementation uses the Huovilainen filter model for physically accurate emulation of the original Moog ladder filter, enhanced with authentic Minimoog-style characteristics.

## Directory Structure

```
public/audio/moog-filters/
└── huovilainen/               # Huovilainen filter (physically accurate)
    ├── huovilainen-worklet-processor.js          # Basic AudioWorklet processor
    ├── huovilainen-worklet-processor.js # Optimized processor with performance enhancements
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
- `public/audio/moog-filters/huovilainen/huovilainen-worklet-processor.js` - **Optimized processor with performance enhancements**

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

**Note**: The synthesizer now uses only the Huovilainen filter for authentic Moog ladder filter emulation.

## Authentic Minimoog Improvements

### Enhanced Saturation Characteristics

**Original Implementation**: Basic tanh saturation
**New Implementation**: Enhanced tanh with subtle analog character

```c
// Enhanced tanh with subtle Minimoog-style character and frequency-dependent enhancement
inline float enhanced_tanh(float x) {
    // Use standard tanh as base
    float basic_tanh = tanh(x);

    // Add subtle analog-style asymmetry for character
    float asymmetry = x > 0 ? 1.0f : 0.98f;

    // Add subtle harmonic enhancement that scales with input level
    float abs_x = fabs(x);
    float input_scale = abs_x / (1.0f + abs_x);

    // Frequency-dependent scaling to reduce artifacts at high frequencies
    float freq_scale = 1.0f / (1.0f + 2.0f * input_scale);

    // Reduced harmonic enhancement to prevent high-frequency artifacts
    float harmonic_boost = 1.0f + 0.015f * input_scale * freq_scale;

    // Add subtle even harmonic content with frequency scaling
    float even_harmonic = 0.008f * x * input_scale * freq_scale / (1.0f + abs_x);

    // Add subtle 3rd harmonic with frequency scaling
    float third_harmonic = 0.006f * x * input_scale * input_scale * freq_scale;

    // Add subtle intermodulation distortion with frequency scaling
    float intermod = 0.004f * x * input_scale * freq_scale;

    return asymmetry * basic_tanh * harmonic_boost + even_harmonic + third_harmonic + intermod;
}
```

**Benefits:**

- **Warm distortion**: Subtle harmonic enhancement for musical character
- **Frequency-aware**: Reduces artifacts at high frequencies
- **Analog asymmetry**: Subtle non-linear behavior for authenticity
- **Controlled enhancement**: Prevents excessive distortion

### Optimized Oversampling

**Implementation**: 2x oversampling for quality vs. performance balance

The filter uses 2x oversampling to provide better audio quality while maintaining reasonable CPU usage:

```c
// Oversample by 2x for better quality
for (int j = 0; j < 2; j++) {
    // Process at 2x sample rate
    // ... filter processing ...
}
```

### Authentic Resonance Behavior

**Implementation**: Linear resonance scaling with stability protection

The resonance implementation provides authentic Minimoog behavior:

```c
// Update filter coefficients based on current cutoff and resonance
void updateFilterCoefficients() {
    double fc = cutoff / SAMPLE_RATE;

    // Clamp fc to prevent filter instability at high frequencies
    fc = fmin(fc, 0.45);

    // Calculate resonance scaling
    resQuad = 4.0 * resonance * acr;
}
```

**Resonance Behavior:**

- **Linear scaling**: Direct mapping from resonance parameter
- **Stability protection**: Prevents filter oscillation at extreme settings
- **Authentic range**: Full resonance control up to self-oscillation
- **Smooth response**: Parameter smoothing prevents zipper noise

### Enhanced Self-Oscillation

**Implementation**: Full resonance range with stability protection

The filter can achieve self-oscillation when resonance is set to maximum, producing a clean sine wave output.

## Technical Implementation Details

### 4-Pole Ladder Structure

The classic Moog ladder filter structure is maintained with enhanced saturation at each stage:

```
Input → Stage 0 → Stage 1 → Stage 2 → Stage 3 → Output
         ↓         ↓         ↓         ↓
    Enhanced Enhanced Enhanced Enhanced
      Tanh    Tanh    Tanh    Tanh
         ↓         ↓         ↓         ↓
       Feedback ← Feedback ← Feedback ← Feedback
```

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

### Parameter Smoothing

Enhanced parameter smoothing prevents zipper noise while maintaining responsiveness:

```c
// Smooth parameter interpolation to prevent popping
inline float smoothParameter(float current, float target, float smoothing) {
    return current + (target - current) * smoothing;
}
```

### DC Blocking

The filter includes DC blocking to prevent low-frequency artifacts:

```c
// Apply DC blocking to prevent low-frequency artifacts
float input = inputBuffer[i];
float dcBlockedInput = input - dcBlockInput + dcBlockCoeff * dcBlockOutput;
dcBlockInput = input;
dcBlockOutput = dcBlockedInput;
```

### Frequency Handling

The filter includes intelligent frequency handling for stability:

```c
// Clamp fc to prevent filter instability at high frequencies
// Keep it well below Nyquist (0.5) to maintain stability
fc = fmin(fc, 0.45);
```

## Performance Characteristics

The Huovilainen filter provides:

- **CPU Usage**: Medium (optimized WASM implementation with -O3)
- **Latency**: Low (real-time processing with minimal buffering)
- **Authenticity**: High (physically accurate modeling)
- **Memory**: Efficient (optimized buffer management in optimized version)
- **Scalability**: Good (supports real-time parameter updates)

## Usage

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

## Musical Benefits

### 1. Warmer Sound

The enhanced tanh saturation and subtle harmonic enhancement create a warmer, more musical sound that's closer to the original Minimoog's character.

### 2. Stable Performance

The stability protection and DC blocking ensure reliable performance across all frequency and resonance settings.

### 3. Natural Resonance

The linear resonance scaling provides intuitive control over the filter's emphasis, with smooth behavior throughout the range.

### 4. Authentic Self-Oscillation

Full resonance capability allows the filter to be used as a pure sine wave oscillator, just like the original.

### 5. Organic Feel

The subtle analog characteristics add variations that make the sound less "perfect" and more organic, similar to real analog hardware.

## Usage Recommendations

### For Classic Minimoog Sounds

1. **Bass sounds**: Use cutoff in the 100-500Hz range with moderate resonance (0.3-0.6)
2. **Lead sounds**: Use cutoff in the 1-4kHz range with higher resonance (0.6-0.8)
3. **Self-oscillation**: Set resonance to maximum for sine wave oscillator

### For Modern Applications

1. **Low-pass filtering**: Take advantage of the stable frequency range
2. **Resonance effects**: Use the full resonance range for creative effects
3. **Analog character**: The subtle variations add warmth to any sound

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

## Best Practices

### Production Use

- **Filter Implementation**: The synthesizer uses the Huovilainen filter for authentic Moog ladder filter emulation
- **Processor**: Use the optimized processor (`huovilainen-worklet-processor.js`) for production
- **Monitor performance metrics** to ensure optimal operation
- **Handle parameter updates efficiently** using the batching system
- **Test with various parameter ranges** to ensure stability

### Development

- **Use the basic processor** for debugging and development
- **Test with extreme parameter values** to catch edge cases
- **Monitor memory usage** during development
- **Validate audio quality** across different sample rates

## Current Features

- ✅ **Enhanced tanh saturation** with harmonic enhancement
- ✅ **2x oversampling** for quality improvement
- ✅ **Parameter smoothing** to prevent artifacts
- ✅ **DC blocking** for clean low frequencies
- ✅ **Stability protection** for reliable operation
- ✅ **Full resonance range** including self-oscillation
- ✅ **WASM optimization** for performance
- ✅ **AudioWorklet integration** for real-time processing

## Future Enhancements

The current implementation provides a solid foundation for further improvements:

- **Additional saturation models** for different character options
- **Variable oversampling** for quality vs. performance trade-offs
- **Enhanced analog simulation** for more authentic behavior
- **Performance monitoring** for optimization insights
- **SIMD Instructions**: Vectorized processing for better performance
- **Web Workers**: Background processing for complex calculations
- **Adaptive Quality**: Dynamic quality adjustment based on CPU load

## Conclusion

The Huovilainen filter implementation provides an authentic, high-performance Moog ladder filter experience. The synthesizer now uses only this implementation for the most physically accurate emulation of the original Moog ladder filter.

These improvements make the Huovilainen Moog ladder filter more authentic to the original Minimoog Model D while maintaining the stability and performance benefits of the digital implementation. The result is a filter that captures the legendary "warm" sound of the original while being suitable for modern digital audio applications.

The implementation focuses on practical improvements that provide musical benefits without excessive complexity, ensuring reliable performance across all settings.
