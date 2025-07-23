// Comprehensive Audio Types for Web Audio API

// Audio Context Types
export type AudioContextState = "suspended" | "running" | "closed";
export type AudioContextLatencyHint = "interactive" | "balanced" | "playback";

// Audio Node Types
export type AudioNodeType =
  | "OscillatorNode"
  | "GainNode"
  | "BiquadFilterNode"
  | "AnalyserNode"
  | "AudioWorkletNode"
  | "MediaStreamAudioSourceNode"
  | "AudioDestinationNode"
  | "WaveShaperNode"
  | "DelayNode"
  | "ConvolverNode"
  | "DynamicsCompressorNode"
  | "ChannelSplitterNode"
  | "ChannelMergerNode"
  | "IIRFilterNode"
  | "StereoPannerNode"
  | "PannerNode";

// Audio Parameter Types
export type AudioParamAutomationRate = "a-rate" | "k-rate";

export interface AudioParamDescriptor {
  name: string;
  defaultValue: number;
  minValue?: number;
  maxValue?: number;
  automationRate?: AudioParamAutomationRate;
}

// Oscillator Types
export type OscillatorType =
  | "sine"
  | "square"
  | "sawtooth"
  | "triangle"
  | "custom";
export type OscillatorWaveform =
  | "triangle"
  | "tri_saw"
  | "sawtooth"
  | "rev_saw"
  | "pulse1"
  | "pulse2"
  | "pulse3";

export type OscillatorRange = "32" | "16" | "8" | "4" | "2" | "lo";

// Filter Types
export type BiquadFilterType =
  | "lowpass"
  | "highpass"
  | "bandpass"
  | "lowshelf"
  | "highshelf"
  | "peaking"
  | "notch"
  | "allpass";

// Audio Worklet Types
export interface AudioWorkletProcessorOptions {
  numberOfInputs: number;
  numberOfOutputs: number;
  outputChannelCount?: number[];
  processorOptions?: Record<string, unknown>;
}

// Audio Node Connection Types
export type AudioNodeConnection = {
  source: AudioNode;
  destination: AudioNode;
  outputIndex?: number;
  inputIndex?: number;
};

// Audio Parameter Update Types
export type AudioParamUpdateMethod =
  | "setValueAtTime"
  | "linearRampToValueAtTime"
  | "exponentialRampToValueAtTime"
  | "setTargetAtTime"
  | "setValueCurveAtTime"
  | "cancelScheduledValues"
  | "cancelAndHoldAtTime";

export interface AudioParamUpdate {
  method: AudioParamUpdateMethod;
  value: number;
  time?: number;
  duration?: number;
  curve?: Float32Array;
}

// Audio Context Configuration
export interface AudioContextOptions {
  latencyHint?: AudioContextLatencyHint;
  sampleRate?: number;
}

// Audio Node Factory Types
export interface AudioNodeFactory {
  createOscillator: (context: AudioContext) => OscillatorNode;
  createGain: (context: AudioContext) => GainNode;
  createBiquadFilter: (context: AudioContext) => BiquadFilterNode;
  createAnalyser: (context: AudioContext) => AnalyserNode;
  createAudioWorklet: (
    context: AudioContext,
    name: string,
    options?: AudioWorkletProcessorOptions
  ) => AudioWorkletNode;
  createMediaStreamSource: (
    context: AudioContext,
    stream: MediaStream
  ) => MediaStreamAudioSourceNode;
  createWaveShaper: (context: AudioContext) => WaveShaperNode;
  createDelay: (context: AudioContext, maxDelayTime?: number) => DelayNode;
  createConvolver: (context: AudioContext) => ConvolverNode;
  createDynamicsCompressor: (context: AudioContext) => DynamicsCompressorNode;
  createChannelSplitter: (
    context: AudioContext,
    numberOfOutputs?: number
  ) => ChannelSplitterNode;
  createChannelMerger: (
    context: AudioContext,
    numberOfInputs?: number
  ) => ChannelMergerNode;
  createIIRFilter: (
    context: AudioContext,
    feedforward: number[],
    feedback: number[]
  ) => IIRFilterNode;
  createStereoPanner: (context: AudioContext) => StereoPannerNode;
  createPanner: (context: AudioContext) => PannerNode;
}

// Audio Processing Types
export interface AudioProcessingEvent {
  inputBuffer: AudioBuffer;
  outputBuffer: AudioBuffer;
  playbackTime: number;
}

