# Configuration System

This directory contains the centralized configuration system for the Minimoog synthesizer application. It replaces hard-coded values scattered throughout the codebase with organized, environment-aware constants.

## 🗂️ Quick Overview

### Migration Status: Complete ✅

The centralized configuration system has been successfully implemented with all major hard-coded values migrated to organized constants.

### Core Categories

- **Audio Constants** - Sample rates, buffer sizes, level monitoring settings
- **MIDI Constants** - Note frequencies, velocity ranges, control changes, oscillator ranges
- **Synth Parameters** - Complete synthesizer configuration including oscillators, filters, effects
- **User Settings** - Default user preferences and UI settings
- **Default State** - Complete default synthesizer state and preset configuration
- **External Input** - External input processing parameters
- **Keyboard** - Keyboard layout and positioning constants
- **Oscillator** - Oscillator-specific parameters and ranges
- **Envelope Mapping** - Envelope parameter mappings and ranges
- **Filter Mapping** - Filter parameter mappings and ranges
- **Environment Configuration** - Development, test, and production settings
- **UI Constants** - User interface configuration
- **Toast Configuration** - Notification system settings

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
// Controllers
SYNTH_CONFIG.CONTROLLERS.PITCH_WHEEL; // { MIN: 0, MAX: 100, DEFAULT: 50 }
SYNTH_CONFIG.CONTROLLERS.MOD_WHEEL; // { MIN: 0, MAX: 100, DEFAULT: 0 }
SYNTH_CONFIG.CONTROLLERS.MASTER_TUNE; // { MIN: -12, MAX: 12, DEFAULT: 0 }

// Volume controls
SYNTH_CONFIG.VOLUME.MAIN; // { MIN: 0, MAX: 10, DEFAULT: 5 }
SYNTH_CONFIG.VOLUME.AUX; // { MIN: 0, MAX: 10, DEFAULT: 0 }
SYNTH_CONFIG.VOLUME.EFFECTS; // { MIN: 0, MAX: 10, DEFAULT: 7 }

// Filter configuration
SYNTH_CONFIG.FILTER.CUTOFF; // { MIN: -5, MAX: 5, DEFAULT: 3.9 }
SYNTH_CONFIG.FILTER.EMPHASIS; // { MIN: 0, MAX: 10, DEFAULT: 0 }
SYNTH_CONFIG.FILTER.CONTOUR_AMOUNT; // { MIN: 0, MAX: 10, DEFAULT: 4.71 }
SYNTH_CONFIG.FILTER.TYPE.VALUES; // ["huovilainen"]
SYNTH_CONFIG.FILTER.TYPE.DEFAULT; // "huovilainen"

