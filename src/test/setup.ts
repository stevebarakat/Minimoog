// Vitest setup file
import "@testing-library/jest-dom";
import { vi } from "vitest";

// Mock Web Audio API for jsdom
if (typeof global.GainNode === "undefined") {
  // @ts-expect-error - Mock for testing
  global.GainNode = class MockGainNode {};
}

// Mock navigator.requestMIDIAccess for MIDI tests
global.navigator.requestMIDIAccess = vi.fn().mockResolvedValue({
  inputs: new Map(),
  onstatechange: null,
});

// Create a comprehensive AudioParam mock
function createAudioParamMock() {
  return {
    value: 0,
    setValueAtTime: vi.fn(),
    linearRampToValueAtTime: vi.fn(),
    exponentialRampToValueAtTime: vi.fn(),
    setTargetAtTime: vi.fn(),
    setValueCurveAtTime: vi.fn(),
    cancelScheduledValues: vi.fn(),
    cancelAndHoldAtTime: vi.fn(),
  };
}

// Create a comprehensive GainNode mock
function createGainNodeMock() {
  return {
    gain: createAudioParamMock(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null as unknown, // Will be set by AudioContext
  };
}

// Create a comprehensive OscillatorNode mock
function createOscillatorNodeMock() {
  return {
    frequency: createAudioParamMock(),
    detune: createAudioParamMock(),
    type: "sine",
    connect: vi.fn(),
    disconnect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
    context: null as unknown, // Will be set by AudioContext
  };
}

// Create a comprehensive BiquadFilterNode mock
function createBiquadFilterNodeMock() {
  return {
    frequency: createAudioParamMock(),
    detune: createAudioParamMock(),
    Q: createAudioParamMock(),
    gain: createAudioParamMock(),
    type: "lowpass",
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null as unknown, // Will be set by AudioContext
  };
}

// Create a comprehensive AnalyserNode mock
function createAnalyserNodeMock() {
  return {
    fftSize: 2048,
    frequencyBinCount: 1024,
    minDecibels: -100,
    maxDecibels: -30,
    smoothingTimeConstant: 0.8,
    connect: vi.fn(),
    disconnect: vi.fn(),
    getByteFrequencyData: vi.fn(),
    getByteTimeDomainData: vi.fn(),
    getFloatFrequencyData: vi.fn(),
    getFloatTimeDomainData: vi.fn(),
    context: null as unknown, // Will be set by AudioContext
  };
}

// Create a comprehensive MediaElementAudioSourceNode mock
function createMediaElementAudioSourceNodeMock() {
  return {
    mediaElement: null,
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null as unknown, // Will be set by AudioContext
  };
}

// Create a comprehensive AudioWorkletNode mock
function createAudioWorkletNodeMock() {
  return {
    port: {
      postMessage: vi.fn(),
      onmessage: null,
    },
    parameters: {
      get: vi.fn(() => createAudioParamMock()),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null as unknown, // Will be set by AudioContext
  };
}

// Create a comprehensive WaveShaperNode mock
function createWaveShaperNodeMock() {
  return {
    curve: null,
    oversample: "none",
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null as unknown, // Will be set by AudioContext
  };
}

// Create a comprehensive AudioContext mock
function createAudioContextMock() {
  const context = {
    // Properties
    sampleRate: 44100,
    currentTime: 0,
    state: "running",
    baseLatency: 0.005,
    outputLatency: 0.005,
    destination: {
      connect: vi.fn(),
      disconnect: vi.fn(),
    },
    audioWorklet: {
      addModule: vi.fn().mockResolvedValue(undefined),
    },

    // Methods
    createGain: vi.fn(() => {
      const gainNode = createGainNodeMock();
      gainNode.context = context;
      return gainNode;
    }),

    createOscillator: vi.fn(() => {
      const oscillator = createOscillatorNodeMock();
      oscillator.context = context;
      return oscillator;
    }),

    createBiquadFilter: vi.fn(() => {
      const filter = createBiquadFilterNodeMock();
      filter.context = context;
      return filter;
    }),

    createAnalyser: vi.fn(() => {
      const analyser = createAnalyserNodeMock();
      analyser.context = context;
      return analyser;
    }),

    createMediaElementSource: vi.fn(() => {
      const source = createMediaElementAudioSourceNodeMock();
      source.context = context;
      return source;
    }),

    createAudioWorklet: vi.fn(() => {
      const worklet = createAudioWorkletNodeMock();
      worklet.context = context;
      return worklet;
    }),

    createWaveShaper: vi.fn(() => {
      const waveShaper = createWaveShaperNodeMock();
      waveShaper.context = context;
      return waveShaper;
    }),

    // AudioContext lifecycle methods
    close: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),

    // Legacy method for compatibility
    addModule: vi.fn().mockResolvedValue(undefined),
  };

  return context;
}

// Mock AudioContext constructor globally
const MockAudioContext = vi.fn(() => createAudioContextMock());

// Apply the mock globally
Object.defineProperty(global, "AudioContext", {
  value: MockAudioContext,
  writable: true,
});

Object.defineProperty(window, "AudioContext", {
  value: MockAudioContext,
  writable: true,
});

// Extend Window interface for webkit prefix
declare global {
  interface Window {
    webkitAudioContext?: typeof AudioContext;
  }
}

// Mock window.AudioContext if not available
if (!window.AudioContext && window.webkitAudioContext) {
  window.AudioContext = window.webkitAudioContext as typeof AudioContext;
}
