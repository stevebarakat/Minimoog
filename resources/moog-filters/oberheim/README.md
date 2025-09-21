# Oberheim Variation Moog Filter

## Overview

The Oberheim Variation Moog filter is based on Will Pirkle's virtual analog approach, using 4 cascaded one-pole filters with sophisticated feedback mechanisms. This implementation provides a unique take on the classic Moog sound with enhanced stability and musicality.

## Files

- `oberheimFilterKernel.c` - C source code for the filter algorithm
- `oberheimFilterKernel.wasm` - Compiled WebAssembly binary
- `oberheim-worklet-processor.js` - AudioWorklet processor for Web Audio API integration

## Characteristics

### Advantages

- **Virtual analog approach** - Uses sophisticated one-pole filter structures
- **Enhanced stability** - Advanced feedback calculations prevent oscillation
- **Musical resonance** - Q-based resonance control with automatic K calculation
- **Professional pedigree** - Based on Will Pirkle's research and implementations

### Technical Details

- **4 cascaded one-pole filters** - Each with independent coefficient control
- **Advanced feedback system** - Sigma calculation with saturation
- **Q-based resonance** - Automatic K coefficient calculation
- **Frequency-dependent stability** - Alpha clamping based on cutoff frequency

### Key Features

- **Virtual analog one-pole structure** - Sophisticated filter topology
- **Automatic coefficient calculation** - K = Q \* (4 - 3α) / (1 - α)
- **Saturation control** - Configurable tanh saturation
- **Frequency range** - 20Hz to 20kHz with automatic clamping

## Implementation Notes

### Current Status

- **Stability**: Advanced frequency-dependent stability controls
- **Performance**: Optimized for real-time audio processing
- **Musicality**: Q-based resonance with automatic coefficient adjustment

### Technical Implementation

- **One-pole filters**: Each stage uses VAOnePole structure
- **Feedback calculation**: Sigma sum from all filter stages
- **Coefficient management**: Alpha, beta, gamma, delta, epsilon parameters
- **Saturation**: Fast tanh approximation with configurable intensity

## Usage

The filter is integrated into the Minimoog synthesizer and can be selected via the "Filter Type" dropdown. It provides the same interface as other filter implementations:

- Cutoff frequency control (20Hz - 20kHz)
- Resonance/emphasis control with Q-based calculation
- Filter envelope modulation
- Real-time parameter changes

## Compilation

To recompile the WASM module:

```bash
cd public/audio/moog-filters/oberheim
emcc -O3 -s WASM=1 oberheimFilterKernel.c -o oberheimFilterKernel.wasm --no-entry
```

## References

- Will Pirkle's Virtual Analog research and implementations
- Professional audio plugin development techniques
- Advanced digital filter design principles
- Virtual analog synthesis methodologies

## Comparison with Other Filters

| Filter       | Self-Oscillation | Oversampling | Academic   | Sound Quality | Complexity |
| ------------ | ---------------- | ------------ | ---------- | ------------- | ---------- |
| **Oberheim** | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐   |
| Simplified   | ⭐⭐⭐⭐⭐       | ⭐⭐⭐       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐     |
| Huovilainen  | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐     |
| Microtracker | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐ |
| Improved     | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐      | ⭐⭐⭐     |
| Stilson      | ⭐⭐⭐           | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐      | ⭐⭐       |

The Oberheim Variation filter offers a sophisticated virtual analog approach with enhanced stability and professional-grade sound quality, making it ideal for production work and advanced sound design.