// Audio Buffer Types
export interface AudioBufferOptions {
  length: number;
  sampleRate: number;
  numberOfChannels: number;
}

// Audio Node State Types
export interface AudioNodeState {
  type: AudioNodeType;
  context: AudioContext;
  numberOfInputs: number;
  numberOfOutputs: number;
  channelCount: number;
  channelCountMode: ChannelCountMode;
  channelInterpretation: ChannelInterpretation;
}

// Audio Parameter State
export interface AudioParamState {
  value: number;
  defaultValue: number;
  minValue: number;
  maxValue: number;
  automationRate: AudioParamAutomationRate;
}

// Audio Graph Types
export interface AudioGraphNode {
  id: string;
  node: AudioNode;
  type: AudioNodeType;
  connections: AudioNodeConnection[];
  parameters: Record<string, AudioParamState>;
}

export interface AudioGraph {
  nodes: Map<string, AudioGraphNode>;
  context: AudioContext;
  connections: AudioNodeConnection[];
}

// Audio Performance Types
export interface AudioPerformanceMetrics {
  sampleRate: number;
  currentTime: number;
  baseLatency: number;
  outputLatency: number;
  state: AudioContextState;
}

// Audio Error Types
export interface AudioError extends Error {
  name: "AudioError";
  code: string;
  context?: string;
}

// Audio Event Types
export interface AudioContextStateChangeEvent extends Event {
  type: "statechange";
  target: AudioContext;
}

// Audio Parameter Mapping Types
export interface AudioParameterMapping {
  sourceValue: number;
  sourceRange: [number, number];
  targetRange: [number, number];
  curve?: "linear" | "exponential" | "logarithmic" | "custom";
  customCurve?: (value: number) => number;
}

// Audio Node Pool Types
export interface AudioNodePoolConfig {
  maxNodes: number;
  nodeType: AudioNodeType;
  preallocate: boolean;
}

export interface AudioNodePool {
  get: (context: AudioContext) => AudioNode;
  release: (node: AudioNode) => void;
  clear: () => void;
  getStats: () => { total: number; available: number; inUse: number };
}

// Audio Worklet Processor Types
export interface AudioWorkletProcessor {
  readonly port: MessagePort;
  process(
    inputs: Float32Array[][],
    outputs: Float32Array[][],
    parameters: Record<string, Float32Array>
  ): boolean;
}

// Audio Stream Types
export interface AudioStreamConfig {
  sampleRate: number;
  channelCount: number;
  bufferSize: number;
}

// Audio Analysis Types
export interface AudioAnalysisResult {
  frequency: Float32Array;
  timeDomain: Float32Array;
  rms: number;
  peak: number;
  zeroCrossings: number;
}

// Audio Envelope Types
export interface AudioEnvelope {
  attack: number;
  decay: number;
  sustain: number;
  release: number;
}

// Audio Modulation Types
export interface AudioModulation {
  source: AudioNode;
  destination: AudioParam;
  amount: number;
  type: "additive" | "multiplicative";
}

// Audio Effect Types
export interface AudioEffect {
  type: "reverb" | "delay" | "distortion" | "chorus" | "flanger" | "phaser";
  parameters: Record<string, AudioParamState>;
  enabled: boolean;
  wet: number;
  dry: number;
}

// Audio Mixer Types
export interface AudioMixerChannel {
  id: string;
  input: AudioNode;
  output: AudioNode;
  gain: AudioParam;
  pan: AudioParam;
  effects: AudioEffect[];
  enabled: boolean;
  solo: boolean;
  mute: boolean;
}

export interface AudioMixer {
  channels: Map<string, AudioMixerChannel>;
  master: AudioMixerChannel;
  auxSends: Map<string, AudioMixerChannel>;
}

// Audio Routing Types
export interface AudioRoute {
  source: string;
  destination: string;
  gain: number;
  enabled: boolean;
}

export interface AudioRoutingMatrix {
  routes: AudioRoute[];
  addRoute: (route: AudioRoute) => void;
  removeRoute: (source: string, destination: string) => void;
  getRoute: (source: string, destination: string) => AudioRoute | undefined;
}

// Audio Parameter Automation Types
export interface AudioParameterAutomation {
  parameter: AudioParam;
  events: Array<{
    time: number;
    value: number;
    type: AudioParamUpdateMethod;
  }>;
  startTime: number;
  duration: number;
}

