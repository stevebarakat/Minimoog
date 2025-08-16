/**
 * Centralized constants for the Minimoog synthesizer application
 * This file contains all hard-coded values that were previously scattered throughout the codebase
 */

import {
  createPitchWheelRange,
  createMasterTuneRange,
  createVolumeRange,
  createFilterCutoffRange,
  createFilterEmphasisRange,
  createFilterEnvelopeRange,
  createGlideTimeRange,
  createNoiseVolumeRange,
  createExternalInputVolumeRange,
  createLfoRateRange,
  createModMixRange,
  createModWheelRange,
} from "@/store/types/synth";

import { createFrequencyRange } from "@/types/branded";

export const AUDIO = {
  DEFAULT_SAMPLE_RATE: 44100,
  TEST_SAMPLE_RATE: 44100,

  MODULATION_BUFFER_SIZE_MULTIPLIER: 2, // 2 seconds

  // Level monitoring constants
  LEVEL_MONITORING: {
    VOLUME_CURVE_POWER: 2,
    MAX_GAIN: 0.8,
    MIN_GAIN: 0.2,
    NORMALIZATION_FACTOR: 128,
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

  // Note to MIDI index mapping (derived from NOTE_NAMES)
  get NOTE_TO_MIDI_INDEX() {
    return this.NOTE_NAMES.reduce((acc, note, index) => {
      acc[note] = index;
      return acc;
    }, {} as Record<string, number>);
  },

  // Octave ranges
  OCTAVE_RANGES: {
    "32": 32,
    "16": 16,
    "8": 8,
    "4": 4,
    "2": 2,
    lo: 1,
  } as const,

  // Single source of truth for oscillator range values
  OSCILLATOR_RANGE_VALUES: ["lo", "32", "16", "8", "4", "2"] as const,

  // Frequency limits
  MIN_FREQUENCY: 20,
  MAX_FREQUENCY: 20000,

  MIN_DETUNE_SEMITONES: -12,
  MAX_DETUNE_SEMITONES: 12,
  MIN_MASTER_TUNE: -12,
  MAX_MASTER_TUNE: 12,

  // MIDI message types
  NOTE_OFF: 0x80,
  NOTE_ON: 0x90,
  CONTROL_CHANGE: 0xb0,
  PITCH_BEND: 0xe0,

  // Control Change numbers
  CC_MODULATION: 1,
} as const;

export const KEYBOARD = {
  DEFAULTS: {
    OCTAVE_RANGE: { min: 0, max: 3 },
    EXTRA_KEYS: 8,
    VIEW: "desktop" as const,
  },

  BLACK_KEY_POSITIONING: {
    OFFSET_AMOUNT: 0.12,
    WIDTH_RATIO: 0.7,
    POSITION_OFFSET: 0.35,
  },
} as const;

// ============================================================================
// SYNTH PARAMETER DEFINITIONS
// ============================================================================

export const SYNTH_CONFIG = {
  CONTROLLERS: {
    PITCH_WHEEL: { MIN: 0, MAX: 100, DEFAULT: 50 },
    MOD_WHEEL: { MIN: 0, MAX: 100, DEFAULT: 0 },
    MASTER_TUNE: { MIN: -12, MAX: 12, DEFAULT: 0 },
  },

  VOLUME: {
    MAIN: { MIN: 0, MAX: 10, DEFAULT: 5 },
    AUX: { MIN: 0, MAX: 10, DEFAULT: 0 },
  },

  OSCILLATORS: {
    OSC1: {
      WAVEFORM: {
        VALUES: ["sawtooth", "square", "triangle", "pulse1", "pulse2"] as const,
        DEFAULT: "sawtooth" as const,
      },
      FREQUENCY: { MIN: -12, MAX: 12, DEFAULT: 0 },
      RANGE: {
        VALUES: MIDI.OSCILLATOR_RANGE_VALUES,
        DEFAULT: "8" as const,
      },
      VOLUME: { MIN: 0, MAX: 10, DEFAULT: 9.5 },
      ENABLED: { DEFAULT: true },
    },
    OSC2: {
      WAVEFORM: {
        VALUES: ["sawtooth", "square", "triangle", "pulse1", "pulse2"] as const,
        DEFAULT: "sawtooth" as const,
      },
      FREQUENCY: { MIN: -12, MAX: 12, DEFAULT: 0 },
      RANGE: {
        VALUES: MIDI.OSCILLATOR_RANGE_VALUES,
        DEFAULT: "8" as const,
      },
      VOLUME: { MIN: 0, MAX: 10, DEFAULT: 5.5 },
      ENABLED: { DEFAULT: false },
    },
    OSC3: {
      WAVEFORM: {
        VALUES: [
          "sawtooth",
          "square",
          "triangle",
          "pulse1",
          "pulse2",
          "pulse3",
          "rev_saw",
        ] as const,
        DEFAULT: "triangle" as const,
      },
      FREQUENCY: { MIN: -12, MAX: 12, DEFAULT: 0 },
      RANGE: {
        VALUES: MIDI.OSCILLATOR_RANGE_VALUES,
        DEFAULT: "8" as const,
      },
      VOLUME: { MIN: 0, MAX: 10, DEFAULT: 6.0 },
      ENABLED: { DEFAULT: false },
    },
  },

  MIXER: {
    NOISE: {
      TYPE: {
        VALUES: ["white", "pink"] as const,
        DEFAULT: "white" as const,
      },
      VOLUME: { MIN: 0, MAX: 10, DEFAULT: 0 },
    },
    EXTERNAL_INPUT: {
      VOLUME: { MIN: 0.001, MAX: 10, DEFAULT: 0.001 },
    },
  },

  FILTER: {
    CUTOFF: { MIN: -4, MAX: 4, DEFAULT: 3.9 },
    EMPHASIS: { MIN: 0, MAX: 10, DEFAULT: 0 },
    CONTOUR_AMOUNT: { MIN: 0, MAX: 10, DEFAULT: 4.71 },
    ENVELOPE: {
      ATTACK: { MIN: 0, MAX: 10, DEFAULT: 0.3 },
      DECAY: { MIN: 0, MAX: 10, DEFAULT: 0 },
      SUSTAIN: { MIN: 0, MAX: 10, DEFAULT: 4.5 },
    },
    TYPE: {
      VALUES: ["huovilainen"] as const,
      DEFAULT: "huovilainen" as const,
    },
    MODULATION_ON: { DEFAULT: true },
  },

  ENVELOPES: {
    LOUDNESS: {
      ATTACK: { MIN: 0, MAX: 10, DEFAULT: 0 },
      DECAY: { MIN: 0, MAX: 10, DEFAULT: 0 },
      SUSTAIN: { MIN: 0, MAX: 10, DEFAULT: 10 },
    },
  },

  MODULATION: {
    LFO: {
      RATE: { MIN: 0, MAX: 10, DEFAULT: 3.5 },
      WAVEFORM: {
        VALUES: ["triangle", "square"] as const,
        DEFAULT: "triangle" as const,
      },
    },
    MIX: { MIN: 0, MAX: 10, DEFAULT: 10 },
  },

  GLIDE: {
    TIME: { MIN: 0, MAX: 10, DEFAULT: 1 },
    ON: { DEFAULT: true },
  },

  SWITCHES: {
    IS_DISABLED: true,
    IS_MAIN_ACTIVE: true,
    KEYBOARD_CONTROL1: true,
    KEYBOARD_CONTROL2: true,
    DECAY_SWITCH_ON: false,
    OSCILLATOR_MODULATION_ON: false,
    OSC3_CONTROL: true,
    OSC3_FILTER_EG_SWITCH: false,
    NOISE_LFO_SWITCH: true,
    TUNER_ON: false,
  },
} as const;

// ============================================================================
// DEFAULT PRESET CONFIGURATION
// ============================================================================

// Set this to the ID of any preset from presets.ts to use it as the default
// Set to null to use the hardcoded DEFAULT_SYNTH_STATE values below
export const DEFAULT_PRESET_ID: string | null = null; // Using hardcoded defaults below

// ============================================================================
// DEFAULT SYNTH STATE VALUES
// ============================================================================

export const DEFAULT_SYNTH_STATE = {
  // Controller state
  pitchWheel: createPitchWheelRange(
    SYNTH_CONFIG.CONTROLLERS.PITCH_WHEEL.DEFAULT
  ),
  masterTune: createMasterTuneRange(
    SYNTH_CONFIG.CONTROLLERS.MASTER_TUNE.DEFAULT
  ),

  // Oscillator state
  oscillator1: {
    waveform: SYNTH_CONFIG.OSCILLATORS.OSC1.WAVEFORM.DEFAULT,
    frequency: createFrequencyRange(
      SYNTH_CONFIG.OSCILLATORS.OSC1.FREQUENCY.DEFAULT
    ),
    range: SYNTH_CONFIG.OSCILLATORS.OSC1.RANGE.DEFAULT,
    enabled: SYNTH_CONFIG.OSCILLATORS.OSC1.ENABLED.DEFAULT,
    volume: createVolumeRange(SYNTH_CONFIG.OSCILLATORS.OSC1.VOLUME.DEFAULT),
  },
  oscillator2: {
    waveform: SYNTH_CONFIG.OSCILLATORS.OSC2.WAVEFORM.DEFAULT,
    frequency: createFrequencyRange(
      SYNTH_CONFIG.OSCILLATORS.OSC2.FREQUENCY.DEFAULT
    ),
    range: SYNTH_CONFIG.OSCILLATORS.OSC2.RANGE.DEFAULT,
    enabled: SYNTH_CONFIG.OSCILLATORS.OSC2.ENABLED.DEFAULT,
    volume: createVolumeRange(SYNTH_CONFIG.OSCILLATORS.OSC2.VOLUME.DEFAULT),
  },
  oscillator3: {
    waveform: SYNTH_CONFIG.OSCILLATORS.OSC3.WAVEFORM.DEFAULT,
    frequency: createFrequencyRange(
      SYNTH_CONFIG.OSCILLATORS.OSC3.FREQUENCY.DEFAULT
    ),
    range: SYNTH_CONFIG.OSCILLATORS.OSC3.RANGE.DEFAULT,
    enabled: SYNTH_CONFIG.OSCILLATORS.OSC3.ENABLED.DEFAULT,
    volume: createVolumeRange(SYNTH_CONFIG.OSCILLATORS.OSC3.VOLUME.DEFAULT),
  },

  // Mixer state
  mixer: {
    noise: {
      enabled: false,
      volume: createNoiseVolumeRange(SYNTH_CONFIG.MIXER.NOISE.VOLUME.DEFAULT),
      noiseType: SYNTH_CONFIG.MIXER.NOISE.TYPE.DEFAULT,
    },
    external: {
      enabled: false,
      volume: createExternalInputVolumeRange(
        SYNTH_CONFIG.MIXER.EXTERNAL_INPUT.VOLUME.DEFAULT
      ),
    },
  },
  mainVolume: createVolumeRange(SYNTH_CONFIG.VOLUME.MAIN.DEFAULT),
  isMainActive: SYNTH_CONFIG.SWITCHES.IS_MAIN_ACTIVE,

  // Glide state
  glideOn: SYNTH_CONFIG.GLIDE.ON.DEFAULT,
  glideTime: createGlideTimeRange(SYNTH_CONFIG.GLIDE.TIME.DEFAULT),

  // Filter state
  filterType: SYNTH_CONFIG.FILTER.TYPE.DEFAULT,
  filterAttack: createFilterEnvelopeRange(
    SYNTH_CONFIG.FILTER.ENVELOPE.ATTACK.DEFAULT
  ),
  filterDecay: createFilterEnvelopeRange(
    SYNTH_CONFIG.FILTER.ENVELOPE.DECAY.DEFAULT
  ),
  filterSustain: createFilterEnvelopeRange(
    SYNTH_CONFIG.FILTER.ENVELOPE.SUSTAIN.DEFAULT
  ),
  filterCutoff: createFilterCutoffRange(SYNTH_CONFIG.FILTER.CUTOFF.DEFAULT),
  filterEmphasis: createFilterEmphasisRange(
    SYNTH_CONFIG.FILTER.EMPHASIS.DEFAULT
  ),
  filterContourAmount: createFilterEnvelopeRange(
    SYNTH_CONFIG.FILTER.CONTOUR_AMOUNT.DEFAULT
  ),
  keyboardControl1: SYNTH_CONFIG.SWITCHES.KEYBOARD_CONTROL1,
  keyboardControl2: SYNTH_CONFIG.SWITCHES.KEYBOARD_CONTROL2,

  // Envelopes state
  loudnessAttack: createFilterEnvelopeRange(
    SYNTH_CONFIG.ENVELOPES.LOUDNESS.ATTACK.DEFAULT
  ),
  loudnessDecay: createFilterEnvelopeRange(
    SYNTH_CONFIG.ENVELOPES.LOUDNESS.DECAY.DEFAULT
  ),
  loudnessSustain: createFilterEnvelopeRange(
    SYNTH_CONFIG.ENVELOPES.LOUDNESS.SUSTAIN.DEFAULT
  ),

  // Modulation state
  oscillatorModulationOn: SYNTH_CONFIG.SWITCHES.OSCILLATOR_MODULATION_ON,
  lfoWaveform: SYNTH_CONFIG.MODULATION.LFO.WAVEFORM.DEFAULT,
  lfoRate: createLfoRateRange(SYNTH_CONFIG.MODULATION.LFO.RATE.DEFAULT),
  osc3Control: SYNTH_CONFIG.SWITCHES.OSC3_CONTROL,
  modMix: createModMixRange(SYNTH_CONFIG.MODULATION.MIX.DEFAULT),
  osc3FilterEgSwitch: SYNTH_CONFIG.SWITCHES.OSC3_FILTER_EG_SWITCH,
  noiseLfoSwitch: SYNTH_CONFIG.SWITCHES.NOISE_LFO_SWITCH,
  modWheel: createModWheelRange(SYNTH_CONFIG.CONTROLLERS.MOD_WHEEL.DEFAULT),
  filterModulationOn: SYNTH_CONFIG.FILTER.MODULATION_ON.DEFAULT,

  // Output state
  auxOutput: {
    enabled: false,
    volume: createVolumeRange(SYNTH_CONFIG.VOLUME.AUX.DEFAULT),
  },
  tunerOn: SYNTH_CONFIG.SWITCHES.TUNER_ON,
  decaySwitchOn: SYNTH_CONFIG.SWITCHES.DECAY_SWITCH_ON,
} as const;

// ============================================================================
// PRESET TEMPLATES - DISABLED FOR NOW
// ============================================================================

/*
export const PRESET_TEMPLATES = {
  // Common oscillator configurations
  OSCILLATORS: {
    VINTAGE_BASS: {
      oscillator1: {
        waveform: "sawtooth" as const,
        frequency: 0,
        range: "32" as const,
        enabled: true,
        volume: 10,
      },
      oscillator2: {
        waveform: "sawtooth" as const,
        frequency: -7,
        range: "32" as const,
        enabled: true,
        volume: 8,
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: -7,
        range: "32" as const,
        enabled: true,
        volume: 6,
      },
    },
    VINTAGE_LEAD: {
      oscillator1: {
        waveform: "sawtooth" as const,
        frequency: 0,
        range: "8" as const,
        enabled: true,
        volume: 10,
      },
      oscillator2: {
        waveform: "pulse1" as const,
        frequency: 7,
        range: "8" as const,
        enabled: true,
        volume: 7,
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: -7,
        range: "8" as const,
        enabled: true,
        volume: 4,
      },
    },
    VINTAGE_PAD: {
      oscillator1: {
        waveform: "triangle" as const,
        frequency: 0,
        range: "8" as const,
        enabled: true,
        volume: 6,
      },
      oscillator2: {
        waveform: "sawtooth" as const,
        frequency: 1,
        range: "8" as const,
        enabled: true,
        volume: 6,
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: -7,
        range: "8" as const,
        enabled: true,
        volume: 4,
      },
    },
    ACID_BASS: {
      oscillator1: {
        waveform: "sawtooth" as const,
        frequency: -7,
        range: "32" as const,
        enabled: true,
        volume: 10,
      },
      oscillator2: {
        waveform: "sawtooth" as const,
        frequency: -7,
        range: "16" as const,
        enabled: true,
        volume: 8,
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: -7,
        range: "16" as const,
        enabled: true,
        volume: 6,
      },
    },
    HIGH_LEAD: {
      oscillator1: {
        waveform: "sawtooth" as const,
        frequency: 0,
        range: "4" as const,
        enabled: true,
        volume: 10,
      },
      oscillator2: {
        waveform: "pulse1" as const,
        frequency: 7,
        range: "4" as const,
        enabled: true,
        volume: 8,
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: -7,
        range: "4" as const,
        enabled: true,
        volume: 6,
      },
    },
    AMBIENT_PAD: {
      oscillator1: {
        waveform: "triangle" as const,
        frequency: 0,
        range: "8" as const,
        enabled: true,
        volume: 6,
      },
      oscillator2: {
        waveform: "triangle" as const,
        frequency: 1,
        range: "8" as const,
        enabled: true,
        volume: 6,
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: -7,
        range: "8" as const,
        enabled: true,
        volume: 4,
      },
    },
    INDUSTRIAL: {
      oscillator1: {
        waveform: "sawtooth" as const,
        frequency: -7,
        range: "32" as const,
        enabled: true,
        volume: 9,
      },
      oscillator2: {
        waveform: "sawtooth" as const,
        frequency: -7,
        range: "16" as const,
        enabled: true,
        volume: 7,
      },
      oscillator3: {
        waveform: "triangle" as const,
        frequency: -7,
        range: "16" as const,
        enabled: true,
        volume: 5,
      },
    },
  },

  // Common mixer configurations
  MIXER: {
    VINTAGE_BASS: {
      noise: { enabled: false, volume: 0, noiseType: "white" as const },
      external: { enabled: false, volume: 0 },
    },
    VINTAGE_LEAD: {
      noise: { enabled: false, volume: 0, noiseType: "white" as const },
      external: { enabled: false, volume: 0 },
    },
    VINTAGE_PAD: {
      noise: { enabled: false, volume: 0, noiseType: "white" as const },
      external: { enabled: false, volume: 0 },
    },
    ACID_BASS: {
      noise: { enabled: false, volume: 0, noiseType: "white" as const },
      external: { enabled: false, volume: 0 },
    },
    HIGH_LEAD: {
      noise: { enabled: false, volume: 0, noiseType: "white" as const },
      external: { enabled: false, volume: 0 },
    },
    AMBIENT_PAD: {
      noise: { enabled: false, volume: 0, noiseType: "white" as const },
      external: { enabled: false, volume: 0 },
    },
    INDUSTRIAL: {
      noise: { enabled: true, volume: 4, noiseType: "white" as const },
      external: { enabled: false, volume: 0 },
    },
  },

  // Common filter configurations
  FILTER: {
    BASS: {
      filterCutoff: 2.5,
      filterEmphasis: 6,
      filterContourAmount: 7,
      filterAttack: 0.1,
      filterDecay: 3,
      filterSustain: 6,
      filterModulationOn: false,
    },
    LEAD: {
      filterCutoff: 1.5,
      filterEmphasis: 7,
      filterContourAmount: 8,
      filterAttack: 0.3,
      filterDecay: 2,
      filterSustain: 7,
      filterModulationOn: true,
    },
    PAD: {
      filterCutoff: 3.5,
      filterEmphasis: 5,
      filterContourAmount: 6,
      filterAttack: 1.5,
      filterDecay: 5,
      filterSustain: 8,
      filterModulationOn: true,
    },
    ACID: {
      filterCutoff: 3,
      filterEmphasis: 8,
      filterContourAmount: 9,
      filterAttack: 0.1,
      filterDecay: 4,
      filterSustain: 3,
      filterModulationOn: true,
    },
    HIGH_LEAD: {
      filterCutoff: 2,
      filterEmphasis: 9,
      filterContourAmount: 8,
      filterAttack: 0.1,
      filterDecay: 0.5,
      filterSustain: 2,
    },
    AMBIENT: {
      filterCutoff: 4,
      filterEmphasis: 4,
      filterContourAmount: 5,
      filterAttack: 3,
      filterDecay: 7,
      filterSustain: 8,
    },
    INDUSTRIAL: {
      filterCutoff: 1,
      filterEmphasis: 9,
      filterContourAmount: 8,
      filterAttack: 0.1,
      filterDecay: 4,
      filterSustain: 2,
    },
  },

  // Common envelope configurations
  ENVELOPE: {
    BASS: {
      loudnessAttack: 0.1,
      loudnessDecay: 3,
      loudnessSustain: 7,
    },
    LEAD: {
      loudnessAttack: 0.2,
      loudnessDecay: 2,
      loudnessSustain: 6,
    },
    PAD: {
      loudnessAttack: 1,
      loudnessDecay: 5,
      loudnessSustain: 9,
    },
    ACID: {
      loudnessAttack: 0.1,
      loudnessDecay: 4,
      loudnessSustain: 4,
    },
    HIGH_LEAD: {
      loudnessAttack: 0.1,
      loudnessDecay: 0.5,
      loudnessSustain: 3,
    },
    AMBIENT: {
      loudnessAttack: 3,
      loudnessDecay: 7,
      loudnessSustain: 8,
    },
    INDUSTRIAL: {
      loudnessAttack: 0.1,
      loudnessDecay: 3,
      loudnessSustain: 4,
    },
  },

  // Common side panel configurations
  SIDE_PANEL: {
    BASS: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 4,
      lfoWaveform: "triangle" as const,
      modWheel: 50,
    },
    LEAD: {
      glideOn: true,
      decaySwitchOn: false,
      lfoRate: 5,
      lfoWaveform: "triangle" as const,
      modWheel: 60,
    },
    PAD: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 1,
      lfoWaveform: "triangle" as const,
      modWheel: 30,
    },
    ACID: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 8,
      lfoWaveform: "square" as const,
      modWheel: 80,
    },
    HIGH_LEAD: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 8,
      lfoWaveform: "square" as const,
      modWheel: 85,
    },
    AMBIENT: {
      glideOn: true,
      decaySwitchOn: true,
      lfoRate: 1,
      lfoWaveform: "triangle" as const,
      modWheel: 25,
    },
    INDUSTRIAL: {
      glideOn: false,
      decaySwitchOn: false,
      lfoRate: 7,
      lfoWaveform: "square" as const,
      modWheel: 80,
    },
  },

  // Common controller configurations
  CONTROLLERS: {
    BASS: {
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    LEAD: {
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    PAD: {
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    ACID: {
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    HIGH_LEAD: {
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    AMBIENT: {
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
    INDUSTRIAL: {
      oscillatorModulationOn: false,
      osc3Control: true,
      keyboardControl1: false,
      keyboardControl2: false,
    },
  },
} as const;
*/

// ============================================================================
// PRESET UTILITY FUNCTIONS - DISABLED FOR NOW
// ============================================================================

/*
// createPreset function disabled - presets system disabled for now
*/

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
    MIN_FREQ: 10, // Authentic Minimoog low-end
    MAX_FREQ: 32000, // Authentic Minimoog high-end (32kHz)
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
      LATENCY_HINT: "interactive",
      SMOOTHING_TIME_CONSTANT: 0.8,
    },
    PERFORMANCE: {
      ENABLE_DEBUG_LOGGING: true,
      ENABLE_PERFORMANCE_MONITORING: true,
    },
  },

  PROD: {
    AUDIO: {
      SAMPLE_RATE: AUDIO.DEFAULT_SAMPLE_RATE,
      LATENCY_HINT: "interactive",
      SMOOTHING_TIME_CONSTANT: 0.8,
    },
    PERFORMANCE: {
      ENABLE_DEBUG_LOGGING: false,
      ENABLE_PERFORMANCE_MONITORING: false,
    },
  },

  TEST: {
    AUDIO: {
      SAMPLE_RATE: AUDIO.TEST_SAMPLE_RATE,
      LATENCY_HINT: "interactive",
      SMOOTHING_TIME_CONSTANT: 0.8,
    },
    PERFORMANCE: {
      ENABLE_DEBUG_LOGGING: false,
      ENABLE_PERFORMANCE_MONITORING: false,
    },
  },
} as const;