// Effects configuration
SYNTH_CONFIG.DELAY.ENABLED.DEFAULT; // true
SYNTH_CONFIG.DELAY.MIX; // { MIN: 0, MAX: 10, DEFAULT: 5 }
SYNTH_CONFIG.REVERB.ENABLED.DEFAULT; // true
SYNTH_CONFIG.REVERB.MIX; // { MIN: 0, MAX: 10, DEFAULT: 7 }
```

### User Settings Configuration

```typescript
DEFAULT_USER_SETTINGS.welcomeTour; // true
DEFAULT_USER_SETTINGS.tooltips; // false
DEFAULT_USER_SETTINGS.magnifyKnobs; // false
DEFAULT_USER_SETTINGS.onboardingVisible; // false
```

### Default State Configuration

```typescript
DEFAULT_PRESET_ID; // "classic-minimoog-lead" | null
DEFAULT_SYNTH_STATE; // Complete synthesizer state object
```

### External Input Configuration

```typescript
EXTERNAL_INPUT.LEVEL_MONITORING.NORMALIZATION_FACTOR; // 50
EXTERNAL_INPUT.LEVEL_MONITORING.VOLUME_CURVE_POWER; // 1.5
EXTERNAL_INPUT.LEVEL_MONITORING.MIN_GAIN; // 0.1
EXTERNAL_INPUT.LEVEL_MONITORING.MAX_GAIN; // 0.9
```

### UI Configuration

```typescript
UI.DEFAULTS.KEYBOARD_INSTRUCTIONS_OPEN; // false
POWER_REQUIRED_TOAST.title; // "Power Required"
POWER_REQUIRED_TOAST.description; // "Please click the power switch to use the Minimoog"
POWER_REQUIRED_TOAST.variant; // "error"
```

### Envelope Mapping

```typescript
ENVELOPE_MAPPING.ATTACK_DECAY_STOPS; // Array of position/value pairs for envelope stops
```

### Filter Mapping

```typescript
FILTER_MAPPING.CUTOFF.MIN_FREQ; // 10 Hz
FILTER_MAPPING.CUTOFF.MAX_FREQ; // 32000 Hz
FILTER_MAPPING.CUTOFF.MUSICAL_CURVE_POWER; // 1.2
FILTER_MAPPING.RESONANCE.LINEAR_THRESHOLD; // 2.4
FILTER_MAPPING.RESONANCE.CURVED_THRESHOLD; // 3.4
```

### Oscillator Configuration

```typescript
OSCILLATOR.HARMONICS_COUNT; // 128
OSCILLATOR.OSC1_DETUNE_CENTS; // 2
OSCILLATOR.OSC1_VOLUME_BOOST; // 1.2
OSCILLATOR.GLIDE_TIME_MULTIPLIER; // 0.02
OSCILLATOR.GLIDE_TIME_POWER; // 5
```

### Detailed Synth Configuration

#### Oscillators

```typescript
// Oscillator 1
SYNTH_CONFIG.OSCILLATORS.OSC1.WAVEFORM.VALUES; // ["sawtooth", "square", "triangle", "pulse1", "pulse2"]
SYNTH_CONFIG.OSCILLATORS.OSC1.WAVEFORM.DEFAULT; // "sawtooth"
SYNTH_CONFIG.OSCILLATORS.OSC1.FREQUENCY; // { MIN: -12, MAX: 12, DEFAULT: 0 }
SYNTH_CONFIG.OSCILLATORS.OSC1.RANGE.VALUES; // ["lo", "32", "16", "8", "4", "2"]
SYNTH_CONFIG.OSCILLATORS.OSC1.RANGE.DEFAULT; // "8"
SYNTH_CONFIG.OSCILLATORS.OSC1.VOLUME; // { MIN: 0, MAX: 10, DEFAULT: 9.5 }
SYNTH_CONFIG.OSCILLATORS.OSC1.ENABLED.DEFAULT; // true

// Oscillator 2
SYNTH_CONFIG.OSCILLATORS.OSC2.WAVEFORM.VALUES; // ["sawtooth", "square", "triangle", "pulse1", "pulse2"]
SYNTH_CONFIG.OSCILLATORS.OSC2.WAVEFORM.DEFAULT; // "sawtooth"
SYNTH_CONFIG.OSCILLATORS.OSC2.FREQUENCY; // { MIN: -12, MAX: 12, DEFAULT: 0 }
SYNTH_CONFIG.OSCILLATORS.OSC2.RANGE.VALUES; // ["lo", "32", "16", "8", "4", "2"]
SYNTH_CONFIG.OSCILLATORS.OSC2.RANGE.DEFAULT; // "8"
SYNTH_CONFIG.OSCILLATORS.OSC2.VOLUME; // { MIN: 0, MAX: 10, DEFAULT: 5.5 }
SYNTH_CONFIG.OSCILLATORS.OSC2.ENABLED.DEFAULT; // false

// Oscillator 3
SYNTH_CONFIG.OSCILLATORS.OSC3.WAVEFORM.VALUES; // ["sawtooth", "square", "triangle", "pulse1", "pulse2", "pulse3", "rev_saw"]
SYNTH_CONFIG.OSCILLATORS.OSC3.WAVEFORM.DEFAULT; // "triangle"
SYNTH_CONFIG.OSCILLATORS.OSC3.FREQUENCY; // { MIN: -12, MAX: 12, DEFAULT: 0 }
SYNTH_CONFIG.OSCILLATORS.OSC3.RANGE.VALUES; // ["lo", "32", "16", "8", "4", "2"]
SYNTH_CONFIG.OSCILLATORS.OSC3.RANGE.DEFAULT; // "8"
SYNTH_CONFIG.OSCILLATORS.OSC3.VOLUME; // { MIN: 0, MAX: 10, DEFAULT: 6.0 }
SYNTH_CONFIG.OSCILLATORS.OSC3.ENABLED.DEFAULT; // false
```

#### Mixer Configuration

```typescript
// Noise generator
SYNTH_CONFIG.MIXER.NOISE.TYPE.VALUES; // ["white", "pink"]
SYNTH_CONFIG.MIXER.NOISE.TYPE.DEFAULT; // "white"
SYNTH_CONFIG.MIXER.NOISE.VOLUME; // { MIN: 0, MAX: 10, DEFAULT: 0 }

