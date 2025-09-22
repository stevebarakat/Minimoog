# Aux Output Feature

The aux output feature is **mocked** by routing to Reverb and Delay effects instead of creating a true separate audio path.

## Overview

The aux output consists of:

- A volume control (0-10 scale) for aux output level
- An enable/disable switch to activate/deactivate the aux output
- **Mocked routing** to Reverb and Delay effects instead of separate audio path
- Independent control from the main output

## Implementation

### Store State

The aux output state is managed in the synth store:

```typescript
auxOutput: {
  enabled: boolean;
  volume: number; // 0-10 scale for aux output volume
}
```

### Audio Routing

The aux output is **mocked** by routing to Reverb and Delay effects:

1. Controls the `auxOutput.volume` parameter (0-10 scale)
2. Provides enable/disable functionality via `auxOutput.enabled`
3. Uses logarithmic volume mapping for smooth control
4. **Mocks external routing** by sending to Reverb and Delay effects

### Components

- `useAuxOutput.ts` - Hook that **mocks** aux output by routing to Reverb and Delay effects
- Currently **not exposed in the UI** - exists as a backend audio feature

## Usage

### Basic Usage

1. Enable aux output using the `auxOutput.enabled` state
2. Adjust the aux output volume using the `auxOutput.volume` parameter (0-10 scale)
3. The aux output provides a separate audio signal from the main output

### Aux Control

The aux output controls:

- **Enabled state** - activates/deactivates the aux output node
- **Volume level** - controls the gain of the aux output (0-10 scale)
- **Independent routing** - separate from main output and effects

### URL State

Aux output settings are automatically saved to and loaded from the URL, allowing for preset sharing and state persistence.

## Technical Details

### Volume Mapping

The aux output volume control uses logarithmic mapping for smooth control across the 0-10 scale:

```typescript
const linearToLogGain = (linearVolume: number) => {
  const normalizedVolume = linearVolume / 10;
  return Math.pow(normalizedVolume, 1.5) * 0.9 + 0.1;
};
```

### Aux Output Logic

The aux output uses this logic:

```typescript
const newGain = auxOutput.enabled ? linearToLogGain(auxOutput.volume) : 0;
```

**Behavior:**

- **Enabled**: Aux output node is active with volume-controlled gain
- **Disabled**: Aux output node is muted (gain = 0)
- **Independent**: Separate from main output and effects processing

### Audio Graph

```
Mixer → Master Gain → [Main Output]
         ↓
    [Aux Output] → **Mocked to Reverb & Delay Effects**
```

The aux output is **mocked** by routing to the Reverb and Delay effects instead of creating a true separate audio path.

### Component Integration

The `useAuxOutput` hook integrates with:

- **Store state**: Uses `useSynthStore()` to access `auxOutput` state
- **Audio context**: Creates and manages `GainNode` instances
- **Node pooling**: Uses pooled nodes for performance optimization
- **Audio routing**: **Mocks** external routing by sending to Reverb and Delay effects

## Implementation Notes

### Current Features

- ✅ **Aux output volume control** with logarithmic mapping (0-10 scale)
- ✅ **Enable/disable functionality** via store state
- ✅ **Node pooling** for performance optimization
- ✅ **URL state persistence** for preset sharing
- ✅ **Independent audio routing** from main output
- ⚠️ **No UI component** - currently backend-only feature

### Audio Processing

- **Input source**: Master gain node (post-mixer, pre-main output)
- **Processing**: Volume-controlled gain with logarithmic mapping
- **Output**: **Mocked** by routing to Reverb and Delay effects
- **Latency**: Minimal - direct connection to master gain

### Integration Points

- **Main audio system**: Connected to master gain node
- **Store management**: Uses `auxOutput` state (`enabled`, `volume`)
- **URL persistence**: Part of the comprehensive URL state system
- **Hook usage**: Used in `useNoiseAndAux` for audio chain integration
- **Mocked routing**: Sends to Reverb and Delay effects instead of external output

## Conclusion

The aux output is **mocked** by routing to Reverb and Delay effects instead of providing a true separate audio path. While currently implemented as a backend feature without UI controls, it simulates external processing capabilities through the effects chain.

## Note on Effects Output

The "Effects Output" feature (documented separately) controls delay and reverb effects processing, while this aux output **mocks** external routing by sending to those same effects. These are related but distinct systems in the audio chain.
