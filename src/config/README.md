# Configuration System

This directory contains the centralized configuration system for the Minimoog synthesizer application. It replaces hard-coded values scattered throughout the codebase with organized, environment-aware constants.

## Overview

The configuration system provides:

- **Centralized Constants**: All hard-coded values in one place
- **Environment Awareness**: Different settings for dev/test/prod
- **Type Safety**: Full TypeScript support with autocomplete
- **Performance Optimization**: Frozen objects and optimized utilities
- **Feature Flags**: Easy feature toggling
- **Maintainability**: Single source of truth for all constants

## Structure

```
src/config/
├── constants.ts      # All constant definitions
├── index.ts         # Configuration utilities and exports
├── MIGRATION_GUIDE.md # How to migrate existing code
└── README.md        # This file
```

## Quick Start

### Import Configuration

```typescript
// Import specific constants
import { AUDIO, MIDI, SYNTH_PARAMS } from "@/config";

// Import utility functions
import { getAudioConfig, clampParameter } from "@/config";

// Import everything
import config from "@/config";
```

### Use Constants

```typescript
// Instead of hard-coded values
const sampleRate = 44100;
const fftSize = 256;
const a4Frequency = 440;

// Use configuration
const sampleRate = AUDIO.DEFAULT_SAMPLE_RATE;
const fftSize = AUDIO.DEFAULT_FFT_SIZE;
const a4Frequency = MIDI.A4_FREQUENCY;
```

### Environment-specific Configuration

```typescript
import { getEnvConfig, getAudioConfig } from "@/config";

// Get environment-specific settings
const envConfig = getEnvConfig();
const audioConfig = getAudioConfig();

// Use in your code
if (envConfig.PERFORMANCE.ENABLE_DEBUG_LOGGING) {
  console.log("Debug info");
}
```

## Configuration Categories

### Audio Constants (`AUDIO`)

Audio-related parameters including sample rates, buffer sizes, and processor settings.

```typescript
AUDIO = {
  DEFAULT_SAMPLE_RATE: 44100,
  DEFAULT_FFT_SIZE: 256,
  DEFAULT_FREQUENCY_BIN_COUNT: 128,
  TEST_FFT_SIZE: 2048,
  TEST_FREQUENCY_BIN_COUNT: 1024,
  DELAY: {
    /* delay processor settings */
  },
  MOOG_FILTER: {
    /* filter settings */
  },
  PINK_NOISE: {
    /* noise filter coefficients */
  },
};
```

### MIDI Constants (`MIDI`)

MIDI and frequency-related constants.

```typescript
MIDI = {
  A4_FREQUENCY: 440,
  A4_MIDI_NOTE: 69,
  NOTE_NAMES: ["C", "C#", "D", ...],
  OCTAVE_RANGES: { "32": 32, "16": 16, ... },
  MIN_FREQUENCY: 20,
  MAX_FREQUENCY: 20000
}
```

### Synth Parameters (`SYNTH_PARAMS`)

Parameter ranges and defaults for synthesizer controls.

```typescript
SYNTH_PARAMS = {
  VOLUME: { MIN: 0, MAX: 10, DEFAULT: 5 },
  PITCH_WHEEL: { MIN: 0, MAX: 100, DEFAULT: 50 },
  FILTER: {
    /* filter parameter ranges */
  },
  LOUDNESS: {
    /* envelope ranges */
  },
  // ... more parameter groups
};
```

### UI Constants (`UI`)

User interface constants and styling values.

```typescript
UI = {
  ANIMATION_FRAME_DELAY: 16,
  EXTERNAL_INPUT: {
    /* UI positioning */
  },
  TUNER: { A440_LABEL: "A-440" },
};
```

### Feature Flags (`FEATURES`)

Feature toggles for different functionality.

```typescript
FEATURES = {
  AUDIO: {
    ENABLE_OVERSAMPLING: true,
    ENABLE_ANALOG_CHARACTERISTICS: true,
  },
  UI: {
    ENABLE_ANIMATIONS: true,
    ENABLE_TOOLTIPS: true,
  },
  PERFORMANCE: {
    ENABLE_MEMOIZATION: true,
    ENABLE_AUDIO_NODE_POOLING: true,
  },
};
```

### Performance Settings (`PERFORMANCE`)

Performance tuning parameters.

```typescript
PERFORMANCE = {
  AUDIO: {
    MAX_CONCURRENT_OSCILLATORS: 32,
    BUFFER_POOL_SIZE: 16,
  },
  UI: {
    DEBOUNCE_DELAY: 16,
    THROTTLE_DELAY: 100,
  },
  MEMORY: {
    MAX_CACHED_WAVEFORMS: 50,
    GARBAGE_COLLECTION_THRESHOLD: 1000,
  },
};
```