// External input
SYNTH_CONFIG.MIXER.EXTERNAL_INPUT.VOLUME; // { MIN: 0.001, MAX: 10, DEFAULT: 5 }
```

#### Filter Configuration

```typescript
SYNTH_CONFIG.FILTER.CUTOFF; // { MIN: -5, MAX: 5, DEFAULT: 3.9 }
SYNTH_CONFIG.FILTER.EMPHASIS; // { MIN: 0, MAX: 10, DEFAULT: 0 }
SYNTH_CONFIG.FILTER.CONTOUR_AMOUNT; // { MIN: 0, MAX: 10, DEFAULT: 4.71 }
SYNTH_CONFIG.FILTER.ENVELOPE.ATTACK; // { MIN: 0, MAX: 10, DEFAULT: 0.3 }
SYNTH_CONFIG.FILTER.ENVELOPE.DECAY; // { MIN: 0, MAX: 10, DEFAULT: 0 }
SYNTH_CONFIG.FILTER.ENVELOPE.SUSTAIN; // { MIN: 0, MAX: 10, DEFAULT: 4.5 }
SYNTH_CONFIG.FILTER.TYPE.VALUES; // ["huovilainen"]
SYNTH_CONFIG.FILTER.TYPE.DEFAULT; // "huovilainen"
SYNTH_CONFIG.FILTER.MODULATION_ON.DEFAULT; // true
```

#### Envelope Configuration

```typescript
SYNTH_CONFIG.ENVELOPES.LOUDNESS.ATTACK; // { MIN: 0, MAX: 10, DEFAULT: 0 }
SYNTH_CONFIG.ENVELOPES.LOUDNESS.DECAY; // { MIN: 0, MAX: 10, DEFAULT: 0 }
SYNTH_CONFIG.ENVELOPES.LOUDNESS.SUSTAIN; // { MIN: 0, MAX: 10, DEFAULT: 10 }
```

#### Modulation Configuration

```typescript
SYNTH_CONFIG.MODULATION.LFO.RATE; // { MIN: 0, MAX: 10, DEFAULT: 3.5 }
SYNTH_CONFIG.MODULATION.LFO.WAVEFORM.VALUES; // ["triangle", "square"]
SYNTH_CONFIG.MODULATION.LFO.WAVEFORM.DEFAULT; // "triangle"
SYNTH_CONFIG.MODULATION.MIX; // { MIN: 0, MAX: 10, DEFAULT: 10 }
```

#### Glide Configuration

```typescript
SYNTH_CONFIG.GLIDE.TIME; // { MIN: 0, MAX: 10, DEFAULT: 1 }
SYNTH_CONFIG.GLIDE.ON.DEFAULT; // true
```

#### Switch Configuration

```typescript
SYNTH_CONFIG.SWITCHES.IS_DISABLED; // true
SYNTH_CONFIG.SWITCHES.IS_MAIN_ACTIVE; // true
SYNTH_CONFIG.SWITCHES.KEYBOARD_CONTROL1; // true
SYNTH_CONFIG.SWITCHES.KEYBOARD_CONTROL2; // true
SYNTH_CONFIG.SWITCHES.DECAY_SWITCH_ON; // false
SYNTH_CONFIG.SWITCHES.OSCILLATOR_MODULATION_ON; // false
SYNTH_CONFIG.SWITCHES.OSC3_CONTROL; // true
SYNTH_CONFIG.SWITCHES.OSC3_FILTER_EG_SWITCH; // false
SYNTH_CONFIG.SWITCHES.NOISE_LFO_SWITCH; // true
SYNTH_CONFIG.SWITCHES.TUNER_ON; // false
```

#### Effects Configuration

```typescript
// Delay effect
SYNTH_CONFIG.DELAY.ENABLED.DEFAULT; // true
SYNTH_CONFIG.DELAY.MIX; // { MIN: 0, MAX: 10, DEFAULT: 5 }
SYNTH_CONFIG.DELAY.TIME; // { MIN: 0, MAX: 10, DEFAULT: 2.5 }
SYNTH_CONFIG.DELAY.FEEDBACK; // { MIN: 0, MAX: 10, DEFAULT: 3 }

