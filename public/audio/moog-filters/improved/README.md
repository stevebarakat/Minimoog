# Improved Moog Filter

## Overview

The Improved Moog filter is a stable, high-quality implementation of the classic 4-pole Moog ladder filter based on the research of Stefano D'Angelo and Vesa Valimaki. This implementation prioritizes stability and musical quality over extreme parameter ranges.

## Files

- `improvedFilterKernel.c` - C source code for the filter algorithm
- `improvedFilterKernel.wasm` - Compiled WebAssembly binary
- `improved-worklet-processor.js` - AudioWorklet processor for Web Audio API integration

## Characteristics

### Advantages

- **Excellent stability** - Designed to prevent runaway oscillation and filter explosion
- **Musical quality** - Maintains the warm, characteristic Moog sound
- **Conservative design** - Uses proven, stable coefficient calculations
- **Robust error handling** - Automatic recovery from instability conditions

### Technical Details

- **4-pole ladder structure** - Classic Moog filter topology
- **Bilinear transform** - Stable discretization method with pre-warping
- **Conservative frequency limits** - Maximum frequency at 25% of sample rate
- **Aggressive clamping** - Multiple levels of output limiting for stability
- **DC blocking** - Prevents low-frequency artifacts

### Stability Features

- Frequency coefficient limited to 0.25 × sample rate
- G coefficient clamped to 0.0 - 0.7 range
- Resonance feedback limited to ±0.3
- Stage outputs clamped to ±2.0
- Final output clamped to ±1.0
- Automatic NaN/infinity detection and recovery

## Usage

The filter is integrated into the Minimoog synthesizer and can be selected via the "Filter Type" dropdown. It provides the same interface as other filter implementations:

- Cutoff frequency control
- Resonance/emphasis control
- Filter envelope modulation
- Real-time parameter changes

## Compilation

To recompile the WASM module:

```bash
cd public/audio/moog-filters/improved
emcc -O3 -s WASM=1 improvedFilterKernel.c -o improvedFilterKernel.wasm --no-entry
```

## References

- D'Angelo, S., & Valimaki, V. (2013). "An Improved Virtual Analog Model of the Moog Ladder Filter"
- Valimaki, V., & Huovilainen, A. (2006). "Oscillator and Filter Algorithms for Virtual Analog Synthesis"

## Comparison with Other Filters

| Filter       | Stability  | Sound Quality | Parameter Range | Oversampling |
| ------------ | ---------- | ------------- | --------------- | ------------ |
| **Improved** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐        | None         |
| Huovilainen  | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐      | 2x           |
| Stilson      | ⭐⭐       | ⭐⭐⭐⭐      | ⭐⭐⭐⭐        | None         |

The Improved filter offers the best balance of stability and sound quality, making it ideal for production use where reliability is paramount.