## Utility Functions

### Parameter Management

```typescript
// Clamp a value within a range
const clampedValue = clampParameter(value, min, max);

// Get synth parameter with validation
const volume = getSynthParamValue("VOLUME", userVolume);

// Get default parameter value
const defaultVolume = getSynthParamDefault("VOLUME");
```

### Feature Flags

```typescript
// Check if a feature is enabled
const enableOversampling = isFeatureEnabled("AUDIO.ENABLE_OVERSAMPLING");
```

### Audio Configuration

```typescript
// Get audio context configuration
const audioContextConfig = getAudioContextConfig();

// Get analyzer configuration
const analyzerConfig = getAnalyzerConfig();

// Get external input analyzer configuration
const externalInputConfig = getExternalInputAnalyzerConfig();
```

### MIDI Utilities

```typescript
// Convert MIDI note to frequency
const frequency = midiNoteToFrequency(69); // A4

// Convert frequency to MIDI note
const midiNote = frequencyToMidiNote(440); // A4

// Get octave range multiplier
const multiplier = getOctaveRangeMultiplier("8"); // 1
```

## Environment Configuration

The system automatically adapts to different environments:

### Development

- Enhanced debugging and logging
- Performance monitoring enabled
- Larger FFT sizes for testing

### Production

- Optimized for performance
- Minimal logging
- Standard audio settings

### Test

- Test-specific audio settings
- Larger FFT sizes for accuracy
- Disabled performance monitoring

## Migration Status

### Completed Migrations

- ✅ External Input Hook (`useExternalInput.ts`)
- ✅ Knob Mapping Utilities (`knobMappingUtils.ts`)
- ✅ Parameter Mapping Utilities (`paramMappingUtils.ts`)
- ✅ Frequency Utilities (`frequencyUtils.ts`, `noteToFrequency.ts`)
- ✅ Oscillator Audio Files (`baseOscillator.ts`, `oscillator1.ts`)
- ✅ Tuner Component (`Tuner.tsx`, `useTuner.ts`)
- ✅ External Input Component (`ExternalInput.tsx`)
- ✅ Initial State (`initialState.ts`)
- ✅ Audio Hooks (`useAudio.ts`, `useModulation.ts`)
- ✅ Oscillator Calculations (`useMemoizedCalculations.ts`)
- ✅ Audio Worklet Processors (`public/*.js`)
- ✅ Test Setup (`test/setup.ts`)
- ✅ External Input Tests (`useExternalInput.test.ts`)

### Pending Migrations

- 🔄 Preset Data (`presets.ts`)
- 🔄 Remaining Test Files (`**/*.test.ts`)
- 🔄 Remaining Components

## Best Practices

### 1. Use Configuration Constants

```typescript
// ❌ Don't use hard-coded values
const sampleRate = 44100;

// ✅ Use configuration constants
const sampleRate = AUDIO.DEFAULT_SAMPLE_RATE;
```

### 2. Use Utility Functions

```typescript
// ❌ Manual parameter validation
const volume = Math.max(0, Math.min(10, userVolume));

// ✅ Use utility functions
const volume = getSynthParamValue("VOLUME", userVolume);
```

### 3. Check Feature Flags

```typescript
// ❌ Hard-coded feature toggles
const enableOversampling = true;

// ✅ Use feature flags
const enableOversampling = isFeatureEnabled("AUDIO.ENABLE_OVERSAMPLING");
```

### 4. Environment-aware Configuration

```typescript
// ❌ Environment-specific hard-coding
if (process.env.NODE_ENV === "development") {
  console.log("Debug info");
}

// ✅ Use configuration system
const envConfig = getEnvConfig();
if (envConfig.PERFORMANCE.ENABLE_DEBUG_LOGGING) {
  console.log("Debug info");
}
```

## Performance Considerations

- Configuration objects are frozen (`as const`) for better performance
- Environment detection happens once at module load time
- Utility functions are optimized for common use cases
- No runtime overhead for constant access

## Type Safety

All configuration objects are fully typed with TypeScript:

```typescript
// TypeScript ensures type safety
const volume: number = SYNTH_PARAMS.VOLUME.DEFAULT;
const noteNames: readonly string[] = MIDI.NOTE_NAMES;
```

## Contributing

When adding new constants:

1. Add them to the appropriate category in `constants.ts`
2. Use `as const` for immutable objects
3. Add TypeScript types where needed
4. Update this README if adding new categories
5. Add utility functions in `index.ts` if needed
6. Update the migration guide for new patterns

## Support

For questions or issues:

1. Check the migration guide for common patterns
2. Use TypeScript for type safety
3. Test in different environments
4. Verify audio performance after changes