// Reverb effect
SYNTH_CONFIG.REVERB.ENABLED.DEFAULT; // true
SYNTH_CONFIG.REVERB.MIX; // { MIN: 0, MAX: 10, DEFAULT: 7 }
SYNTH_CONFIG.REVERB.TONE; // { MIN: 0, MAX: 10, DEFAULT: 5 }
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
ENV.DEV.AUDIO.SAMPLE_RATE; // 44100
ENV.DEV.AUDIO.LATENCY_HINT; // "interactive"
ENV.DEV.AUDIO.SMOOTHING_TIME_CONSTANT; // 0.8
ENV.DEV.PERFORMANCE.ENABLE_DEBUG_LOGGING; // true
ENV.DEV.PERFORMANCE.ENABLE_PERFORMANCE_MONITORING; // true

// Production environment settings
ENV.PROD.AUDIO.SAMPLE_RATE; // 44100
ENV.PROD.AUDIO.LATENCY_HINT; // "interactive"
ENV.PROD.AUDIO.SMOOTHING_TIME_CONSTANT; // 0.8
ENV.PROD.PERFORMANCE.ENABLE_DEBUG_LOGGING; // false
ENV.PROD.PERFORMANCE.ENABLE_PERFORMANCE_MONITORING; // false

// Test environment settings
ENV.TEST.AUDIO.SAMPLE_RATE; // 44100
ENV.TEST.AUDIO.LATENCY_HINT; // "interactive"
ENV.TEST.AUDIO.SMOOTHING_TIME_CONSTANT; // 0.8
ENV.TEST.PERFORMANCE.ENABLE_DEBUG_LOGGING; // false
ENV.TEST.PERFORMANCE.ENABLE_PERFORMANCE_MONITORING; // false
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
  SYNTH_CONFIG.VOLUME.MAIN.MIN,
  Math.min(SYNTH_CONFIG.VOLUME.MAIN.MAX, userVolume)
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

// Audio configuration per environment
const sampleRate = envConfig.AUDIO.SAMPLE_RATE;
const latencyHint = envConfig.AUDIO.LATENCY_HINT;
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

// Use oscillator configuration
const osc1Volume = SYNTH_CONFIG.OSCILLATORS.OSC1.VOLUME.DEFAULT;
const osc1Waveform = SYNTH_CONFIG.OSCILLATORS.OSC1.WAVEFORM.DEFAULT;
const osc1Enabled = SYNTH_CONFIG.OSCILLATORS.OSC1.ENABLED.DEFAULT;
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

The test file `config.test.ts` focuses on behavior and integration testing rather than implementation details, covering:

- Parameter validation behavior with edge cases
- Environment configuration adaptation
- MIDI utility functions (note-to-frequency conversion)
- Integration behavior with configuration constants
- Error handling with extreme values

## 📚 Related Documentation

- **Performance Optimization Guide**: `performance-optimization-guide.md`
- **Audio Worklet Integration**: `audio-worklet-integration-guide.md`
- **Node Pooling Implementation**: `node-pooling-implementation.md`

## 📚 Conclusion

The configuration system provides a solid foundation for centralized constant management in the Minimoog synthesizer. While currently focused on static constants and basic environment detection, it successfully centralizes all hard-coded values and provides a clean, type-safe interface for accessing configuration data.

The system is designed for extensibility, allowing future enhancements like parameter validation utilities and dynamic configuration while maintaining the current benefits of centralized constants and environment-aware settings.
