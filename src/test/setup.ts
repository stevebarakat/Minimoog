import "@testing-library/jest-dom";
import { vi } from "vitest";
import { AUDIO } from "@/config";

if (typeof global.GainNode === "undefined") {
  // @ts-expect-error - Mock for testing
  global.GainNode = class MockGainNode {};
}

global.navigator.requestMIDIAccess = vi.fn().mockResolvedValue({
  inputs: new Map(),
  onstatechange: null,
});

Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

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

function createGainNodeMock() {
  return {
    gain: createAudioParamMock(),
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null as unknown, // Will be set by AudioContext
  };
}

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

function createAnalyserNodeMock() {
  return {
    fftSize: AUDIO.TEST_FFT_SIZE,
    frequencyBinCount: AUDIO.TEST_FREQUENCY_BIN_COUNT,
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

function createWaveShaperNodeMock() {
  return {
    curve: null,
    oversample: "none",
    connect: vi.fn(),
    disconnect: vi.fn(),
    context: null as unknown, // Will be set by AudioContext
  };
}

function createAudioContextMock() {
  const context = {
    sampleRate: AUDIO.TEST_SAMPLE_RATE,
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

    close: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),

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
