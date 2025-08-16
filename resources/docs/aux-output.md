# Aux Output Feature

The aux output feature provides a secondary audio output that can be routed to other audio nodes or external devices. This allows for flexible audio routing and monitoring capabilities.

## Overview

The aux output consists of:

- A volume control (0-10 scale)
- An enable/disable switch
- An audio output node that can be connected to other audio processing chains

## Implementation

### Store State

The aux output state is managed in the synth store:

```typescript
auxOutput: {
  enabled: boolean;
  volume: number; // 0-10
}
```

### Audio Routing

The aux output is implemented using the `useAuxOutput` hook which:

1. Creates a GainNode for volume control using the node pooling system
2. Connects to the master gain node (mixer output) to receive the main audio signal
3. Provides an output node that can be routed to other audio destinations
4. Manages gain changes and enables/disables the output

### Components

- `AuxOut.tsx` - UI component with volume knob and enable switch
- `useAuxOutput.ts` - Hook that handles audio routing and gain control

## Usage

### Basic Usage

1. Enable the aux output using the rocker switch
2. Adjust the volume using the volume knob
3. The aux output will provide the same audio signal as the main output but with independent volume control

### Audio Routing

The aux output node can be connected to:

- External audio interfaces
- Recording software
- Additional effects chains
- Monitoring systems

### URL State

Aux output settings are automatically saved to and loaded from the URL, allowing for preset sharing and state persistence.

## Technical Details

### Volume Mapping

The volume control uses a custom logarithmic mapping from the 0-10 UI scale to gain values:

```typescript
const linearToLogGain = (linearVolume: number) => {
  const normalizedVolume = linearVolume / 10;
  return Math.pow(normalizedVolume, 1.5) * 0.9 + 0.1;
};
```

**Actual Gain Values:**

- 0: 0.1 (-20dB)
- 1: ~0.19 (-14dB)
- 2: ~0.28 (-11dB)
- 3: ~0.37 (-8.6dB)
- 4: ~0.46 (-6.8dB)
- 5: ~0.55 (-5.2dB)
- 6: ~0.64 (-3.9dB)
- 7: ~0.73 (-2.7dB)
- 8: ~0.82 (-1.7dB)
- 9: ~0.91 (-0.8dB)
- 10: 1.0 (0dB)

**Note**: The mapping provides a minimum gain of 0.1 (-20dB) at volume 0, ensuring the aux output is never completely silent.

### Audio Graph

```
Mixer → Master Gain → [Main Output]
     ↘ Aux Output Gain → [External Destination]
```

The aux output taps the signal from the mixer output (before the main output), ensuring it receives the complete processed audio signal including all oscillators, noise, external input, and filter processing.

### Node Pooling Integration

The aux output uses the node pooling system for efficient resource management:

- **GainNode creation**: Uses `getPooledNode("gain", audioContext)` for optimal performance
- **Resource cleanup**: Automatically releases nodes with `releaseNode()` when unmounting
- **Gain management**: Uses `resetGain()` utility for smooth gain changes

### Gain Management

The hook includes several safety features:

- **Initial muted state**: Starts with gain 0 to prevent audio spikes
- **Error handling**: Checks for valid gain values before applying
- **Smooth transitions**: Uses `resetGain()` for artifact-free gain changes
- **State synchronization**: Automatically updates gain when enabled/disabled

## Implementation Notes

### Current Features

- ✅ **Volume control** with logarithmic mapping (0-10 scale)
- ✅ **Enable/disable switch** with rocker switch UI
- ✅ **Node pooling integration** for efficient resource management
- ✅ **URL state persistence** for preset sharing
- ✅ **Error handling** for invalid gain values
- ✅ **Smooth gain transitions** to prevent audio artifacts

### Audio Processing

- **Input source**: Mixer output (includes all audio sources)
- **Processing**: Volume control via GainNode
- **Output**: Clean audio signal for external routing
- **Latency**: Minimal processing delay

### Integration Points

- **Main audio system**: Connected via `useNoiseAndAux` hook
- **Store management**: Integrated with synth store state
- **URL persistence**: Part of the comprehensive URL state system
- **Component hierarchy**: Located in the Output section

## Conclusion

The aux output provides a flexible secondary audio path that maintains the authentic Minimoog sound while enabling modern audio routing capabilities. The implementation is efficient, reliable, and integrates seamlessly with the broader audio optimization systems.
