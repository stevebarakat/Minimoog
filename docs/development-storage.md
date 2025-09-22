# Development Storage Behavior

## Overview

The Minimoog synthesizer application uses a comprehensive storage system that combines localStorage persistence with URL-based state sharing for maximum flexibility and user experience.

## Storage Strategy

### **Synth Settings - localStorage + URL**

- **localStorage persistence**: Synth settings are automatically saved and restored between sessions
- **URL sharing**: Settings can be shared via URL parameters when explicitly requested
- **Smart loading**: URL parameters take precedence over localStorage on initial load
- **Auto-save**: All synth parameter changes are automatically persisted to localStorage

### **User Settings - localStorage**

User preferences are managed with localStorage:

- **`minimoog-options`**: Stores user preferences (tooltips, magnifyKnobs, onboardingVisible, welcomeTour)
- **Purpose**: Remembers user's UI preferences and onboarding state
- **Persistence**: Always enabled regardless of environment

### **Effects Panel State - localStorage**

Effects panel state (open/closed and positions) is managed with localStorage:

- **`minimoog-effects-open`**: Tracks which effects panels are currently open
- **`minimoog-effects-positions`**: Stores custom positioning of effects panels
- **Purpose**: Remembers user's preferred effects panel layout
- **Persistence**: Always enabled regardless of environment

## URL State Persistence

### **Smart URL Loading**

- **Priority**: URL parameters take precedence over localStorage on initial load
- **Auto-clear**: URL parameters are automatically cleared after 10 seconds to prevent interference with localStorage
- **Toast notification**: Users get a countdown toast when settings are loaded from URL
- **Purpose**: Allows sharing specific configurations while maintaining localStorage persistence

### **Both Development and Production**

- **Enabled**: URL state persistence works in both development and production
- **Usage**: Click "Copy Settings" button to save current settings to URL
- **Benefits**:
  - Share configurations with others
  - Bookmark specific sounds
  - Debug specific parameter combinations
  - Temporary override of localStorage settings

### **Comprehensive Parameter Coverage**

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

#### **Effects**

- Delay effect settings (enabled, mix, time, feedback)
- Reverb effect settings (enabled, mix, tone)
- Effects volume control

## Implementation Details

### **Store Configuration**

```typescript
// Store with automatic localStorage persistence
const createStore = () => {
  return create<SynthState & SynthActions>()((set) => ({
    ...createInitialState(), // Loads from localStorage or defaults
    ...createSynthActions(set), // Auto-saves on every change
  }));
};
```

### **Typed Storage System**

The application uses a typed localStorage wrapper for type safety:

```typescript
// User settings storage
export const userSettingsStorage = typedLocalStorage<"options", Options>({
  options: {
    prefix: "minimoog",
    serializer: { serialize: JSON.stringify, deserialize: JSON.parse },
  },
});

// Synth settings storage
export const synthSettingsStorage = typedLocalStorage<
  "synth-settings",
  SynthSettings
>({
  options: {
    prefix: "minimoog",
    serializer: { serialize: JSON.stringify, deserialize: JSON.parse },
  },
});

// Effects storage
export const effectsStorage = typedLocalStorage<
  "effects-open" | "effects-positions",
  Set<EffectType> | Record<string, { x: number; y: number }>
>({
  options: {
    prefix: "minimoog",
    serializer: { serialize: JSON.stringify, deserialize: JSON.parse },
  },
});
```

### **URL State Management**

#### **Core Functions**

```typescript
// Save complete synth state to URL parameters
export function saveStateToURL(state: PersistentSynthState): string;

// Load synth state from URL parameters
export function loadStateFromURL(): Partial<SynthState> | null;

// Update browser URL without page reload
export function updateURLWithState(state: PersistentSynthState): void;

// Copy current settings URL to clipboard
export function copyURLToClipboard(state: PersistentSynthState): Promise<void>;
```

#### **Smart URL Synchronization**

```typescript
// useURLSync hook loads URL parameters with smart clearing
export function useURLSync() {
  useEffect(() => {
    const urlState = loadStateFromURL();
    if (urlState && Object.keys(urlState).length > 0) {
      // Apply URL state (takes precedence over localStorage)
      loadPreset(urlState);

      // Show countdown toast
      countdownToast.startCountdown();

      // Clear URL after 10 seconds to prevent interference with localStorage
      setTimeout(() => {
        window.history.replaceState({}, "", window.location.pathname);
      }, 10000);
    }
  }, []);
}
```

