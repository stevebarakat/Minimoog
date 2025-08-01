# Utility Functions

This directory contains comprehensive utility functions organized by category to support the Minimoog synthesizer application.

## Table of Contents

- [MIDI Utilities](#midi-utilities)
- [Audio Node Pooling/Management](#audio-node-poolingmanagement)
- [Error Handling and Logging](#error-handling-and-logging)
- [Math/Signal Utilities](#mathsignal-utilities)
- [UI/Formatting Utilities](#uiformatting-utilities)
- [Test Utilities](#test-utilities)

## MIDI Utilities (`midiUtils.ts`)

Comprehensive MIDI note/CC parsing, pitch bend scaling, velocity normalization, and other MIDI math operations.

### Key Functions

```typescript
// Note conversion
midiNoteToNoteName(midiNote: number): string
noteNameToMidiNote(noteName: string): number
midiNoteToFrequency(midiNote: number): number
frequencyToMidiNote(frequency: number): number

// Velocity and gain conversion
velocityToGain(velocity: MIDIVelocity): number
gainToVelocity(gain: number): MIDIVelocity

// Control change conversion
controlToValue(control: MIDIControlValue, range: [number, number], curve?: "linear" | "exponential" | "logarithmic"): number
valueToControl(value: number, range: [number, number], curve?: "linear" | "exponential" | "logarithmic"): MIDIControlValue

// Pitch bend conversion
pitchBendToValue(bend: MIDIPitchBendValue): number
valueToPitchBend(value: number): MIDIPitchBendValue

// Message parsing
parseMIDIMessage(data: Uint8Array): MIDIMessage | null
createMIDIMessage(type: MIDIMessageType, channel: MIDIChannelNumber, data: number[]): Uint8Array
validateMIDIMessage(data: Uint8Array): boolean

// Timing conversion
ticksToSeconds(ticks: number, tempo: number, resolution: number): number
secondsToTicks(seconds: number, tempo: number, resolution: number): number
```

### Usage Example

```typescript
import { midiNoteToFrequency, velocityToGain, parseMIDIMessage } from "@/utils";

// Convert MIDI note to frequency
const frequency = midiNoteToFrequency(69); // Returns 440 Hz

// Convert velocity to gain
const gain = velocityToGain(100); // Returns ~0.79

// Parse MIDI message
const message = parseMIDIMessage(new Uint8Array([0x90, 69, 100]));
// Returns: { type: "NOTE_ON", channel: 1, note: 69, velocity: 100 }
```

## Audio Node Pooling/Management (`nodePoolingUtils.ts`)

Enhanced audio node pooling, releasing, and reusing nodes (oscillators, gains, buffers, worklets).

### Key Functions

```typescript
// Pool management
initializeNodePool(config?: Partial<NodePoolConfig>): EnhancedAudioNodePool
getPooledNode<T extends AudioNode>(type: NodeType, audioContext: AudioContext, options?: any): T
releaseNode(node: AudioNode): void
disposeNode(node: AudioNode): void

// Pool maintenance
cleanupPool(): void
clearPool(): void
getPoolStats(): EnhancedAudioNodePool['stats'] | null

// Batch operations
createNodeBatch<T extends AudioNode>(type: NodeType, audioContext: AudioContext, count: number, options?: any): T[]
releaseNodeBatch(nodes: AudioNode[]): void

// Configuration
updatePoolConfig(config: Partial<NodePoolConfig>): void
```

### Usage Example

```typescript
import { initializeNodePool, getPooledNode, releaseNode } from "@/utils";

// Initialize pool
const pool = initializeNodePool({ maxPoolSize: 64 });

// Get nodes from pool
const gainNode = getPooledNode<GainNode>("gain", audioContext);
const filterNode = getPooledNode<BiquadFilterNode>("filter", audioContext);

// Release nodes back to pool
releaseNode(gainNode);
releaseNode(filterNode);

// Get pool statistics
const stats = getPoolStats();
console.log(`Created: ${stats?.created}, Reused: ${stats?.reused}`);
```

## Logging and Error Reporting (`logger.ts`)

Centralized logging and error reporting utilities using loglevel for consistent logging across the application.

### Key Functions

```typescript
// Default logger instance
logger: loglevel.Logger

// Error reporting
reportError(error: Error, context?: Record<string, unknown>): void

// Logging methods (via logger)
logger.debug(message: string, ...args: any[]): void
logger.info(message: string, ...args: any[]): void
logger.warn(message: string, ...args: any[]): void
logger.error(message: string, ...args: any[]): void
```

### Usage Example

```typescript
import { logger, reportError } from "@/utils";

// Basic logging
logger.info("Audio context initialized");
logger.warn("Low memory detected");
logger.error("Failed to create audio node");

// Error reporting with context
try {
  const audioContext = new AudioContext();
} catch (error) {
  reportError(error, {
    component: "AudioEngine",
    operation: "context_creation",
  });
}

// Debug logging in development
logger.debug("Current audio state:", { nodes: 5, connections: 12 });
```

## Math/Signal Utilities (`signalUtils.ts`)

Utilities for signal processing, normalization, scaling, exponential/logarithmic scaling, dB conversion, and other math operations.

### Key Functions

```typescript
// dB conversion
linearToDb(linear: number): number
dbToLinear(db: number): number
linearToDbWithThreshold(linear: number, threshold?: number): number
dbToLinearWithThreshold(db: number, threshold?: number): number

// Normalization and clamping
normalize(value: number, fromRange: [number, number], toRange?: [number, number]): number
clamp(value: number, min: number, max: number): number
clampAmplitude(value: number): number
clampFrequency(value: number): number
clampMidiNote(value: number): number

// Scaling functions
exponentialScale(value: number, fromRange: [number, number], toRange: [number, number]): number
logarithmicScale(value: number, fromRange: [number, number], toRange: [number, number]): number
musicalScale(value: number, fromRange: [number, number], toRange: [number, number]): number

// Frequency calculations
calculateFrequency(baseFrequency: number, detuneSemitones?: number, pitchBend?: number, detuneCents?: number): number
calculateCents(frequency: number, referenceFrequency: number): number
applyCents(frequency: number, cents: number): number

// Audio analysis
calculateRMS(buffer: Float32Array): number
calculatePeak(buffer: Float32Array): number
calculateAverage(buffer: Float32Array): number

// Smoothing
smoothValue(currentValue: number, targetValue: number, smoothingCoefficient: number): number
smoothAudioParameter(param: AudioParam, targetValue: number, smoothingTime: number, audioContext: AudioContext): void

// Conversion utilities
msToSeconds(ms: number): number
secondsToMs(seconds: number): number
bpmToFrequency(bpm: number): number
frequencyToBpm(frequency: number): number
```

### Usage Example

```typescript
import {
  linearToDb,
  exponentialScale,
  calculateFrequency,
  smoothValue,
} from "@/utils";

// Convert linear amplitude to dB
const db = linearToDb(0.5); // Returns -6.02 dB

// Apply exponential scaling for filter cutoff
const cutoff = exponentialScale(0.5, [0, 1], [20, 20000]); // Returns ~2000 Hz

// Calculate frequency with detune and pitch bend
const freq = calculateFrequency(440, 2, 75, 50); // 440 Hz + 2 semitones + pitch bend + 50 cents

// Smooth value changes
const smoothed = smoothValue(currentValue, targetValue, 0.1);
```

## Audio Utilities (`audioUtils.ts`)

Core audio utilities for parameter clamping, node connections, gain management, and error handling.

### Key Functions

```typescript
// Parameter management
clampParameter(value: number, min: number, max: number): number

// Node connections
connectNodes(source: AudioNode, destination: AudioNode): void
disconnectNode(node: AudioNode): void

// Gain management
resetGain(gainNode: GainNode, value: number, audioContext: AudioContext): void
calculateGlideTime(glideTime: number): number
calculateVolume(volume: number, volumeBoost: number): number

// Error handling
handleNodeCreationError(nodeType: string, error: Error, context?: ErrorContext): AudioError
handleParameterError(parameterName: string, value: number, error: Error, context?: ErrorContext): AudioError
safeSetAudioParameter(param: AudioParam, value: number, startTime: number): boolean
logError(error: AudioError | Error | string, context?: ErrorContext): void
logWarning(message: string, context?: ErrorContext): void
```

### Usage Example

```typescript
import {
  clampParameter,
  connectNodes,
  resetGain,
  safeSetAudioParameter,
} from "@/utils";

// Clamp parameter values
const safeValue = clampParameter(userInput, 0, 100);

// Safely connect audio nodes
connectNodes(oscillator, gainNode);

// Reset gain with proper timing
resetGain(gainNode, 0.5, audioContext);

// Safely set audio parameters
const success = safeSetAudioParameter(
  oscillator.frequency,
  440,
  audioContext.currentTime
);
```

## State Conversion Utilities (`stateConversionUtils.ts`)

Utilities for parsing and converting state values with validation and fallbacks.

### Key Functions

```typescript
// Parsing with validation
parseAndClamp(value: string | null, min: number, max: number, defaultValue: number): number
parseOrDefault(value: string | null, defaultValue: number): number
```

### Usage Example

```typescript
import { parseAndClamp, parseOrDefault } from "@/utils";

// Parse with range validation
const volume = parseAndClamp(urlParam, 0, 10, 5);

// Parse with fallback
const frequency = parseOrDefault(urlParam, 440);
```

## URL State Management (`urlUtils.ts`)

Functions for saving and loading synth state to/from URL parameters for sharing and persistence.

### Key Functions

```typescript
// State serialization
saveStateToURL(state: SynthState): string
loadStateFromURL(): Partial<SynthState> | null

// URL management
updateURLWithState(state: SynthState): void
copyURLToClipboard(state: SynthState): Promise<void>
```

### Usage Example

```typescript
import { saveStateToURL, loadStateFromURL, updateURLWithState } from "@/utils";

// Save state to URL
const urlParams = saveStateToURL(currentState);

// Load state from URL
const savedState = loadStateFromURL();
if (savedState) {
  // Apply saved state
}

// Update browser URL
updateURLWithState(currentState);
```

## Preset Conversion (`presetConversionUtils.ts`)

Utilities for converting preset data to the format expected by the synth store.

### Key Functions

```typescript
// Preset conversion
convertPresetToStoreFormat(preset: Preset): Partial<SynthState>
```

### Usage Example

```typescript
import { convertPresetToStoreFormat } from "@/utils";

// Convert preset to store format
const storeState = convertPresetToStoreFormat(presetData);
```

## UI/Formatting Utilities

### CSS Utilities (`cssUtils.tsx`)

Utilities for combining CSS classes and styles with conditional logic.

#### Key Functions

```typescript
// Class name utilities
cn(...inputs: ClassValue[]): string
cssModule(styles: Record<string, string>, ...classes: (string | boolean | undefined | null)[]): string
combineStyles(...styleObjects: (Record<string, string> | undefined | null)[]): Record<string, string>
```

#### Usage Example

```typescript
import { cn, cssModule, combineStyles } from "@/utils";

// Combine class names
const className = cn(
  "base-class",
  isActive && "active",
  isDisabled && "disabled"
);

// CSS modules with conditions
const buttonClass = cssModule(
  styles,
  "button",
  isPrimary && "primary",
  isLarge && "large"
);

// Combine style objects
const combinedStyles = combineStyles(
  baseStyles,
  conditionalStyles,
  themeStyles
);
```

### Text Utilities (`textUtils.tsx`)

Simple text manipulation utilities.

#### Key Functions

```typescript
// Text formatting
slugify(str: string): string
```

#### Usage Example

```typescript
import { slugify } from "@/utils";

// Convert text to slug
const slug = slugify("Hello World"); // Returns "hello-world"
```

### Parameter Mapping Utilities (`paramMappingUtils.ts`)

Utilities for mapping control values to audio parameters with appropriate curves.

#### Key Functions

```typescript
// Envelope mapping
mapEnvelopeTime(value: number): number

// Filter mapping
mapCutoff(val: number): number
mapContourAmount(val: number): number
```

#### Usage Example

```typescript
import { mapEnvelopeTime, mapCutoff, mapContourAmount } from "@/utils";

// Map envelope time
const attackTime = mapEnvelopeTime(5); // Returns ~0.5 seconds

// Map filter cutoff
const cutoffFreq = mapCutoff(2); // Returns frequency in Hz

// Map contour amount
const contour = mapContourAmount(5); // Returns octaves
```

### Knob Mapping Utilities (`knobMappingUtils.ts`)

Utilities for mapping knob positions to envelope values and vice versa.

#### Key Functions

```typescript
// Envelope range conversion
msToEnvelopeRange(ms: number): number
envelopeRangeToMs(range: number): number

// Knob position mapping
knobPosToValue(pos: number, stops?: Stop[]): number
valueToKnobPos(value: number, stops?: Stop[]): number
```

#### Usage Example

```typescript
import { knobPosToValue, valueToKnobPos } from "@/utils";

// Convert knob position to envelope value
const envelopeValue = knobPosToValue(knobPosition);

// Convert envelope value to knob position
const knobPosition = valueToKnobPos(envelopeValue);
```

### Envelope Utilities (`envelopeUtils.ts`)

Utilities for scheduling envelope automation on audio parameters.

#### Key Functions

```typescript
// Envelope scheduling
scheduleEnvelopeAttack(param: AudioParam, options: EnvelopeOptions): void
scheduleEnvelopeDecay(param: AudioParam, options: EnvelopeOptions): void
scheduleEnvelopeRelease(param: AudioParam, options: EnvelopeOptions): void
```

#### Usage Example

```typescript
import { scheduleEnvelopeAttack } from "@/utils";

// Schedule envelope attack
scheduleEnvelopeAttack(gainNode.gain, {
  start: 0,
  peak: 1,
  attackTime: 0.1,
  now: audioContext.currentTime,
});
```

### Frequency Utilities (`frequencyUtils.ts`)

Utilities for frequency calculations and conversions.

#### Key Functions

```typescript
// Frequency calculation
calculateFrequency(note: string, detuneSemitones?: number, pitchBend?: number): number
```

#### Usage Example

```typescript
import { calculateFrequency } from "@/utils";

// Calculate frequency with detune and pitch bend
const frequency = calculateFrequency("A4", 2, 75);
```

### Signal Processing Utilities (`signalUtils.ts`)

Comprehensive signal processing utilities for audio analysis and manipulation.

#### Key Functions

```typescript
// Clamping and validation
clamp(value: number, min: number, max: number): number
clampAmplitude(value: number): number
clampFrequency(value: number): number
clampMidiNote(value: number): number

// Scaling functions
logarithmicScale(value: number, fromRange: [number, number], toRange: [number, number]): number
musicalScale(value: number, fromRange: [number, number], toRange: [number, number]): number

// Audio analysis
calculateRMS(buffer: Float32Array): number
calculatePeak(buffer: Float32Array): number
calculateAverage(buffer: Float32Array): number

// Smoothing
smoothValue(currentValue: number, targetValue: number, smoothingCoefficient: number): number
smoothAudioParameter(param: AudioParam, targetValue: number, smoothingTime: number, audioContext: AudioContext): void

// Conversion utilities
msToSeconds(ms: number): number
secondsToMs(seconds: number): number
bpmToFrequency(bpm: number): number
frequencyToBpm(frequency: number): number
```

#### Usage Example

```typescript
import { clamp, logarithmicScale, calculateRMS, smoothValue } from "@/utils";

// Clamp values
const safeValue = clamp(input, 0, 100);

// Apply logarithmic scaling
const scaledValue = logarithmicScale(0.5, [0, 1], [20, 20000]);

// Calculate RMS
const rms = calculateRMS(audioBuffer);

// Smooth value changes
const smoothed = smoothValue(current, target, 0.1);
```

```typescript
// Frequency formatting
formatFrequency(frequency: number, decimals?: number): string
formatFrequencyAsNote(frequency: number, referenceFrequency?: number): string
formatFrequencyRange(minFreq: number, maxFreq: number): string

// Time formatting
formatTime(timeMs: number, decimals?: number): string
formatTimeSeconds(seconds: number, decimals?: number): string
formatDuration(seconds: number): string
formatTimeRange(minTime: number, maxTime: number): string

// Volume and amplitude formatting
formatVolume(volume: number, decimals?: number): string
formatDecibels(db: number, decimals?: number): string
formatPercentage(value: number, decimals?: number): string

// MIDI formatting
formatMidiNote(midiNote: number): string
formatPitchBend(bend: number, decimals?: number): string
formatVelocity(velocity: number): string
formatControlChange(value: number): string

// General formatting
formatNumber(value: number, decimals?: number): string
formatSmartNumber(value: number): string
formatKnobValue(value: number, unit?: string, decimals?: number): string
formatRange(min: number, max: number, unit?: string): string

// Display utilities
formatDisplayValue(value: number, step: number, unit?: string, valueLabels?: Record<number, string>): string
createCompactLabel(value: number, maxLength?: number): string
formatTooltipValue(value: number, type?: "frequency" | "time" | "volume" | "percentage" | "number"): string

// Audio parameter formatting
formatAudioParameter(param: AudioParam, value: number, unit?: string): string
formatMidiMessage(data: Uint8Array): string
```

### Usage Example

```typescript
import {
  formatFrequency,
  formatTime,
  formatVolume,
  formatMidiNote,
} from "@/utils";

// Format frequency for display
const freqDisplay = formatFrequency(1234.56); // Returns "1.2 kHz"

// Format time for display
const timeDisplay = formatTime(1500); // Returns "1.50 s"

// Format volume for display
const volumeDisplay = formatVolume(0.75); // Returns "75.0%"

// Format MIDI note for display
const noteDisplay = formatMidiNote(69); // Returns "A4"

// Format knob value with unit
const knobDisplay = formatKnobValue(5.5, "Hz", 1); // Returns "5.5 Hz"
```

## Test Utilities

### Browser-Safe Test Utilities (`testUtils.ts`)

Mocks, test helpers, and setup functions that are safe to import in browser environments:

#### Key Functions

```typescript
// Mock creation
createMockAudioContext(): MockAudioContext
createMockGainNode(context: MockAudioContext): MockGainNode
createMockOscillatorNode(context: MockAudioContext): MockOscillatorNode
createMockBiquadFilterNode(context: MockAudioContext): MockBiquadFilterNode
createMockAnalyserNode(context: MockAudioContext): MockAnalyserNode
createMockAudioWorkletNode(context: MockAudioContext): MockAudioWorkletNode
createMockAudioParam(value?: number, minValue?: number, maxValue?: number, defaultValue?: number): MockAudioParam

// MIDI mocks
createMockMIDIAccess(): any
createMockMIDIInput(id: string, name: string): any
createMockMIDIMessage(type: number, channel: number, data1: number, data2: number): Uint8Array

// Setup functions
setupAudioMocks(): MockAudioContext
setupMIDIMocks(): void
setupMediaDevicesMocks(): void
setupMatchMediaMock(): void
setupClipboardMock(): void
setupAllMocks(): MockAudioContext

// Test helpers
customRender(ui: React.ReactElement, options?: RenderOptions): any
waitForTimeout(ms: number): Promise<void>
waitForNextTick(): Promise<void>
waitForCondition(condition: () => boolean, timeout?: number): Promise<void>

// Mock cleanup (no-op in non-test environments)
clearAllMocks(): void
resetAllMocks(): void
restoreAllMocks(): void

// Test data generators
generateMockAudioBuffer(length?: number, numberOfChannels?: number, sampleRate?: number): AudioBuffer
generateMockFloat32Array(length?: number): Float32Array
generateMockUint8Array(length?: number): Uint8Array

// Test assertions (no-op in non-test environments)
expectAudioNodeToBeConnected(node: MockAudioNode, destination: MockAudioNode, outputIndex?: number, inputIndex?: number): void
expectAudioNodeToBeDisconnected(node: MockAudioNode): void
expectAudioParamToBeSet(param: MockAudioParam, value: number, time?: number): void
expectWorkletToReceiveMessage(worklet: MockAudioWorkletNode, message: any): void
```

### Vitest-Specific Utilities (`vitestUtils.ts`)

**⚠️ IMPORTANT: Only import this file in test files, not in browser code!**

Enhanced test utilities with full Vitest integration including spies and mocks:

#### Key Functions

```typescript
// Vitest exports
vi, describe, it, expect, beforeEach, afterEach

// Spy-enabled mock creation
createMockAudioContextWithSpies(): MockAudioContext
createMockAudioNodeWithSpies(context: MockAudioContext): MockAudioNode
createMockAudioParamWithSpies(value?: number, minValue?: number, maxValue?: number, defaultValue?: number): MockAudioParam

// Enhanced setup with spies
setupAudioMocksWithSpies(): MockAudioContext
setupMIDIMocksWithSpies(): void
setupMediaDevicesMocksWithSpies(): void
setupMatchMediaMockWithSpies(): void
setupClipboardMockWithSpies(): void
setupAllMocksWithSpies(): MockAudioContext

// Enhanced assertions with expect()
expectAudioNodeToBeConnected(node: MockAudioNode, destination: MockAudioNode, outputIndex?: number, inputIndex?: number): void
expectAudioNodeToBeDisconnected(node: MockAudioNode): void
expectAudioParamToBeSet(param: MockAudioParam, value: number, time?: number): void
expectWorkletToReceiveMessage(worklet: MockAudioWorkletNode, message: any): void

// Test lifecycle helpers
beforeEachTestWithSpies(): MockAudioContext
afterEachTestWithSpies(): void
```

### Usage Examples

#### Browser-Safe Test Utilities

```typescript
import { setupAllMocks, createMockAudioContext, customRender } from "@/utils";

describe("Audio Component", () => {
  let mockContext: MockAudioContext;

  beforeEach(() => {
    mockContext = setupAllMocks();
  });

  it("should create and connect audio nodes", () => {
    const { result } = customRender(<AudioComponent />);

    const gainNode = mockContext.createGain();
    const oscillatorNode = mockContext.createOscillator();

    // These functions are no-op in non-test environments
    expectAudioNodeToBeConnected(oscillatorNode, gainNode);
  });
});
```

#### Vitest-Specific Utilities (Test Files Only)

```typescript
// In test files only:
import {
  vi,
  describe,
  it,
  expect,
  createMockAudioContextWithSpies,
  setupAllMocksWithSpies,
  expectAudioNodeToBeConnected,
} from "@/utils/vitestUtils";

describe("Audio Tests", () => {
  beforeEach(() => {
    setupAllMocksWithSpies();
  });

  it("should connect audio nodes", () => {
    const context = createMockAudioContextWithSpies();
    const gain = context.createGain();
    const osc = context.createOscillator();

    gain.connect(osc);

    // Full assertion capabilities with expect()
    expectAudioNodeToBeConnected(gain, osc);
    expect(gain.connect).toHaveBeenCalledWith(osc);
  });
});
```

## Integration Examples

### Using Multiple Utilities Together

```typescript
import {
  midiNoteToFrequency,
  velocityToGain,
  safeSetAudioParameter,
  logger,
  reportError,
} from "@/utils";

function handleMIDINoteOn(midiNote: number, velocity: number) {
  try {
    // Convert MIDI data to audio parameters
    const frequency = midiNoteToFrequency(midiNote);
    const gain = velocityToGain(velocity);

    // Safely set audio parameters
    const freqSuccess = safeSetAudioParameter(oscillator.frequency, frequency);
    const gainSuccess = safeSetAudioParameter(gainNode.gain, gain);

    if (!freqSuccess || !gainSuccess) {
      logger.warn("Failed to set audio parameters", {
        midiNote,
        velocity,
        frequency,
      });
    }
  } catch (error) {
    reportError(error, {
      component: "MIDIHandler",
      operation: "note_on",
      midiNote,
      velocity,
    });
  }
}
```

### Audio Node Pooling with Error Handling

```typescript
import { getPooledNode, releaseNode, logger, reportError } from "@/utils";

function createAudioChain(audioContext: AudioContext) {
  try {
    // Get nodes from pool
    const gainNode = getPooledNode("gain", audioContext) as GainNode;
    const filterNode = getPooledNode(
      "filter",
      audioContext
    ) as BiquadFilterNode;

    // Connect nodes
    gainNode.connect(filterNode);
    filterNode.connect(audioContext.destination);

    logger.info("Audio chain created successfully");

    return { gainNode, filterNode };
  } catch (error) {
    reportError(error, {
      component: "AudioChain",
      operation: "creation",
    });
    return null;
  }
}

function cleanupAudioChain(nodes: {
  gainNode: GainNode;
  filterNode: BiquadFilterNode;
}) {
  // Release nodes back to pool
  releaseNode(nodes.gainNode);
  releaseNode(nodes.filterNode);
}
```

### URL State Management

```typescript
import {
  saveStateToURL,
  loadStateFromURL,
  updateURLWithState,
  logger,
} from "@/utils";

function saveCurrentState(synthState: SynthState) {
  try {
    // Save to URL
    updateURLWithState(synthState);

    // Log success
    logger.info("State saved to URL");
  } catch (error) {
    logger.error("Failed to save state to URL", error);
  }
}

function loadSavedState(): Partial<SynthState> | null {
  try {
    const savedState = loadStateFromURL();
    if (savedState) {
      logger.info("State loaded from URL");
      return savedState;
    }
  } catch (error) {
    logger.error("Failed to load state from URL", error);
  }
  return null;
}
```

## Best Practices

1. **Import from index**: Always import utilities from `@/utils` rather than individual files
2. **Use type safety**: Leverage TypeScript types for better development experience
3. **Handle errors**: Use error handling utilities for consistent error management
4. **Format consistently**: Use formatting utilities for consistent UI presentation
5. **Test thoroughly**: Use test utilities to create robust, maintainable tests
6. **Pool resources**: Use audio node pooling for better performance
7. **Validate inputs**: Use validation functions before processing data

## Contributing

When adding new utilities:

1. Place them in the appropriate category file
2. Add comprehensive JSDoc comments
3. Include TypeScript types
4. Add unit tests
5. Update this README with usage examples
6. Export from the main index file
