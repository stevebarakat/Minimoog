# Development Storage Behavior

## Overview

The Minimoog synthesizer application now uses a simplified storage approach focused on URL-based state sharing, eliminating the complexity of localStorage persistence.

## Storage Strategy

### **Synth Settings - URL-Based Only**

- **No localStorage persistence**: Synth settings are not automatically saved between sessions
- **URL sharing**: Settings can be shared via URL parameters when explicitly requested
- **Fresh start**: Each session starts with default settings unless a shared URL is loaded

### **Effects Panel State - Direct localStorage**

Effects panel state (open/closed and positions) is managed directly with localStorage:

- **`minimoog-effects-open`**: Tracks which effects panels are currently open
- **`minimoog-effects-positions`**: Stores custom positioning of effects panels
- **Purpose**: Remembers user's preferred effects panel layout
- **Persistence**: Always enabled regardless of environment

### **Onboarding State - Direct localStorage**

- **`minimoog-onboarding-enabled`**: Controls whether onboarding is shown to users
- **Purpose**: Allows users to disable onboarding after first use
- **Persistence**: Always enabled regardless of environment

## URL State Persistence

### **Both Development and Production**

- **Enabled**: URL state persistence works in both development and production
- **Purpose**: Allows sharing specific configurations via URL parameters
- **Usage**: Click "Copy Settings" button to save current settings to URL
- **Benefits**:
  - Share configurations with others
  - Bookmark specific sounds
  - Debug specific parameter combinations
  - Auto-load settings when visiting URLs with parameters

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

## Implementation Details

### **Store Configuration**

```typescript
// Simple store without localStorage persistence
const createStore = () => {
  return create<SynthState & SynthActions>()((set) => ({
    ...createInitialState(),
    ...createSynthActions(set),
  }));
};
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

#### **Automatic URL Synchronization**

```typescript
// useURLSync hook automatically loads URL parameters on app startup
export function useURLSync() {
  useEffect(() => {
    const urlState = loadStateFromURL();
    if (urlState && Object.keys(urlState).length > 0) {
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

1. **Simplified Architecture**: No complex persistence logic or race conditions
2. **Clean URLs**: Normal browsing doesn't create cluttered URLs
3. **Explicit Sharing**: Users choose when to share configurations
4. **Cross-Device**: Shared URLs work on any device
5. **No Storage Limits**: URLs can contain unlimited parameter data
6. **Bookmarkable**: Save specific configurations as bookmarks
7. **Debug Support**: Share specific parameter combinations for troubleshooting
8. **Collaboration**: Let others recreate your exact sound settings

## Testing

When testing the application:

- **Both modes**: No automatic persistence of synth settings
- **URL parameters**: Work in both modes for complete configuration sharing
- **Onboarding**: Always persists user preference regardless of environment
- **Effects panels**: Positions and open/closed state are remembered
- **Fresh sessions**: Each page load starts with default settings unless URL parameters are present

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

### **Custom Effects Layout**

1. Position effects panels where you prefer
2. Open/close effects panels as needed
3. Your layout preferences are automatically saved
4. Return to your custom layout in future sessions

## Technical Notes

- **URL Length**: URLs can become quite long with all parameters included
- **Browser Compatibility**: All modern browsers support the required URL length limits
- **Parameter Validation**: Invalid parameters are handled gracefully with fallback values
- **State Restoration**: Complete synth state is restored when loading from URL
- **Performance**: URL loading happens once on app startup, minimal runtime impact
- **No localStorage**: Synth settings are not persisted between sessions
- **Effects & Onboarding**: Still use localStorage for UI preferences
