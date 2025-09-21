# Simplified Moog Filter

## Overview

The Simplified Moog filter is based on the DAFX book 2nd edition implementation by Valimaki, Bilbao, Smith, Abel, Pakarinen, and Berners. This model maintains the ability to self-oscillate while providing a cleaner, more manageable implementation.

## Files

- `simplifiedFilterKernel.c` - C source code for the filter algorithm
- `simplifiedFilterKernel.wasm` - Compiled WebAssembly binary
- `simplified-worklet-processor.js` - AudioWorklet processor for Web Audio API integration

## Characteristics

### Advantages

- **Self-oscillation capability** - Can oscillate when feedback gain >= 1.0
- **Academic pedigree** - Based on DAFX book and peer-reviewed research
- **Clean implementation** - Well-structured, understandable code
- **Musical quality** - Maintains characteristic Moog sound

### Technical Details

- **5 nonlinear functions** - 4 first-order sections + feedback loop
- **Tanh saturation** - Uses tanh for nonlinearity in each stage
- **Gain compensation** - 0.5 compensation factor for consistent levels
- **Oversampling ready** - Designed for 2x oversampling (currently 1x)

### Key Features

- **Resonance feedback gain 4.0** - Standard Moog feedback amount
- **Gain compensation** - Prevents excessive level changes at high resonance
- **Stage-by-stage processing** - Clear ladder structure implementation
- **Fast tanh approximation** - Efficient nonlinearity calculation

## Implementation Notes

### Current Status

- **Oversampling**: Currently implemented at 1x (not 2x as designed)
- **Stability**: Basic clamping added for production use
- **Performance**: Optimized for real-time audio processing

### Future Enhancements

- **2x oversampling** - For better anti-aliasing
- **Polynomial interpolation** - For smoother oversampling
- **Decimation filter** - To return to original sample rate

## Usage

The filter is integrated into the Minimoog synthesizer and can be selected via the "Filter Type" dropdown. It provides the same interface as other filter implementations:

- Cutoff frequency control
- Resonance/emphasis control
- Filter envelope modulation
- Real-time parameter changes

## Compilation

To recompile the WASM module:

```bash
cd public/audio/moog-filters/simplified
emcc -O3 -s WASM=1 simplifiedFilterKernel.c -o simplifiedFilterKernel.wasm --no-entry
```

## References

- DAFX - Zolzer (ed) (2nd ed), Wiley & Sons 2011
- Valimaki, Bilbao, Smith, Abel, Pakarinen, Berners (DAFX)
- Original MATLAB source: moogvcf.m
- Oversampling considerations from music-dsp mailing list

## Comparison with Other Filters

| Filter         | Self-Oscillation | Oversampling | Academic   | Sound Quality | Complexity |
| -------------- | ---------------- | ------------ | ---------- | ------------- | ---------- |
| **Simplified** | ⭐⭐⭐⭐⭐       | ⭐⭐⭐       | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐     |
| Huovilainen    | ⭐⭐⭐⭐⭐       | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐    | ⭐⭐⭐     |
| Microtracker   | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐    | ⭐⭐⭐⭐⭐ |
| Improved       | ⭐⭐⭐⭐         | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐      | ⭐⭐⭐     |
| Stilson        | ⭐⭐⭐           | ⭐⭐⭐⭐⭐   | ⭐⭐⭐⭐   | ⭐⭐⭐⭐      | ⭐⭐       |

The Simplified filter offers excellent self-oscillation capability and academic rigor, making it ideal for research and musical experimentation.
