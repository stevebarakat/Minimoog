# Moog Filter Processors

This directory contains three different implementations of the Moog ladder filter, each optimized for different use cases.

## Filter Implementations

### 1. `moog-authentic-processor.js` ⭐ (Recommended for Authentic Sound)

**Purpose**: Authentic Minimoog character and vintage sound

- **Approach**: Classic 4-pole ladder filter with authentic saturation and analog characteristics
- **Use Case**: When you want the original Minimoog character and warm sound
- **Pros**: Authentic vintage sound, transistor-like saturation, analog characteristics, proper emphasis curve
- **Cons**: Higher CPU usage due to oversampling and analog simulation

**Key Authentic Features:**

- **Original frequency range**: 10Hz-32kHz (matches original Minimoog)
- **Transistor-like saturation**: More authentic to original circuit design
- **Analog characteristics**: Thermal noise, temperature drift, component tolerances
- **Authentic emphasis curve**: Non-linear resonance mapping matching original behavior
- **4x oversampling**: Better audio quality and reduced aliasing
- **Self-oscillation**: Full 4.0 resonance for complete self-oscillation

### 2. `moog-zdf-processor.js`

**Purpose**: Mathematical accuracy and stability

- **Approach**: Zero Delay Feedback with bilinear transform
- **Use Case**: When you need maximum accuracy and stability
- **Pros**: Mathematically accurate, stable at high resonance, oversampling
- **Cons**: More complex, may lack some vintage character

### 3. `moog-hybrid-processor.js`

**Purpose**: Best of both worlds - accuracy + character

- **Approach**: ZDF foundation with authentic saturation and optimizations
- **Use Case**: General purpose, balanced approach
- **Pros**: Authentic character, mathematical accuracy, optimized performance
- **Cons**: Slightly more complex than authentic

## Performance Comparison

| Filter    | CPU Usage | Character | Accuracy | Stability | Authenticity  |
| --------- | --------- | --------- | -------- | --------- | ------------- |
| Authentic | Medium    | High      | High     | High      | **Excellent** |
| ZDF       | High      | Medium    | High     | High      | Medium        |
| Hybrid    | Medium    | High      | High     | High      | High          |

## Usage

### Switch between filters in `useAudioNodeCreation.ts`:

```typescript
// For Authentic Minimoog character (Recommended)
await audioContext.audioWorklet.addModule("/moog-filters/moog-authentic-processor.js");
const moogFilter = new AudioWorkletNode(audioContext, "moog-authentic-processor", {...});

// For ZDF accuracy
await audioContext.audioWorklet.addModule("/moog-filters/moog-zdf-processor.js");
const moogFilter = new AudioWorkletNode(audioContext, "moog-zdf-processor", {...});

// For Hybrid approach
await audioContext.audioWorklet.addModule("/moog-filters/moog-hybrid-processor.js");
const moogFilter = new AudioWorkletNode(audioContext, "moog-hybrid-processor", {...});
```

## Authentic Minimoog Characteristics

The authentic processor now includes:

### 1. Transistor-like Saturation

- **Linear region**: 0-0.3 (clean signal)
- **Transition region**: 0.3-0.8 (slight compression)
- **Hard clipping**: 0.8+ (aggressive saturation)

### 2. Analog Characteristics

- **Thermal noise**: Subtle random variations
- **Temperature drift**: Simulates component heating/cooling
- **Component tolerances**: Realistic manufacturing variations

### 3. Authentic Emphasis Curve

- **0-6**: Linear mapping (0-2.0 resonance)
- **6-8.5**: Curved mapping (2.0-3.2 resonance)
- **8.5-10**: Self-oscillation (3.2-4.0 resonance)

### 4. Original Frequency Range

- **10Hz-32kHz**: Matches original Minimoog specifications
- **24dB/octave**: Classic Moog ladder filter slope

## Musical Benefits

### 1. Warmer Sound

The enhanced saturation and analog characteristics create a warmer, more musical sound that's closer to the original Minimoog's character.

### 2. Better Bass Response

The practical low-frequency range (down to 10Hz) provides excellent bass response, especially important for classic Minimoog bass sounds.

### 3. More Natural Resonance

The non-linear resonance curve provides more musical control over the filter's emphasis, with better behavior in the self-oscillation range.

### 4. Authentic Self-Oscillation

Full self-oscillation capability allows the filter to be used as a pure sine wave oscillator, just like the original.

### 5. Organic Feel

The analog characteristics add subtle variations that make the sound less "perfect" and more organic, similar to real analog hardware.