// Audio Context Lifecycle Types
export interface AudioContextLifecycle {
  initialize: () => Promise<void>;
  suspend: () => Promise<void>;
  resume: () => Promise<void>;
  close: () => Promise<void>;
  getState: () => AudioContextState;
}

// Audio Node Lifecycle Types
export interface AudioNodeLifecycle {
  create: () => AudioNode;
  connect: (
    destination: AudioNode,
    outputIndex?: number,
    inputIndex?: number
  ) => void;
  disconnect: (
    destination?: AudioNode,
    outputIndex?: number,
    inputIndex?: number
  ) => void;
  destroy: () => void;
}

// Audio Parameter Lifecycle Types
export interface AudioParameterLifecycle {
  setValue: (value: number, time?: number) => void;
  scheduleValue: (time: number, value: number) => void;
  cancelScheduledValues: (startTime: number) => void;
  getValueAtTime: (time: number) => number;
}

// Audio Performance Monitoring Types
export interface AudioPerformanceMonitor {
  getMetrics: () => AudioPerformanceMetrics;
  getNodeCount: () => number;
  getConnectionCount: () => number;
  getMemoryUsage: () => number;
  getCPUUsage: () => number;
}

// Audio Error Handling Types
export interface AudioErrorHandler {
  handleError: (error: AudioError) => void;
  handleWarning: (warning: string) => void;
  handleContextLoss: () => void;
  handleContextRestore: () => void;
}

// Audio Configuration Types
export interface AudioConfiguration {
  context: AudioContextOptions;
  nodes: Record<string, AudioNode>;
  routing: AudioRoutingMatrix;
  effects: AudioEffect[];
  performance: AudioPerformanceMonitor;
  errorHandling: AudioErrorHandler;
}

// Audio State Management Types
export interface AudioState {
  context: AudioContext | null;
  nodes: Map<string, AudioNode>;
  connections: AudioNodeConnection[];
  parameters: Map<string, AudioParamState>;
  effects: AudioEffect[];
  routing: AudioRoutingMatrix;
  performance: AudioPerformanceMetrics;
}

// Audio Event Types
export type AudioEventType =
  | "nodeCreated"
  | "nodeDestroyed"
  | "nodeConnected"
  | "nodeDisconnected"
  | "parameterChanged"
  | "contextStateChanged"
  | "error"
  | "warning";

export interface AudioEvent {
  type: AudioEventType;
  timestamp: number;
  data: unknown;
  source: string;
}

// Audio Event Handler Types
export interface AudioEventHandler {
  onNodeCreated: (node: AudioNode) => void;
  onNodeDestroyed: (node: AudioNode) => void;
  onNodeConnected: (connection: AudioNodeConnection) => void;
  onNodeDisconnected: (connection: AudioNodeConnection) => void;
  onParameterChanged: (param: AudioParam, value: number) => void;
  onContextStateChanged: (state: AudioContextState) => void;
  onError: (error: AudioError) => void;
  onWarning: (warning: string) => void;
}

// Audio Utility Types
export interface AudioUtils {
  createNode: <T extends AudioNode>(
    type: AudioNodeType,
    context: AudioContext,
    options?: AudioWorkletProcessorOptions
  ) => T;
  connectNodes: (
    source: AudioNode,
    destination: AudioNode,
    outputIndex?: number,
    inputIndex?: number
  ) => void;
  disconnectNodes: (
    source: AudioNode,
    destination?: AudioNode,
    outputIndex?: number,
    inputIndex?: number
  ) => void;
  setParameter: (param: AudioParam, value: number, time?: number) => void;
  scheduleParameter: (
    param: AudioParam,
    time: number,
    value: number,
    method?: AudioParamUpdateMethod
  ) => void;
  createEnvelope: (context: AudioContext, envelope: AudioEnvelope) => AudioNode;
  createModulation: (
    source: AudioNode,
    destination: AudioParam,
    amount: number
  ) => AudioModulation;
  analyzeAudio: (node: AudioNode, bufferSize?: number) => AudioAnalysisResult;
  createEffect: (
    type: AudioEffect["type"],
    context: AudioContext
  ) => AudioEffect;
  createMixer: (context: AudioContext, channelCount?: number) => AudioMixer;
  createRoutingMatrix: () => AudioRoutingMatrix;
  createPerformanceMonitor: (context: AudioContext) => AudioPerformanceMonitor;
  createErrorHandler: () => AudioErrorHandler;
  createEventHandler: () => AudioEventHandler;
}
