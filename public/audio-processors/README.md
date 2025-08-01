# Audio Processors

This directory contains general-purpose audio worklet processors for various audio effects and utilities used in the Minimoog emulator.

## Audio Processor Implementations

### 1. `modulation-monitor-processor.js`

**Purpose**: Monitor and analyze modulation signals

- **Use Case**: Debugging, visualization, analysis
- **Features**: Signal level monitoring, frequency analysis
- **Integration**: Used for development and debugging purposes

### 2. `overload-meter-processor.js`

**Purpose**: Detect and measure audio overload/clipping

- **Use Case**: Audio level monitoring, overload protection
- **Features**: Peak detection, RMS measurement, overload indicators
- **Integration**: Used in the output section for level monitoring

## Usage

### Loading and using audio processors:

```typescript
// Load modulation monitor processor
await audioContext.audioWorklet.addModule(
  "/audio-processors/modulation-monitor-processor.js"
);
const modMonitorNode = new AudioWorkletNode(
  audioContext,
  "modulation-monitor-processor",
  {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
  }
);

// Load overload meter processor
await audioContext.audioWorklet.addModule(
  "/audio-processors/overload-meter-processor.js"
);
const overloadMeterNode = new AudioWorkletNode(
  audioContext,
  "overload-meter-processor",
  {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
  }
);
```

## Integration with Audio System

These processors are used for system-level audio monitoring and analysis:

```typescript
// Modulation monitoring in useModulation.ts
const modMonitorWorklet = new AudioWorkletNode(
  audioContext,
  "modulation-monitor-processor",
  {
    numberOfInputs: 1,
    numberOfOutputs: 1,
    outputChannelCount: [1],
  }
);
```

## Technical Details

### Performance Considerations

- All processors use AudioWorkletProcessor for non-blocking operation
- Optimized for real-time processing
- Minimal latency and CPU usage
- Efficient parameter handling

### Parameter Automation

- Support for real-time parameter changes
- Smooth parameter transitions
- Automation rate optimization

### Audio Quality

- High-quality algorithms
- Proper sample rate handling
- Minimal artifacts and aliasing

## Development Notes

- **Modular Design**: Each processor is self-contained
- **Consistent API**: Standardized parameter handling
- **Error Handling**: Robust error detection and recovery
- **Performance Monitoring**: Built-in performance tracking where applicable

## Future Enhancements

- Add more effect types (chorus, phaser, etc.)
- Implement parameter presets
- Add MIDI control support
- Enhance visualization capabilities
- Add A/B comparison features
