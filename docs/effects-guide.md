# Effects Guide

The Minimoog app includes two professional-grade effects using native Web Audio API that can be accessed via the Effects dropdown.

## Effects

### Delay

Digital delay with echo and feedback using custom AudioWorklet processor.

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
