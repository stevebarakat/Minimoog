# Development Storage Behavior

## Overview

The Minimoog synthesizer application has different storage behaviors for development and production environments to improve the development experience.

## localStorage Persistence

### Development Mode

- **Disabled**: localStorage persistence is completely disabled in development mode
- **Reason**: Prevents cluttering the browser's localStorage during development and testing
- **Detection**: Uses `import.meta.env.DEV` to detect development mode
- **Impact**: Settings are not saved between browser sessions in development

### Production Mode

- **Enabled**: localStorage persistence is enabled in production mode
- **Storage**: Only specific state is persisted to prevent excessive storage usage
- **Persisted State**:
  - `modWheel`: Modulation wheel position
  - `mainVolume`: Main output volume
  - `isMainActive`: Main output active state
  - `mixer`: Mixer settings (oscillator levels, noise, external input)

### Additional localStorage Usage

**Onboarding Settings** (both development and production):
- `minimoog-onboarding-enabled`: Controls whether onboarding is shown to users
- **Purpose**: Allows users to disable onboarding after first use
- **Persistence**: Always enabled regardless of environment

## URL State Persistence

### Both Development and Production

- **Enabled**: URL state persistence works in both development and production
- **Purpose**: Allows sharing specific configurations via URL parameters
- **Usage**: Click "Copy Settings" button to save current settings to URL
- **Benefits**:
  - Share configurations with others
  - Bookmark specific sounds
  - Debug specific parameter combinations
  - Auto-load settings when visiting URLs with parameters

### Comprehensive Parameter Coverage

The URL system saves **all synth parameters** for complete configuration sharing:

#### **Oscillator Settings**
- Waveform type (triangle, sawtooth, square, custom)
- Frequency values
- Range settings (32', 16', 8', 4', 2', lo)
- Enabled/disabled state
- Volume levels

#### **Mixer Configuration**
- Noise generator settings (enabled, volume, type)
- External input settings (enabled, volume)
- Individual oscillator levels

#### **Filter System**
- Filter type selection
- Cutoff frequency and emphasis
- Contour amount and envelope settings
- Attack, decay, and sustain values
- Modulation routing

#### **Modulation & Performance**
- LFO waveform and rate
- Modulation mix settings
- Oscillator modulation routing
- Keyboard control assignments
- Glide settings and timing

#### **Output & Control**
- Main volume and active state
- Aux output configuration
- Master tune and pitch wheel
- Modulation wheel position
- Tuner settings

## Implementation Details

### Store Configuration

```typescript
// In development mode, don't persist to localStorage
if (isDevMode()) {
  return create<SynthState & SynthActions>()((set) => ({
    ...createInitialState(),
    ...createSynthActions(set),
  }));
}

// In production, persist specific state to localStorage
return create<SynthState & SynthActions>()(
  persist(
    (set) => ({
      ...createInitialState(),
      ...createSynthActions(set),
    }),
    {
      name: "synth-storage",
      partialize: (state) => ({
        modWheel: state.modWheel,
        mainVolume: state.mainVolume,
        isMainActive: state.isMainActive,
        mixer: state.mixer,
      }),
    }
  )
);
```

### Development Mode Detection

```typescript
const isDevelopment = import.meta.env.DEV;
const isTest = import.meta.env.MODE === "test";

export function isDevMode(): boolean {
  return isDevelopment;
}
```

### URL State Management

#### **Core Functions**

```typescript
// Save complete synth state to URL parameters
export function saveStateToURL(state: PersistentSynthState): string

// Load synth state from URL parameters
export function loadStateFromURL(): Partial<SynthState> | null

// Update browser URL without page reload
export function updateURLWithState(state: PersistentSynthState): void

// Copy current settings URL to clipboard
export function copyURLToClipboard(state: PersistentSynthState): Promise<void>
```

#### **Automatic URL Synchronization**

```typescript
// useURLSync hook automatically loads URL parameters on app startup
export function useURLSync() {
  useEffect(() => {
    const urlState = loadStateFromURL();
    if (urlState) {
      loadPreset(urlState);
    }
  }, []);
}
```

#### **URL Parameter Structure**

URLs are automatically generated with comprehensive parameter coverage:

```
?osc1_waveform=triangle&osc1_freq=440&osc1_range=8&osc1_enabled=true&
osc1_volume=5&mix_noise_enabled=true&mix_noise_vol=3&filter_cutoff=1000&
filter_emphasis=0.5&lfo_waveform=triangle&lfo_rate=5&main_volume=2.5&
main_active=true&glide_on=true&glide_time=0.1&master_tune=0&
pitch_wheel=50&mod_wheel=50&tuner_on=false&aux_enabled=false&aux_volume=0
```

## Benefits

1. **Clean Development Environment**: No localStorage clutter during development
2. **Faster Development**: No need to clear localStorage when testing different configurations
3. **Isolated Testing**: Each development session starts with fresh state
4. **Production Reliability**: Users still get persistent settings in production
5. **Complete Configuration Sharing**: All synth parameters can be shared via URL
6. **Bookmark Support**: Save and restore complete synth configurations
7. **Debug Support**: Share specific parameter combinations for troubleshooting
8. **Collaboration**: Let others recreate your exact sound settings

## Testing

When testing the application:

- **Development mode**: Settings reset on page refresh (localStorage disabled)
- **Production mode**: Settings persist between sessions (localStorage enabled)
- **URL parameters**: Work in both modes for complete configuration sharing
- **Onboarding**: Always persists user preference regardless of environment

## Usage Examples

### **Sharing a Configuration**

1. Adjust all synth parameters to create your desired sound
2. Click the "Copy Settings" button
3. The current URL is copied to clipboard with all parameters
4. Share the URL with others to let them load your exact configuration

### **Bookmarking a Sound**

1. Create your desired sound configuration
2. Copy the settings URL
3. Bookmark the URL in your browser
4. Return to the exact sound later by visiting the bookmarked URL

### **Debugging Parameter Issues**

1. Reproduce the problematic sound configuration
2. Copy the settings URL
3. Share the URL with developers for troubleshooting
4. Developers can instantly load the exact problematic configuration

## Technical Notes

- **URL Length**: URLs can become quite long with all parameters included
- **Browser Compatibility**: All modern browsers support the required URL length limits
- **Parameter Validation**: Invalid parameters are handled gracefully with fallback values
- **State Restoration**: Complete synth state is restored when loading from URL
- **Performance**: URL loading happens once on app startup, minimal runtime impact
