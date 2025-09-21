# Effects Guide

The Minimoog emulator includes two professional-grade effects using native Web Audio API that can be accessed via the Effects dropdown.

## Available Effects

### Delay

Professional digital delay with echo and feedback using custom AudioWorklet processor.

**Controls:**

- **Mix**: Dry/Wet balance (0-10)
- **Time**: Delay time in milliseconds (20ms - 1000ms)
- **Feedback**: Echo repetition amount (0-90%)

### Reverb

High-quality convolution reverb for spatial ambience using native ConvolverNode.

**Controls:**

- **Mix**: Reverb mix level (0-10)
- **Impulse Response**: Uses authentic acoustic space simulation

## Usage

1. Click the **Effects** button to open the dropdown
2. Select an effect to open its control panel
3. Use the **On/Off** switch to enable the effect
4. Adjust parameters using the knobs
5. Drag panels to reposition them on screen

## Effects Output

Effects have their own output section with:

- **Volume**: Master effects level (0-10)
- **Effects**: Master on/off switch for both effects

## Technical Details

### Web Audio API Integration

- **Professional Audio Quality**: Industry-standard native audio processing algorithms
- **Optimized Performance**: Efficient real-time audio processing with minimal overhead
- **Type Safety**: Full TypeScript support with proper type definitions

### Audio Processing

- **Delay**: 20ms to 1000ms range with 0-90% feedback
- **Reverb**: Authentic impulse response convolution for realistic acoustic spaces
- **Real-time Control**: All parameters update in real-time without audio glitches
- **Efficient Routing**: Optimized audio signal path for minimal latency

## Tips

- Effects are processed after the main synthesizer signal
- Both effects can be used simultaneously
- Panel positions are automatically saved
- Effects state persists in URL sharing
- Professional-grade audio quality comparable to commercial synthesizers
