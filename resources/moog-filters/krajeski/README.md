# Krajeski Moog Filter

## Overview

The Krajeski Moog filter is based on Tim Stilson's MoogVCF analysis with compromise poles, providing a simplified yet effective approach to Moog ladder filter emulation. This implementation offers a balance between computational efficiency and authentic sound quality.

## Files

- `krajeskiFilterKernel.c` - C source code for the filter algorithm
- `krajeskiFilterKernel.wasm` - Compiled WebAssembly binary
- `krajeski-worklet-processor.js` - AudioWorklet processor for Web Audio API integration

## Characteristics

### Advantages

- **Compromise poles approach** - Based on Tim Stilson's research
- **Simplified implementation** - Efficient computation with good results
- **Stable operation** - Advanced parameter clamping and stability controls
- **Authentic sound** - Maintains characteristic Moog filter qualities

### Technical Details

- **4-stage ladder topology** - Classic Moog filter structure
- **Compromise pole placement** - Optimized for stability and sound quality
- **Tanh saturation** - Applied at each stage for authentic nonlinearity
- **State preservation** - Maintains filter state between samples

### Key Features

- **Simplified coefficient calculation** - Direct frequency ratio approach
- **Stage-by-stage processing** - Sequential ladder filter implementation
- **Resonance feedback** - 4x resonance multiplier with clamping
- **Stability controls** - Comprehensive parameter and output clamping

## Implementation Notes

### Current Status

- **Stability**: Advanced parameter clamping and NaN/inf checks
- **Performance**: Optimized for real-time audio processing
- **Compatibility**: Standard interface with other filter implementations
- **Quality**: Tim Stilson's compromise pole approach

### Technical Implementation

- **State variables**: 4-element array representing filter stages
- **Coefficient calculation**: Direct frequency ratio with stability clamping
- **Saturation**: Fast tanh approximation at each stage
- **Feedback**: Resonance feedback with automatic gain limiting

## Algorithm Details

### Coefficient Calculation

The filter uses a simplified coefficient approach:

```
f = cutoff / sampleRate
g = f  // Direct frequency ratio
if (g > 0.9) g = 0.9  // Stability clamp
```

### Resonance Feedback

Resonance is applied with automatic limiting:

```
resonanceFeedback = 4.0 * resonance
if (resonanceFeedback > 3.5) resonanceFeedback = 3.5
```

### Stage Processing

Each stage processes the signal sequentially:

```
temp = input - resonanceFeedback * stage[3]
temp = fast_tanh(temp)

stage[0] = g * temp + (1.0 - g) * stage[0]
stage[0] = fast_tanh(stage[0])

// Repeat for stages 1-3
```

## Usage

The filter is integrated into the Minimoog synthesizer and can be selected via the "Filter Type" dropdown. It provides the same interface as other filter implementations:

- Cutoff frequency control (20Hz - 20kHz)
- Resonance/emphasis control (0.0 - 0.99)
- Filter envelope modulation
- Real-time parameter changes

## Compilation

To recompile the WASM module:

```bash
cd public/audio/moog-filters/krajeski
emcc -O3 -s WASM=1 krajeskiFilterKernel.c -o krajeskiFilterKernel.wasm --no-entry
```

## References

- Tim Stilson: "Analyzing the Moog VCF with Considerations for Digital Implementation"
- Compromise pole placement techniques
- Moog ladder filter analysis and optimization
- Digital filter stability considerations

## Comparison with Other Filters

| Filter        | Self-Oscillation | Oversampling | Academic   | Sound Quality | Complexity |
| ------------- | ---------------- | ------------ | ---------- | ------------- | ---------- |
| **Krajeski**  | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐     |
| MusicDSP      | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐     |
| RK Simulation | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐ |
| Oberheim      | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐   |
| Simplified    | ⭐⭐⭐⭐⭐       | ⭐⭐⭐       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐     |
| Huovilainen   | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐     |
| Microtracker  | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐ |
| Improved      | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐      | ⭐⭐⭐     |
| Stilson       | ⭐⭐⭐           | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐      | ⭐⭐       |

The Krajeski filter offers Tim Stilson's compromise pole approach with simplified implementation, providing a good balance between computational efficiency and authentic Moog filter sound quality.
