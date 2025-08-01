// Global types that are used across multiple components
// These should be truly shared types, not component-specific ones

// Re-export commonly used store types for convenience
export type {
  SynthState,
  SynthActions,
  OscillatorWaveform,
  OscillatorRange,
  OscillatorState,
  MixerState,
  MixerSourceState,
  MixerNoiseState,
  MixerExternalState,
  Note,
} from "@/store/types/synth";

// Re-export commonly used utility types
export type {
  MIDINoteNumber,
  MIDIVelocity,
  MIDIControlValue,
  MIDIChannelNumber,
  MIDIProgramNumber,
  MIDIPitchBendValue,
  MIDIMessageType,
  MIDIControlChangeType,
  MIDIMessage,
  MIDINoteMessage,
  MIDIControlChangeMessage,
  MIDIPitchBendMessage,
} from "@/utils/midiUtils";

export type {
  NodeType,
  NodePoolConfig,
  AudioNodePool,
  PooledNode,
  EnhancedAudioNodePool,
} from "@/utils/nodePoolingUtils";

export type { ErrorContext, AudioError } from "@/utils/audioUtils";

// Re-export preset types
export type { Preset } from "@/data/presets";
