# Noise Processors

This directory contains audio worklet processors for generating different types of noise, commonly used in synthesizers and audio effects.

## Noise Processor Implementations

### 1. `white-noise-processor.js`

**Purpose**: Generate white noise with uniform frequency distribution

- **Characteristics**: Equal power across all frequencies
- **Use Case**: General noise generation, wind effects, percussion
- **Implementation**: Simple random number generation
- **Output**: Unfiltered white noise

### 2. `pink-noise-processor.js`

**Purpose**: Generate pink noise with 1/f frequency distribution

- **Characteristics**: Equal power per octave (decreasing power with frequency)
- **Use Case**: Natural noise simulation, testing, background ambience
- **Implementation**: Filtered white noise using multiple poles
- **Output**: Natural-sounding noise similar to ocean waves, rain, etc.

## Usage

### Loading and using noise processors:

```typescript
// Load white noise processor
await audioContext.audioWorklet.addModule(
  "/noise-processors/white-noise-processor.js"
);
const whiteNoise = new AudioWorkletNode(audioContext, "white-noise-processor", {
  numberOfInputs: 0,
  numberOfOutputs: 1,
  outputChannelCount: [1],
});

// Load pink noise processor
await audioContext.audioWorklet.addModule(
  "/noise-processors/pink-noise-processor.js"
);
const pinkNoise = new AudioWorkletNode(audioContext, "pink-noise-processor", {
  numberOfInputs: 0,
  numberOfOutputs: 1,
  outputChannelCount: [1],
});

// Connect to audio graph
whiteNoise.connect(filterNode);
pinkNoise.connect(mixerNode);
```

## Technical Details

### White Noise

- **Frequency Response**: Flat (equal power at all frequencies)
- **Perception**: Harsh, bright sound
- **Applications**: Percussion, effects, testing

### Pink Noise

- **Frequency Response**: -3dB per octave (1/f spectrum)
- **Perception**: Natural, warm sound
- **Applications**: Natural ambience, testing, background noise

## Integration with Minimoog

These noise processors are typically used in the Minimoog's noise section:

- **White noise** for bright, percussive sounds
- **Pink noise** for natural, warm textures
- Both can be filtered through the Moog ladder filter
- Often used with envelope modulation for realistic sounds

## Performance Notes

- Both processors are lightweight and efficient
- Generate noise in real-time without pre-computed buffers
- Use AudioWorkletProcessor for non-blocking operation
- Minimal CPU usage compared to complex synthesis

## Future Enhancements

- Add brown noise (1/f² spectrum)
- Add blue noise (increasing power with frequency)
- Add parameter controls for noise characteristics
- Add modulation capabilities for dynamic noise
