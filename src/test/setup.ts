import "@testing-library/jest-dom";
import { vi } from "vitest";
import { AUDIO } from "@/config";

if (typeof global.GainNode === "undefined") {
  // @ts-expect-error - Mock for testing
  global.GainNode = class MockGainNode {};
}

// Mock both old and new Web MIDI APIs for testing
global.navigator.requestMIDIAccess = vi.fn().mockResolvedValue({
  inputs: new Map(),
  onstatechange: null,
});

global.navigator.midi = {
  requestAccess: vi.fn().mockResolvedValue({
    inputs: new Map(),
    onstatechange: null,
  }),
  addEventListener: vi.fn(),
  removeEventListener: vi.fn(),
};

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
    setPeriodicWave: vi.fn(), // Add missing setPeriodicWave method
    customWave: null, // Track custom waveform
    context: null as unknown, // Will be set by AudioContext
  };
}

function createAnalyserNodeMock() {
  return {
    fftSize: 2048, // Standard test FFT size
    frequencyBinCount: 1024, // Standard test frequency bin count
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
    lastOscillatorFrequency: 440, // Track last oscillator frequency
    lastOscillatorType: "sine", // Track last oscillator type
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

      // Track frequency changes
      let freqValue = 440;
      Object.defineProperty(oscillator.frequency, "value", {
        get: () => freqValue,
        set: (val) => {
          freqValue = val;
          context.lastOscillatorFrequency = val;
        },
      });

      // Track type changes
      let oscType = "sine";
      Object.defineProperty(oscillator, "type", {
        get: () => oscType,
        set: (val) => {
          oscType = val;
          context.lastOscillatorType = val;
        },
      });

      // Track custom waveforms
      oscillator.setPeriodicWave = vi.fn((wave) => {
        oscillator.customWave = wave;
        context.lastOscillatorType = "custom";
      });

      return oscillator;
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

    createPeriodicWave: vi.fn(() => ({})),
    createChannelMerger: vi.fn(() => ({
      connect: vi.fn(),
      disconnect: vi.fn(),
      context: null as unknown,
    })),

    close: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    resume: vi.fn().mockResolvedValue(undefined),
  };

  return context;
}

// Mock AudioContext constructor globally
const MockAudioContext = vi.fn(() => createAudioContextMock());

// Create OfflineAudioContext mock that extends AudioContext
function createOfflineAudioContextMock(
  numberOfChannels: number,
  length: number,
  sampleRate: number
) {
  const context = createAudioContextMock();
  return {
    ...context,
    length,
    sampleRate,
    startRendering: vi.fn().mockResolvedValue({
      numberOfChannels,
      length,
      sampleRate,
      duration: length / sampleRate,
      getChannelData: vi.fn(() => {
        // Return a more realistic test signal based on the oscillator's frequency
        const data = new Float32Array(length);
        const actualFreq = context.lastOscillatorFrequency || 440; // Use actual frequency if set
        const oscType = context.lastOscillatorType || "sine";

        for (let i = 0; i < length; i++) {
          const t = i / sampleRate;
          const phase = 2 * Math.PI * actualFreq * t;

          switch (oscType) {
            case "sine":
              data[i] = Math.sin(phase);
              break;
            case "sawtooth": {
              // Sawtooth wave with harmonics
              let sawValue = 0;
              for (let h = 1; h <= 8; h++) {
                sawValue +=
                  (2 / (h * Math.PI)) *
                  Math.sin(h * phase) *
                  (h % 2 === 1 ? 1 : -1);
              }
              data[i] = sawValue * 0.5;
              break;
            }
            case "square": {
              // Square wave with odd harmonics
              let squareValue = 0;
              for (let h = 1; h <= 15; h += 2) {
                squareValue += (4 / (h * Math.PI)) * Math.sin(h * phase);
              }
              data[i] = squareValue * 0.3;
              break;
            }
            case "triangle": {
              // Triangle wave with odd harmonics
              let triValue = 0;
              for (let h = 1; h <= 15; h += 2) {
                const sign = ((h - 1) / 2) % 2 === 0 ? 1 : -1;
                triValue +=
                  sign *
                  (8 / (Math.PI * Math.PI * h * h)) *
                  Math.sin(h * phase);
              }
              data[i] = triValue;
              break;
            }
            case "custom": {
              // For custom waveforms, generate a complex signal with multiple harmonics
              // This simulates the effect of custom periodic waves
              let customValue = 0;
              // Generate a complex waveform with multiple harmonics to simulate custom periodic wave
              for (let h = 1; h <= 12; h++) {
                const amplitude = 1 / (h * h); // Decreasing amplitude for higher harmonics
                customValue += amplitude * Math.sin(h * phase + h * 0.1); // Add some phase variation
              }
              data[i] = customValue * 0.3;
              break;
            }
            default:
              data[i] = Math.sin(phase);
          }
        }
        return data;
      }),
    }),
  };
}

const MockOfflineAudioContext = vi.fn(
  (numberOfChannels: number, length: number, sampleRate: number) =>
    createOfflineAudioContextMock(numberOfChannels, length, sampleRate)
);

// Apply the mocks globally
Object.defineProperty(global, "AudioContext", {
  value: MockAudioContext,
  writable: true,
});

Object.defineProperty(window, "AudioContext", {
  value: MockAudioContext,
  writable: true,
});

Object.defineProperty(global, "OfflineAudioContext", {
  value: MockOfflineAudioContext,
  writable: true,
});

Object.defineProperty(window, "OfflineAudioContext", {
  value: MockOfflineAudioContext,
  writable: true,
});

// Mock AudioBuffer constructor
const MockAudioBuffer = vi.fn(
  (options: {
    numberOfChannels: number;
    length: number;
    sampleRate: number;
  }) => {
    const channels: Float32Array[] = [];
    for (let i = 0; i < options.numberOfChannels; i++) {
      channels.push(new Float32Array(options.length));
    }

    return {
      numberOfChannels: options.numberOfChannels,
      length: options.length,
      sampleRate: options.sampleRate,
      duration: options.length / options.sampleRate,
      getChannelData: vi.fn(
        (channel: number) =>
          channels[channel] || new Float32Array(options.length)
      ),
      copyFromChannel: vi.fn(),
      copyToChannel: vi.fn(),
    };
  }
);

Object.defineProperty(global, "AudioBuffer", {
  value: MockAudioBuffer,
  writable: true,
});

Object.defineProperty(window, "AudioBuffer", {
  value: MockAudioBuffer,
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

// Known JSDOM limitations:
// - setPointerCapture/releasePointerCapture are not implemented
// - AudioWorkletNode and addModule are not supported
// These are environmental limitations, not application bugs.
// Tests still validate correct component behavior despite these limitations.
