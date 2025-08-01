# Moog Filter Processors

This directory contains three different implementations of the Moog ladder filter, each optimized for different use cases.

## Filter Implementations

### 1. `moog-authentic-processor.js`

**Purpose**: Authentic Minimoog character and vintage sound

- **Approach**: Classic 4-pole ladder filter with authentic saturation
- **Use Case**: When you want the original Minimoog character
- **Pros**: Authentic vintage sound, simple implementation
- **Cons**: Limited mathematical accuracy, no oversampling

### 2. `moog-zdf-processor.js`

**Purpose**: Mathematical accuracy and stability

- **Approach**: Zero Delay Feedback with bilinear transform
- **Use Case**: When you need maximum accuracy and stability
- **Pros**: Mathematically accurate, stable at high resonance, oversampling
- **Cons**: More complex, may lack some vintage character

### 3. `moog-hybrid-processor.js` ⭐ (Recommended)

**Purpose**: Best of both worlds - accuracy + character

- **Approach**: ZDF foundation with authentic saturation and optimizations
- **Use Case**: General purpose, balanced approach
- **Pros**: Authentic character, mathematical accuracy, optimized performance
- **Cons**: Slightly more complex than authentic

## Performance Comparison

| Filter    | CPU Usage | Character | Accuracy | Stability |
| --------- | --------- | --------- | -------- | --------- |
| Authentic | Low       | High      | Medium   | Medium    |
| ZDF       | High      | Medium    | High     | High      |
| Hybrid    | Medium    | High      | High     | High      |

## Usage

### Switch between filters in `useAudioNodeCreation.ts`:

```typescript
// For Authentic character
await audioContext.audioWorklet.addModule("/moog-filters/moog-authentic-processor.js");
const moogFilter = new AudioWorkletNode(audioContext, "moog-authentic-processor", {...});

// For ZDF accuracy
await audioContext.audioWorklet.addModule("/moog-filters/moog-zdf-processor.js");
const moogFilter = new AudioWorkletNode(audioContext, "moog-zdf-processor", {...});

// For Hybrid (recommended)
await audioContext.audioWorklet.addModule("/moog-filters/moog-hybrid-processor.js");
const moogFilter = new AudioWorkletNode(audioContext, "moog-hybrid-processor", {...});
```

## Development Notes

- **Hybrid processor** includes performance optimizations (caching, vector processing, lookup tables)
- **All processors** use modern AudioWorkletProcessor (non-blocking)
- **Fallback mechanisms** ensure stability even under extreme conditions
- **Performance monitoring** built into hybrid processor for optimization tracking

## Future Enhancements

- Add parameter to switch between filter types at runtime
- Implement filter comparison tools
- Add more saturation algorithms from Tuna.js
- Consider WebAssembly for even better performance
