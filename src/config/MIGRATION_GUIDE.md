# Configuration Migration Guide

This guide helps you migrate from hard-coded values to the new centralized configuration system.

## Overview

The new configuration system centralizes all hard-coded values into organized, environment-aware constants. This improves maintainability, enables environment-specific tuning, and provides better type safety.

## Quick Start

### 1. Import Configuration

```typescript
// Import specific constants
import { AUDIO, MIDI, SYNTH_PARAMS } from "@/config";

// Import utility functions
import { getAudioConfig, clampParameter, getSynthParamValue } from "@/config";

// Import everything
import config from "@/config";
```

### 2. Replace Hard-coded Values

#### Before (Hard-coded)

```typescript
const sampleRate = 44100;
const fftSize = 256;
const a4Frequency = 440;
const maxVolume = 10;
```

#### After (Configuration-based)

```typescript
import { AUDIO, MIDI, SYNTH_PARAMS } from "@/config";

const sampleRate = AUDIO.DEFAULT_SAMPLE_RATE;
const fftSize = AUDIO.DEFAULT_FFT_SIZE;
const a4Frequency = MIDI.A4_FREQUENCY;
const maxVolume = SYNTH_PARAMS.VOLUME.MAX;
```

### 3. Use Environment-aware Configuration

```typescript
import { getAudioConfig, getEnvConfig } from "@/config";

// Get environment-specific audio settings
const audioConfig = getAudioConfig();
const envConfig = getEnvConfig();

// Use in your code
const analyzer = audioContext.createAnalyser();
analyzer.fftSize = audioConfig.FFT_SIZE;
```

## Migration Patterns

### Audio Constants

| Old Pattern | New Pattern                         |
| ----------- | ----------------------------------- |
| `44100`     | `AUDIO.DEFAULT_SAMPLE_RATE`         |
| `256`       | `AUDIO.DEFAULT_FFT_SIZE`            |
| `128`       | `AUDIO.DEFAULT_FREQUENCY_BIN_COUNT` |
| `2048`      | `AUDIO.TEST_FFT_SIZE`               |
| `1024`      | `AUDIO.TEST_FREQUENCY_BIN_COUNT`    |

### MIDI Constants

| Old Pattern        | New Pattern         |
| ------------------ | ------------------- |
| `440`              | `MIDI.A4_FREQUENCY` |
| `69`               | `MIDI.A4_MIDI_NOTE` |
| `["C", "C#", ...]` | `MIDI.NOTE_NAMES`   |

### Synth Parameters

| Old Pattern    | New Pattern                        |
| -------------- | ---------------------------------- |
| `0-10` ranges  | `SYNTH_PARAMS.VOLUME.MIN/MAX`      |
| `0-100` ranges | `SYNTH_PARAMS.PITCH_WHEEL.MIN/MAX` |
| Default values | `SYNTH_PARAMS.*.DEFAULT`           |

### Filter Parameters

| Old Pattern | New Pattern                               |
| ----------- | ----------------------------------------- |
| `20-12000`  | `FILTER_MAPPING.CUTOFF.MIN_FREQ/MAX_FREQ` |
| `-4 to 4`   | `SYNTH_PARAMS.FILTER.CUTOFF.MIN/MAX`      |

## Utility Functions

### Parameter Clamping

```typescript
// Before
const clampedValue = Math.max(0, Math.min(10, value));

// After
import { clampParameter, SYNTH_PARAMS } from "@/config";
const clampedValue = clampParameter(
  value,
  SYNTH_PARAMS.VOLUME.MIN,
  SYNTH_PARAMS.VOLUME.MAX
);
```

### Synth Parameter Validation

```typescript
// Before
const volume = Math.max(0, Math.min(10, userVolume));

// After
import { getSynthParamValue } from "@/config";
const volume = getSynthParamValue("VOLUME", userVolume);
```

### Feature Flags

```typescript
// Before
const enableOversampling = true; // hard-coded

// After
import { isFeatureEnabled } from "@/config";
const enableOversampling = isFeatureEnabled("AUDIO.ENABLE_OVERSAMPLING");
```

## Environment-specific Configuration

The configuration system automatically adapts to different environments:

- **Development**: Enhanced debugging, performance monitoring
- **Production**: Optimized for performance, minimal logging
- **Test**: Test-specific audio settings

```typescript
import { getEnvConfig } from "@/config";

const envConfig = getEnvConfig();
if (envConfig.PERFORMANCE.ENABLE_DEBUG_LOGGING) {
  console.log("Debug info");
}
```

## Audio Worklet Processors

For audio worklet processors in the `public/` directory, you'll need to copy the relevant constants:

```javascript
// In your audio worklet processor
const AUDIO_CONSTANTS = {
  DEFAULT_SAMPLE_RATE: 44100,
  DEFAULT_FFT_SIZE: 256,
  // ... other constants
};

class MyProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.sampleRate = sampleRate;
    this.fftSize = AUDIO_CONSTANTS.DEFAULT_FFT_SIZE;
  }
}
```

## Testing

When writing tests, use the test-specific configuration:

```typescript
import { getAudioConfig } from "@/config";

describe("Audio tests", () => {
  it("should use test audio settings", () => {
    const audioConfig = getAudioConfig();
    expect(audioConfig.FFT_SIZE).toBe(2048); // Test environment uses larger FFT
  });
});
```

## Performance Considerations

- Configuration objects are frozen (`as const`) for better performance
- Utility functions are optimized for common use cases
- Environment detection happens once at module load time

## Type Safety

All configuration objects are fully typed. Use TypeScript to get autocomplete and type checking:

```typescript
import { SYNTH_PARAMS } from "@/config";

// TypeScript will ensure this is valid
const volume: number = SYNTH_PARAMS.VOLUME.DEFAULT;
```

## Common Migration Examples

### 1. External Input Hook

```typescript
// Before
analyzer.fftSize = 256;
const normalizedLevel = Math.min(1, average / 50);

// After
import { AUDIO, EXTERNAL_INPUT } from "@/config";
analyzer.fftSize = AUDIO.EXTERNAL_INPUT_FFT_SIZE;
const normalizedLevel = Math.min(
  1,
  average / EXTERNAL_INPUT.LEVEL_MONITORING.NORMALIZATION_FACTOR
);
```

### 2. Filter Mapping

```typescript
// Before
const minFreq = 20;
const maxFreq = 12000;
const musicalCurve = Math.pow(normalizedVal, 1.2);

// After
import { FILTER_MAPPING } from "@/config";
const minFreq = FILTER_MAPPING.CUTOFF.MIN_FREQ;
const maxFreq = FILTER_MAPPING.CUTOFF.MAX_FREQ;
const musicalCurve = Math.pow(
  normalizedVal,
  FILTER_MAPPING.CUTOFF.MUSICAL_CURVE_POWER
);
```

### 3. Envelope Mapping

```typescript
// Before
const attackDecayStops = [
  { pos: 0, value: 0 },
  { pos: 1000, value: 10 },
  // ...
];

// After
import { ENVELOPE_MAPPING } from "@/config";
const attackDecayStops = ENVELOPE_MAPPING.ATTACK_DECAY_STOPS;
```

## Next Steps

1. Start with audio-related constants (most critical for performance)
2. Migrate MIDI and frequency constants
3. Update synth parameter ranges
4. Replace UI constants
5. Add feature flags where appropriate
6. Update tests to use configuration

## Support

If you encounter issues during migration:

1. Check the configuration constants file for available options
2. Use TypeScript to ensure type safety
3. Test in different environments (dev, test, prod)
4. Verify audio performance after changes
