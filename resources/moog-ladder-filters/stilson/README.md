# Stilson Filter Implementation

This directory contains the Stilson filter implementation for the Minimoog synthesizer.

## Overview

The Stilson filter is based on Tim Stilson's analysis of the Moog VCF with compromise poles at z = -0.3. This implementation provides better decoupling of cutoff and resonance controls compared to the bilinear transform, while maintaining stability and musical quality.

## Files

- `stilson-worklet-processor.js` - AudioWorklet processor for the Stilson filter
- `stilsonFilterKernel.c` - C source code for the filter algorithm
- `stilsonFilterKernel.wasm` - Compiled WebAssembly bytecode

## Characteristics

### Advantages

- **Better Parameter Decoupling**: Cutoff and resonance controls are more independent
- **Stability**: Maintains stability across a wider frequency range
- **Musical Quality**: Preserves the musical character of the Moog filter
- **Efficiency**: Optimized implementation with minimal computational overhead

### Technical Details

- **Filter Type**: 4-pole lowpass ladder filter
- **Pole Placement**: Compromise poles at z = -0.3 for optimal decoupling
- **Oversampling**: No oversampling required (unlike Huovilainen)
- **Nonlinearity**: Subtle saturation for authentic character
- **Envelope Support**: Full ADSR envelope integration

## Usage

The filter can be selected via the Filter Type dropdown in the synthesizer interface. It provides an alternative to the Huovilainen filter with different sonic characteristics.

## Compilation

To rebuild the WASM module:

```bash
emcc -O3 -s WASM=1 stilsonFilterKernel.c -o stilsonFilterKernel.wasm --no-entry
```

## References

- Stilson, T., & Smith, J. O. (1996). "Analyzing the Moog VCF with Considerations for Digital Implementation"
- Based on research into digital filter design and Moog VCF characteristics