#### **Auto-Save on State Changes**

```typescript
// Every synth action automatically saves to localStorage
function setWithSave(set, updater) {
  set((state) => {
    const newState = { ...state, ...updater(state) };
    saveSynthState(newState); // Auto-save to localStorage
    return newState;
  });
}
```

#### **URL Parameter Structure**

URLs are automatically generated with comprehensive parameter coverage:

```
?osc1_waveform=triangle&osc1_freq=440&osc1_range=8&osc1_enabled=true&
osc1_volume=5&mix_noise_enabled=true&mix_noise_vol=3&filter_cutoff=1000&
filter_emphasis=0.5&lfo_waveform=triangle&lfo_rate=5&main_volume=2.5&
main_active=true&glide_on=true&glide_time=0.1&master_tune=0&
pitch_wheel=50&mod_wheel=50&tuner_on=false&aux_enabled=false&aux_volume=0&
delay_enabled=true&delay_mix=5&delay_time=2.5&delay_feedback=3&
reverb_enabled=true&reverb_mix=7&reverb_tone=5&effects_volume=7
```

## Benefits

1. **Automatic Persistence**: All settings automatically saved and restored between sessions
2. **Smart URL Loading**: URL parameters take precedence over localStorage when present
3. **Type Safety**: Typed localStorage wrapper prevents data corruption
4. **Clean URLs**: Normal browsing doesn't create cluttered URLs
5. **Explicit Sharing**: Users choose when to share configurations via URL
6. **Cross-Device**: Shared URLs work on any device
7. **No Storage Limits**: URLs can contain unlimited parameter data
8. **Bookmarkable**: Save specific configurations as bookmarks
9. **Debug Support**: Share specific parameter combinations for troubleshooting
10. **Collaboration**: Let others recreate your exact sound settings
11. **UI Preferences**: User settings and effects panel layouts are remembered

## Testing

When testing the application:

- **localStorage persistence**: Synth settings are automatically saved and restored
- **URL parameters**: Take precedence over localStorage on initial load
- **User settings**: UI preferences persist across sessions
- **Effects panels**: Positions and open/closed state are remembered
- **Smart loading**: URL parameters are cleared after 10 seconds to prevent interference
- **Default presets**: Load when no saved settings exist

## Usage Examples

### **Automatic Persistence**

1. Adjust any synth parameters (oscillators, filters, effects, etc.)
2. Settings are automatically saved to localStorage
3. Refresh the page or close/reopen browser
4. Your settings are automatically restored

### **Sharing a Configuration**

1. Adjust all synth parameters to create your desired sound
2. Click the "Copy Settings" button
3. The current URL is copied to clipboard with all parameters
4. Share the URL with others to let them load your exact configuration
5. URL parameters override localStorage for that session

### **Bookmarking a Sound**

1. Create your desired sound configuration
2. Copy the settings URL
3. Bookmark the URL in your browser
4. Return to the exact sound later by visiting the bookmarked URL
5. URL will load the configuration and then clear after 10 seconds

### **Debugging Parameter Issues**

1. Reproduce the problematic sound configuration
2. Copy the settings URL
3. Share the URL with developers for troubleshooting
4. Developers can instantly load the exact problematic configuration

### **Custom Effects Layout**

1. Position effects panels where you prefer
2. Open/close effects panels as needed
3. Your layout preferences are automatically saved to localStorage
4. Return to your custom layout in future sessions

### **User Preferences**

1. Toggle tooltips, magnify knobs, or onboarding visibility
2. Settings are automatically saved to localStorage
3. Preferences persist across all sessions
4. No need to reconfigure UI preferences

## Technical Notes

- **URL Length**: URLs can become quite long with all parameters included
- **Browser Compatibility**: All modern browsers support the required URL length limits
- **Parameter Validation**: Invalid parameters are handled gracefully with fallback values
- **State Restoration**: Complete synth state is restored when loading from URL
- **Performance**: URL loading happens once on app startup, minimal runtime impact
- **localStorage Keys**: Uses prefixed keys (`minimoog-options`, `minimoog-synth-settings`, etc.)
- **Type Safety**: Typed localStorage wrapper prevents data corruption
- **Auto-Save**: Every synth parameter change triggers localStorage save
- **Smart Loading**: URL parameters take precedence over localStorage on initial load
- **Auto-Clear**: URL parameters are cleared after 10 seconds to prevent interference
- **Error Handling**: Graceful fallback to defaults if localStorage is corrupted
