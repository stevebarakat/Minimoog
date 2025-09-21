# Microtracker Moog Filter

## Overview

The Microtracker Moog filter is a clean, efficient implementation based on Magnus Jonsson's work. This filter uses optimized coefficients derived through differential evolution to provide excellent stability and musical quality.

## Files

- `microtrackerFilterKernel.c` - C source code for the filter algorithm
- `microtrackerFilterKernel.wasm` - Compiled WebAssembly binary
- `microtracker-worklet-processor.js` - AudioWorklet processor for Web Audio API integration

## Characteristics

### Advantages

- **Excellent stability** - Optimized coefficients prevent runaway oscillation
- **Clean implementation** - Simple, straightforward algorithm without complex stability patches
- **Musical quality** - Maintains the characteristic Moog sound
- **Efficient processing** - Fast tanh approximation and optimized math

### Technical Details

- **4-pole ladder structure** - Classic Moog filter topology
- **Optimized coefficients** - Derived through differential evolution for stability
- **Fast tanh approximation** - Efficient nonlinearity without expensive math functions
- **Direct coefficient calculation** - Simple cutoff frequency to coefficient mapping

### Key Features

- **Resonance feedback gain 4.0** - Corresponds closely to the border of instability
- **Optimized output coefficients** - `[0.360891, 0.417290, 0.177896, 0.0439725]`
- **Fast tanh approximation** - `x * (27 + x²) / (27 + 9x²)` for efficiency
- **Simple cutoff mapping** - `cutoff = frequency * 2π / sampleRate`

## Usage

The filter is integrated into the Minimoog synthesizer and can be selected via the "Filter Type" dropdown. It provides the same interface as other filter implementations:

- Cutoff frequency control
- Resonance/emphasis control
- Filter envelope modulation
- Real-time parameter changes

## Compilation

To recompile the WASM module:

```bash
cd public/audio/moog-filters/microtracker
emcc -O3 -s WASM=1 microtrackerFilterKernel.c -o microtrackerFilterKernel.wasm --no-entry
```

## References

- Jonsson, M. (2023). "microtracker" - https://github.com/magnusjonsson/microtracker
- Optimized coefficients derived through differential evolution
- Fast tanh approximation for efficient nonlinearity

## Comparison with Other Filters

| Filter           | Stability  | Sound Quality | Parameter Range | Oversampling | Complexity |
| ---------------- | ---------- | ------------- | --------------- | ------------ | ---------- |
| **Microtracker** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐      | None         | ⭐⭐⭐⭐⭐ |
| Huovilainen      | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐      | 2x           | ⭐⭐⭐     |
| Improved         | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐      | ⭐⭐⭐⭐        | None         | ⭐⭐⭐     |
| Stilson          | ⭐⭐⭐     | ⭐⭐⭐⭐      | ⭐⭐⭐⭐        | None         | ⭐⭐       |

The Microtracker filter offers the best balance of stability, sound quality, and simplicity. It's designed to be production-ready with minimal complexity and maximum reliability.
