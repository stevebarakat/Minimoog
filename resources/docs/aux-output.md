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

1. Creates a GainNode for volume control
2. Connects to the master gain node to receive the main audio signal
3. Provides an output node that can be routed to other audio destinations

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

The volume control uses a logarithmic mapping from the 0-10 UI scale to gain values:

- 0: ~0.001 (-60dB)
- 1: ~0.1 (-20dB)
- 5: ~0.5 (-6dB)
- 10: 1.0 (0dB)

### Audio Graph

```
Master Gain → Aux Output Gain → [External Destination]
```

The aux output taps the signal after the master gain but before the final destination, ensuring it receives the complete processed audio signal.
