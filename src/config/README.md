# Configuration System

This directory contains the centralized configuration system for the Minimoog synthesizer application. It replaces hard-coded values scattered throughout the codebase with organized, environment-aware constants.

## 🗂️ Quick Overview

## 🗂️ Quick Overview

### Migration Status: Core Constants Complete ✅

The centralized configuration system has been successfully implemented with all major hard-coded values migrated to organized constants.

### Core Categories

- **Audio Constants** - Sample rates, buffer sizes, level monitoring settings
- **MIDI Constants** - Note frequencies, velocity ranges, control changes, oscillator ranges
- **Synth Parameters** - Parameter ranges and defaults for all controls
- **External Input** - External input processing parameters
- **Keyboard** - Keyboard layout and positioning constants
- **Oscillator** - Oscillator-specific parameters and ranges
- **Envelope Mapping** - Envelope parameter mappings and ranges
- **Filter Mapping** - Filter parameter mappings and ranges

### Key Files

- **`constants.ts`** - All constant definitions organized by category
- **`index.ts`** - Configuration utilities and exports

## 🚀 Quick Start

### Import Configuration

```typescript
// Import specific constants
import { AUDIO, MIDI, SYNTH_CONFIG } from "@/config";

// Import utility functions
import { isDevMode, getEnvConfig } from "@/config";

// Import multiple items
import { AUDIO, getEnvConfig, KEYBOARD } from "@/config";
```

### Use Constants

```typescript
// Instead of hard-coded values
const sampleRate = AUDIO.DEFAULT_SAMPLE_RATE;
const a4Frequency = MIDI.A4_FREQUENCY;
const maxVolume = SYNTH_CONFIG.VOLUME.max;

// Use environment configuration
const envConfig = getEnvConfig();
if (isDevMode()) {
  console.log("Development mode enabled");
}
```

### Environment Configuration

```typescript
import { getEnvConfig, isDevMode } from "@/config";

// Get environment-specific settings
const envConfig = getEnvConfig();
const isDevelopment = isDevMode();

// Use in your code
if (isDevelopment) {
  console.log("Debug info");
}
```

## 📊 Available Constants

### Audio Configuration

```typescript
AUDIO.DEFAULT_SAMPLE_RATE; // 44100 Hz
AUDIO.TEST_SAMPLE_RATE; // 44100 Hz
AUDIO.MODULATION_BUFFER_SIZE_MULTIPLIER; // 2 seconds
AUDIO.LEVEL_MONITORING.VOLUME_CURVE_POWER; // 2
AUDIO.LEVEL_MONITORING.MAX_GAIN; // 0.8
AUDIO.LEVEL_MONITORING.MIN_GAIN; // 0.2
```

### MIDI Configuration

```typescript
MIDI.A4_FREQUENCY; // 440 Hz
MIDI.A4_MIDI_NOTE; // 69
MIDI.NOTE_NAMES; // ["C", "C#", "D", ...]
MIDI.OCTAVE_RANGES; // { "32": 32, "16": 16, ... }
MIDI.OSCILLATOR_RANGE_VALUES; // ["lo", "32", "16", "8", "4", "2"]
MIDI.MIN_FREQUENCY; // 20 Hz
MIDI.MAX_FREQUENCY; // 20000 Hz
MIDI.MIN_DETUNE_SEMITONES; // -12
MIDI.MAX_DETUNE_SEMITONES; // 12
```

### Synth Configuration

```typescript
SYNTH_CONFIG.VOLUME; // { min: 0, max: 10, default: 5 }
SYNTH_CONFIG.MASTER_TUNE; // { min: -12, max: 12, default: 0 }
SYNTH_CONFIG.PITCH_WHEEL; // { min: 0, max: 100, default: 50 }
SYNTH_CONFIG.FILTER_CUTOFF; // { min: 0, max: 100, default: 50 }
SYNTH_CONFIG.FILTER_EMPHASIS; // { min: 0, max: 100, default: 0 }
```

### Keyboard Configuration

