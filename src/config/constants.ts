/**
 * Centralized constants for the Minimoog synthesizer application
 * This file contains all hard-coded values that were previously scattered throughout the codebase
 */

export const AUDIO = {
  DEFAULT_SAMPLE_RATE: 44100,
  TEST_SAMPLE_RATE: 44100,

  DEFAULT_FFT_SIZE: 256,
  TEST_FFT_SIZE: 2048,
  DEFAULT_FREQUENCY_BIN_COUNT: 128,
  TEST_FREQUENCY_BIN_COUNT: 1024,

  MODULATION_BUFFER_SIZE_MULTIPLIER: 2, // 2 seconds

  EXTERNAL_INPUT_FFT_SIZE: 256,
  EXTERNAL_INPUT_FREQUENCY_BIN_COUNT: 128,

  DELAY: {
    DEFAULT_TIME: 0.3, // 300ms
    MIN_TIME: 0.001,
    MAX_TIME: 1.0,
    DEFAULT_FEEDBACK: 0.3, // 30%
    MIN_FEEDBACK: 0.0,
    MAX_FEEDBACK: 0.9,
    DEFAULT_MIX: 0.2, // 20%
    MIN_MIX: 0.0,
    MAX_MIX: 1.0,
  },

  MOOG_FILTER: {
    DEFAULT_CUTOFF: 1000,
    MIN_CUTOFF: 20,
    MAX_CUTOFF: 20000,
    DEFAULT_RESONANCE: 0.5,
    MIN_RESONANCE: 0,
    MAX_RESONANCE: 4.0,
    SMOOTHING_COEFFICIENT: 0.99,
    OVERSAMPLE_FACTOR: 4,
    TEMPERATURE_DRIFT: 0.001,
    COMPONENT_TOLERANCE: 0.005,
    THERMAL_NOISE: 0.0001,
  },

  PINK_NOISE: {
    B0_COEFF: 0.99886,
    B1_COEFF: 0.99332,
    B2_COEFF: 0.969,
    B3_COEFF: 0.8665,
    B4_COEFF: 0.55,
    B5_COEFF: -0.7616,
    B6_COEFF: 0.5362,
    WHITE_NOISE_WEIGHT: 0.11,
  },
} as const;

export const MIDI = {
  A4_FREQUENCY: 440,
  A4_MIDI_NOTE: 69,

  NOTE_NAMES: [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ] as const,

  // Octave ranges
  OCTAVE_RANGES: {
    "32": 32,
    "16": 16,
    "8": 8,
    "4": 4,
    "2": 2,
    lo: 1,
  } as const,

  // Frequency limits
  MIN_FREQUENCY: 20,
  MAX_FREQUENCY: 20000,

  MIN_DETUNE_SEMITONES: -12,
  MAX_DETUNE_SEMITONES: 12,
  MIN_MASTER_TUNE: -12,
  MAX_MASTER_TUNE: 12,
} as const;

export const SYNTH_PARAMS = {
  VOLUME: {
    MIN: 0,
    MAX: 10,
    DEFAULT: 5,
  },

  PITCH_WHEEL: {
    MIN: 0,
    MAX: 100,
    DEFAULT: 50,
  },

  MOD_WHEEL: {
    MIN: 0,
    MAX: 100,
    DEFAULT: 50,
  },

  MASTER_TUNE: {
    MIN: -12,
    MAX: 12,
    DEFAULT: 0,
  },

  FILTER: {
    CUTOFF: {
      MIN: -4,
      MAX: 4,
      DEFAULT: 0,
    },
    EMPHASIS: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 5,
    },
    CONTOUR_AMOUNT: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 5,
    },
    ATTACK: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 0.5,
    },
    DECAY: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 2.5,
    },
    SUSTAIN: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 5,
    },
  },

  LOUDNESS: {
    ATTACK: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 0.5,
    },
    DECAY: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 2.5,
    },
    SUSTAIN: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 8,
    },
  },

  GLIDE: {
    TIME: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 0.1,
    },
  },

  LFO: {
    RATE: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 5,
    },
  },

  MOD_MIX: {
    MIN: 0,
    MAX: 10,
    DEFAULT: 0,
  },

  EXTERNAL_INPUT: {
    VOLUME: {
      MIN: 0.001,
      MAX: 10,
      DEFAULT: 0,
    },
  },

  AUX_OUTPUT: {
    VOLUME: {
      MIN: 0,
      MAX: 10,
      DEFAULT: 0,
    },
  },
} as const;

export const UI = {
  ANIMATION_FRAME_DELAY: 16, // ~60fps

  EXTERNAL_INPUT: {
    VOLUME_STEPS: 10,
    POSITION: {
      LEFT: "1.25rem",
      BOTTOM: "0.25rem",
    },
  },

  TUNER: {
    A440_LABEL: "A-440",
  },
} as const;

