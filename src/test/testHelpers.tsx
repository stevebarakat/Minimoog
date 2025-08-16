import React from "react";
import { render, RenderOptions } from "@testing-library/react";
import { vi } from "vitest";
import { ToastProvider } from "@/components/Toast/ToastProvider";
import { SynthState, SynthActions } from "@/store/types/synth";
import {
  createPitchWheelRange,
  createModWheelRange,
  createMasterTuneRange,
  createFrequencyRange,
  createVolumeRange,
  createNoiseVolumeRange,
  createExternalInputVolumeRange,
  createGlideTimeRange,
  createFilterEnvelopeRange,
  createFilterCutoffRange,
  createFilterEmphasisRange,
  createFilterContourRange,
  createLfoRateRange,
  createModMixRange,
} from "@/store/types/synth";

interface CustomRenderOptions extends Omit<RenderOptions, "wrapper"> {
  withToast?: boolean;
}

export function customRender(
  ui: React.ReactElement,
  options: CustomRenderOptions = {}
) {
  const { withToast = false, ...renderOptions } = options;

  const Wrapper = ({ children }: { children: React.ReactNode }) => {
    if (withToast) {
      return <ToastProvider>{children}</ToastProvider>;
    }
    return <>{children}</>;
  };

  return render(ui, { wrapper: Wrapper, ...renderOptions });
}

// Helper function to create mock state with the new audioContext structure
export function createMockSynthState(
  overrides: Partial<SynthState> = {}
): SynthState {
  return {
    // Audio context state
    audioContext: {
      isReady: false,
      error: null,
      context: null,
    },

    // Keyboard state
    activeKeys: null,

    // Controller state
    pitchWheel: createPitchWheelRange(50),
    modWheel: createModWheelRange(0),
    masterTune: createMasterTuneRange(0),
    oscillator1: {
      waveform: "sawtooth",
      frequency: createFrequencyRange(0),
      range: "8" as const,
      enabled: true,
      volume: createVolumeRange(9),
    },
    oscillator2: {
      waveform: "sawtooth",
      frequency: createFrequencyRange(-7),
      range: "8" as const,
      enabled: true,
      volume: createVolumeRange(5),
    },
    oscillator3: {
      waveform: "triangle",
      frequency: createFrequencyRange(-7),
      range: "8" as const,
      enabled: true,
      volume: createVolumeRange(3),
    },
    mixer: {
      noise: {
        enabled: false,
        volume: createNoiseVolumeRange(0),
        noiseType: "white",
      },
      external: {
        enabled: false,
        volume: createExternalInputVolumeRange(0.001),
      },
    },
    mainVolume: createVolumeRange(5),
    isMainActive: true,

    // Glide state
    glideOn: false,
    glideTime: createGlideTimeRange(0.1),

    // Filter state
    filterType: "huovilainen",
    filterAttack: createFilterEnvelopeRange(0.5),
    filterDecay: createFilterEnvelopeRange(2.5),
    filterSustain: createFilterEnvelopeRange(5),
    filterCutoff: createFilterCutoffRange(0),
    filterEmphasis: createFilterEmphasisRange(5),
    filterContourAmount: createFilterContourRange(5),
    filterModulationOn: true,
    keyboardControl1: false,
    keyboardControl2: false,

    // Modulation state
    oscillatorModulationOn: false,
    lfoWaveform: "triangle",
    lfoRate: createLfoRateRange(5),
    osc3Control: true,
    modMix: createModMixRange(0),
    osc3FilterEgSwitch: true,
    noiseLfoSwitch: false,

    // Envelope state
    loudnessAttack: createFilterEnvelopeRange(0.5),
    loudnessDecay: createFilterEnvelopeRange(2.5),
    loudnessSustain: createFilterEnvelopeRange(8),
    decaySwitchOn: false,

    // Output state
    tunerOn: false,
    auxOutput: {
      enabled: false,
      volume: createVolumeRange(0),
    },

    ...overrides,
  };
}

// Helper function to create a complete mock store with both state and actions
export function createMockStore(
  overrides: Partial<SynthState> = {}
): SynthState & SynthActions {
  const state = createMockSynthState(overrides);

  return {
    ...state,
    // Mock actions
    setAudioContext: vi.fn(),
    setActiveKeys: vi.fn(),
    setPitchWheel: vi.fn(),
    setModWheel: vi.fn(),
    setMasterTune: vi.fn(),
    setOscillator1: vi.fn(),
    setOscillator2: vi.fn(),
    setOscillator3: vi.fn(),
    setMixerNoise: vi.fn(),
    setMixerExternal: vi.fn(),
    setMainVolume: vi.fn(),
    setIsMainActive: vi.fn(),
    setGlideOn: vi.fn(),
    setGlideTime: vi.fn(),
    setFilterType: vi.fn(),
    setFilterEnvelope: vi.fn(),
    setFilterCutoff: vi.fn(),
    setFilterEmphasis: vi.fn(),
    setFilterContourAmount: vi.fn(),
    setFilterModulationOn: vi.fn(),
    setKeyboardControl1: vi.fn(),
    setKeyboardControl2: vi.fn(),
    setOscillatorModulationOn: vi.fn(),
    setLfoWaveform: vi.fn(),
    setLfoRate: vi.fn(),
    setOsc3Control: vi.fn(),
    setModMix: vi.fn(),
    setOsc3FilterEgSwitch: vi.fn(),
    setNoiseLfoSwitch: vi.fn(),
    setLoudnessEnvelope: vi.fn(),
    setDecaySwitchOn: vi.fn(),
    setTunerOn: vi.fn(),
    setAuxOutput: vi.fn(),
    loadPreset: vi.fn(),
  };
}