```typescript
KEYBOARD.DEFAULTS.OCTAVE_RANGE; // { min: 0, max: 3 }
KEYBOARD.DEFAULTS.EXTRA_KEYS; // 8
KEYBOARD.DEFAULTS.STARTING_OCTAVE; // 2
```

## 🔧 Utility Functions

### Environment Detection

```typescript
// Check if running in development mode
const isDevelopment = isDevMode();

// Get environment-specific configuration
const envConfig = getEnvConfig();
// Returns: ENV.DEV, ENV.TEST, or ENV.PROD
```

### Environment Configuration

```typescript
// Development environment settings
ENV.DEV.PERFORMANCE.ENABLE_DEBUG_LOGGING; // true
ENV.DEV.PERFORMANCE.ENABLE_PERFORMANCE_MONITORING; // true

// Production environment settings
ENV.PROD.PERFORMANCE.ENABLE_DEBUG_LOGGING; // false
ENV.PROD.PERFORMANCE.ENABLE_PERFORMANCE_MONITORING; // false
```

## 📈 Benefits Achieved

- **Maintainability**: Single source of truth for all constants
- **Environment Flexibility**: Different settings for dev/test/prod
- **Type Safety**: Full TypeScript support with autocomplete
- **Consistency**: Organized parameter ranges and defaults
- **Developer Experience**: Easy discovery and consistent patterns

## 🎯 Usage Patterns

### Parameter Validation

```typescript
// Use constants for parameter validation
const volume = Math.max(
  SYNTH_CONFIG.VOLUME.min,
  Math.min(SYNTH_CONFIG.VOLUME.max, userVolume)
);

// Use MIDI constants for note calculations
const noteIndex = MIDI.NOTE_TO_MIDI_INDEX[noteName];
const frequency =
  MIDI.A4_FREQUENCY * Math.pow(2, (noteIndex - MIDI.A4_MIDI_NOTE) / 12);
```

### Environment-Specific Behavior

```typescript
// Different behavior per environment
const envConfig = getEnvConfig();

if (envConfig.PERFORMANCE.ENABLE_DEBUG_LOGGING) {
  console.log("Debug logging enabled");
}

if (envConfig.PERFORMANCE.ENABLE_PERFORMANCE_MONITORING) {
  // Enable performance monitoring
}
```

### Oscillator Configuration

```typescript
// Use oscillator range constants
const validRanges = MIDI.OSCILLATOR_RANGE_VALUES;
const defaultRange = validRanges[0]; // "lo"

// Use frequency limits
const frequency = Math.max(
  MIDI.MIN_FREQUENCY,
  Math.min(MIDI.MAX_FREQUENCY, calculatedFreq)
);
```

## 🚧 Limitations & Future Enhancements

### Current Limitations

- **Basic utility functions**: Limited to environment detection
- **No parameter validation**: Constants provide ranges but no validation helpers
- **No dynamic configuration**: All values are static constants

### Planned Enhancements

- **Parameter validation utilities**: Helper functions for value clamping
- **Dynamic configuration**: Runtime configuration changes
- **Configuration validation**: Schema validation for configuration objects
- **Performance monitoring**: Built-in performance tracking

## 🧪 Testing

The configuration system includes comprehensive tests:

```bash
# Run configuration tests
npm test src/config

# Test specific functionality
npm test -- --grep "config"
```

## 📚 Related Documentation

- **Performance Optimization Guide**: `/docs/performance-optimization-guide.md`
- **Audio Worklet Integration**: `/docs/audio-worklet-integration-guide.md`
- **Node Pooling Implementation**: `/docs/node-pooling-implementation.md`

## 📚 Conclusion

The configuration system provides a solid foundation for centralized constant management in the Minimoog synthesizer. While currently focused on static constants and basic environment detection, it successfully centralizes all hard-coded values and provides a clean, type-safe interface for accessing configuration data.

The system is designed for extensibility, allowing future enhancements like parameter validation utilities and dynamic configuration while maintaining the current benefits of centralized constants and environment-aware settings.
