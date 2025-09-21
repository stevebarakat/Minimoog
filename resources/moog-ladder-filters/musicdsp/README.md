# MusicDSP Moog Filter

## Overview

The MusicDSP Moog filter is a classic implementation from the MusicDSP community, based on the original Moog ladder filter topology. This filter represents the collective wisdom and refinements of the digital audio processing community, providing a reliable and well-tested approach to Moog filter emulation.

## Files

- `musicdspFilterKernel.c` - C source code for the filter algorithm
- `musicdspFilterKernel.wasm` - Compiled WebAssembly binary
- `musicdsp-worklet-processor.js` - AudioWorklet processor for Web Audio API integration

## Characteristics

### Advantages

- **Community tested** - Refined through years of community feedback
- **Classic approach** - Traditional ladder filter topology
- **Reliable performance** - Well-established stability characteristics
- **Efficient implementation** - Optimized for real-time processing

### Technical Details

- **4-stage ladder topology** - Classic Moog filter structure
- **State variable approach** - Separate input/output state for each stage
- **Coefficient calculation** - Dynamic parameter adjustment
- **Resonance scaling** - Automatic gain compensation

### Key Features

- **Traditional ladder structure** - 4 cascaded filter stages
- **State preservation** - Maintains filter state between samples
- **Dynamic coefficients** - Real-time parameter adjustment
- **Stability controls** - Automatic parameter clamping

## Implementation Notes

### Current Status

- **Stability**: Advanced parameter clamping and NaN/inf checks
- **Performance**: Optimized for real-time audio processing
- **Compatibility**: Standard interface with other filter implementations
- **Quality**: Community-refined algorithm

### Technical Implementation

- **State variables**: 8 state variables (4 input, 4 output)
- **Coefficient calculation**: Dynamic p and q coefficient computation
- **Resonance scaling**: Automatic gain compensation for stability
- **Stage processing**: Sequential processing through ladder stages

## Algorithm Details

### Coefficient Calculation

The filter uses a sophisticated coefficient calculation system:

```
f = cutoff / sampleRate
q = 1.0 - f
p = f + 0.8 * f * q
f1 = p + p - 1.0
q1 = 1.0 - p
```

### Resonance Scaling

Resonance is applied with automatic gain compensation:

```
scale = 1.0 + resonance * (1.0 - q1)
if (scale > 10.0) scale = 10.0  // Prevent excessive gain
```

### Stage Processing

Each stage processes the signal sequentially:

```
temp = input - scale * out4
out1 = temp * p + in1 * q1
in1 = temp
// Repeat for stages 2-4
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
cd public/audio/moog-filters/musicdsp
emcc -O3 -s WASM=1 musicdspFilterKernel.c -o musicdspFilterKernel.wasm --no-entry
```

## References

- MusicDSP community implementations
- Classic Moog ladder filter topology
- Digital audio processing best practices
- Community-refined filter algorithms

## Comparison with Other Filters

| Filter        | Self-Oscillation | Oversampling | Academic   | Sound Quality | Complexity |
| ------------- | ---------------- | ------------ | ---------- | ------------- | ---------- |
| **MusicDSP**  | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐     |
| RK Simulation | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐ |
| Oberheim      | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐   |
| Simplified    | ⭐⭐⭐⭐⭐       | ⭐⭐⭐       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐     |
| Huovilainen   | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐     |
| Microtracker  | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐ |
| Improved      | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐      | ⭐⭐⭐     |
| Stilson       | ⭐⭐⭐           | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐      | ⭐⭐       |

The MusicDSP filter offers a classic, community-tested approach that balances reliability with performance. It represents the collective wisdom of the digital audio processing community and provides a solid foundation for Moog filter emulation.