export const ENVELOPE_MAPPING = {
  ATTACK_DECAY_STOPS: [
    { pos: 0, value: 0 }, // 0 ms
    { pos: 1000, value: 10 }, // 10 ms
    { pos: 2000, value: 200 }, // 200 ms
    { pos: 4000, value: 600 }, // 600 ms
    { pos: 6000, value: 1000 }, // 1000 ms (1 sec)
    { pos: 8000, value: 5000 }, // 5000 ms (5 sec)
    { pos: 10000, value: 10000 }, // 10000 ms (10 sec)
  ],
} as const;

export const FILTER_MAPPING = {
  CUTOFF: {
    MIN_FREQ: 20,
    MAX_FREQ: 12000,
    MUSICAL_CURVE_POWER: 1.2,
  },

  RESONANCE: {
    LINEAR_THRESHOLD: 2.4,
    CURVED_THRESHOLD: 3.4,
    CURVE_POWER: 1.2,
    STEEP_CURVE_POWER: 0.8,
    LINEAR_FEEDBACK_RANGE: 0.8,
    STEEP_FEEDBACK_RANGE: 0.8,
  },
} as const;

export const OSCILLATOR = {
  // Harmonics for custom waveforms
  HARMONICS_COUNT: 128,

  // Detune settings
  OSC1_DETUNE_CENTS: 2, // osc1 slightly sharp
  OSC1_VOLUME_BOOST: 1.2,

  // Frequency calculation
  GLIDE_TIME_MULTIPLIER: 0.02,
  GLIDE_TIME_POWER: 5,
} as const;

// ============================================================================
// EXTERNAL INPUT CONSTANTS
// ============================================================================

export const EXTERNAL_INPUT = {
  // Audio level monitoring
  LEVEL_MONITORING: {
    NORMALIZATION_FACTOR: 50,
    VOLUME_CURVE_POWER: 1.5,
    MIN_GAIN: 0.1,
    MAX_GAIN: 0.9,
  },
} as const;

export const ENV = {
  DEV: {
    AUDIO: {
      SAMPLE_RATE: AUDIO.DEFAULT_SAMPLE_RATE,
      FFT_SIZE: AUDIO.DEFAULT_FFT_SIZE,
      FREQUENCY_BIN_COUNT: AUDIO.DEFAULT_FREQUENCY_BIN_COUNT,
    },
    PERFORMANCE: {
      ENABLE_DEBUG_LOGGING: true,
      ENABLE_PERFORMANCE_MONITORING: true,
    },
  },

  PROD: {
    AUDIO: {
      SAMPLE_RATE: AUDIO.DEFAULT_SAMPLE_RATE,
      FFT_SIZE: AUDIO.DEFAULT_FFT_SIZE,
      FREQUENCY_BIN_COUNT: AUDIO.DEFAULT_FREQUENCY_BIN_COUNT,
    },
    PERFORMANCE: {
      ENABLE_DEBUG_LOGGING: false,
      ENABLE_PERFORMANCE_MONITORING: false,
    },
  },

  TEST: {
    AUDIO: {
      SAMPLE_RATE: AUDIO.TEST_SAMPLE_RATE,
      FFT_SIZE: AUDIO.TEST_FFT_SIZE,
      FREQUENCY_BIN_COUNT: AUDIO.TEST_FREQUENCY_BIN_COUNT,
    },
    PERFORMANCE: {
      ENABLE_DEBUG_LOGGING: false,
      ENABLE_PERFORMANCE_MONITORING: false,
    },
  },
} as const;

export const FEATURES = {
  AUDIO: {
    ENABLE_OVERSAMPLING: true,
    ENABLE_ANALOG_CHARACTERISTICS: true,
    ENABLE_TEMPERATURE_DRIFT: true,
  },

  UI: {
    ENABLE_ANIMATIONS: true,
    ENABLE_TOOLTIPS: true,
    ENABLE_KEYBOARD_SHORTCUTS: true,
  },

  PERFORMANCE: {
    ENABLE_MEMOIZATION: true,
    ENABLE_LAZY_LOADING: true,
    ENABLE_AUDIO_NODE_POOLING: true,
  },
} as const;

export const PERFORMANCE = {
  AUDIO: {
    MAX_CONCURRENT_OSCILLATORS: 32,
    BUFFER_POOL_SIZE: 16,
    MAX_AUDIO_NODES: 100,
  },

  UI: {
    DEBOUNCE_DELAY: 16,
    THROTTLE_DELAY: 100,
    MAX_RENDER_ITERATIONS: 1000,
  },

  MEMORY: {
    MAX_CACHED_WAVEFORMS: 50,
    MAX_CACHED_FREQUENCIES: 100,
    GARBAGE_COLLECTION_THRESHOLD: 1000,
  },
} as const;
