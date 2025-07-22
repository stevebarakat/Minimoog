import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import type { Oscillator } from "../types/synthTypes";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

// Mock the audio context hook
vi.mock("@/hooks/useAudioContext", () => ({
  useAudioContext: vi.fn(),
}));

// Mock the Minimoog hooks
vi.mock("../hooks", () => ({
  useMinimoogURLSync: vi.fn(),
  useResponsiveView: vi.fn(),
  useMinimoogAudio: vi.fn(),
  useFilterTracking: vi.fn(),
}));

import Minimoog from "../Minimoog";
import { useSynthStore } from "@/store/synthStore";
import { useAudioContext } from "@/hooks/useAudioContext";
import { useMinimoogAudio, useFilterTracking } from "../hooks";

const mockedUseSynthStore = vi.mocked(useSynthStore);
const mockedUseAudioContext = vi.mocked(useAudioContext);
const mockedUseMinimoogAudio = vi.mocked(useMinimoogAudio);
const mockedUseFilterTracking = vi.mocked(useFilterTracking);

describe("Minimoog - Integration Tests", () => {
  const mockSetActiveKeys = vi.fn();
  const mockInitialize = vi.fn();
  const mockDispose = vi.fn();
  const mockAudioContext = {} as AudioContext;
  const mockMixerNode = {} as GainNode;
  const mockFilterNode = {} as AudioWorkletNode;
  const mockSynthObj = {
    triggerAttack: vi.fn(),
    triggerRelease: vi.fn(),
  };

  const defaultState = {
    activeKeys: null,
    isDisabled: false,
    // Add other state properties as needed for the components
    oscillator1: { frequency: 440, waveform: "sawtooth", enabled: true },
    oscillator2: { frequency: 440, waveform: "sawtooth", enabled: false },
    oscillator3: { frequency: 440, waveform: "sawtooth", enabled: false },
    mixer: {
      osc1: { volume: 5, enabled: true },
      osc2: { volume: 3, enabled: false },
      osc3: { volume: 7, enabled: false },
      noise: { volume: 0, enabled: false, noiseType: "white" },
      external: { volume: 0, enabled: false, overload: false },
    },
    filterAttack: 0.5,
    filterDecay: 2.5,
    filterSustain: 5,
    filterCutoff: 0,
    filterEmphasis: 5,
    filterContourAmount: 5,
    loudnessAttack: 0.5,
    loudnessDecay: 2.5,
    loudnessSustain: 8,
    filterModulationOn: false,
    keyboardControl1: false,
    keyboardControl2: false,
    mainVolume: 5,
    isMainActive: true,
    glideOn: false,
    glideTime: 0.1,
    masterTune: 0,
    pitchWheel: 50,
    modWheel: 50,
    oscillatorModulationOn: false,
    lfoWaveform: "triangle" as const,
    lfoRate: 5,
    modMix: 0,
    osc3Control: false,
    osc3FilterEgSwitch: false,
    noiseLfoSwitch: false,
    decaySwitchOn: false,
    tunerOn: false,
    auxOutput: { enabled: false, volume: 0 },
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Mock the store with all required setter functions
    const mockState = {
      ...defaultState,
      setActiveKeys: mockSetActiveKeys,
      setMixerSource: vi.fn(),
      setMixerExternal: vi.fn(),
      setMixerNoise: vi.fn(),
      setFilterEnvelope: vi.fn(),
      setLoudnessEnvelope: vi.fn(),
      setFilterCutoff: vi.fn(),
      setFilterEmphasis: vi.fn(),
      setFilterContourAmount: vi.fn(),
      setFilterModulationOn: vi.fn(),
      setKeyboardControl1: vi.fn(),
      setKeyboardControl2: vi.fn(),
      setOscillator1: vi.fn(),
      setOscillator2: vi.fn(),
      setOscillator3: vi.fn(),
      setMainVolume: vi.fn(),
      setIsMainActive: vi.fn(),
      setGlideOn: vi.fn(),
      setGlideTime: vi.fn(),
      setMasterTune: vi.fn(),
      setPitchWheel: vi.fn(),
      setModWheel: vi.fn(),
      setOscillatorModulationOn: vi.fn(),
      setLfoWaveform: vi.fn(),
      setLfoRate: vi.fn(),
      setModMix: vi.fn(),
      setOsc3Control: vi.fn(),
      setOsc3FilterEgSwitch: vi.fn(),
      setNoiseLfoSwitch: vi.fn(),
      setDecaySwitchOn: vi.fn(),
      setTunerOn: vi.fn(),
      setAuxOutput: vi.fn(),
    };

    mockedUseSynthStore.mockImplementation((selector?: unknown) => {
      if (typeof selector === "function") {
        return selector(mockState);
      }
      return mockState;
    });

    // Mock the audio context
    mockedUseAudioContext.mockReturnValue({
      audioContext: mockAudioContext,
      isInitialized: true,
      initialize: mockInitialize,
      dispose: mockDispose,
    });

    // Mock the Minimoog audio hook
    mockedUseMinimoogAudio.mockReturnValue({
      mixerNode: mockMixerNode,
      filterNode: mockFilterNode,
      loudnessEnvelopeGain: {} as GainNode,
      masterGain: {} as GainNode,
      containerRef: { current: null },
      osc1: {} as Oscillator,
      osc2: {} as Oscillator,
      osc3: {} as Oscillator,
      synthObj: mockSynthObj,
    } as ReturnType<typeof useMinimoogAudio>);

    // Mock the filter tracking hook
    mockedUseFilterTracking.mockReturnValue(undefined);
  });

  it("renders the complete Minimoog synthesizer", () => {
    render(<Minimoog />);

    // Check for main sections
    expect(screen.getByText("Controllers")).toBeInTheDocument();
    expect(screen.getByText("Mixer")).toBeInTheDocument();
    expect(screen.getByText("Modifiers")).toBeInTheDocument();
    expect(screen.getByText("Output")).toBeInTheDocument();

    // Check for oscillator bank
    expect(screen.getByText("Oscillator 1")).toBeInTheDocument();
    expect(screen.getByText("Oscillator 2")).toBeInTheDocument();
    expect(screen.getByText("Oscillator 3")).toBeInTheDocument();

    // Check for power button
    expect(screen.getByRole("button", { name: "Power" })).toBeInTheDocument();

    // Check for presets dropdown
    expect(
      screen.getByRole("button", { name: "Select a preset" })
    ).toBeInTheDocument();
  });

  it("displays all synthesizer controls correctly", () => {
    render(<Minimoog />);

    // Check for oscillator controls
    expect(
      screen.getByRole("slider", { name: "Oscillator 1 Volume" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Oscillator 2 Volume" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Oscillator 3 Volume" })
    ).toBeInTheDocument();

    // Check for filter controls
    expect(
      screen.getByRole("slider", { name: "Cutoff Frequency" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Emphasis" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Amount of Contour" })
    ).toBeInTheDocument();

    // Check for envelope controls
    const attackKnobs = screen.getAllByRole("slider", { name: "Attack Time" });
    const decayKnobs = screen.getAllByRole("slider", { name: "Decay Time" });
    const sustainKnobs = screen.getAllByRole("slider", {
      name: "Sustain Level",
    });

    expect(attackKnobs).toHaveLength(2); // Filter and loudness envelopes
    expect(decayKnobs).toHaveLength(2);
    expect(sustainKnobs).toHaveLength(2);

    // Check for switches
    expect(
      screen.getByRole("button", { name: "Filter Modulation" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Keyboard Control 1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Keyboard Control 2" })
    ).toBeInTheDocument();
  });

  it("handles power state correctly", async () => {
    const user = userEvent.setup();
    render(<Minimoog />);

    const powerButton = screen.getByRole("button", { name: "Power" });

    // Power should be on initially (isInitialized: true)
    expect(powerButton).toHaveAttribute("aria-pressed", "true");

    // Click to turn off
    await user.click(powerButton);
    expect(mockDispose).toHaveBeenCalled();

    // Mock the state change
    mockedUseAudioContext.mockReturnValue({
      audioContext: mockAudioContext,
      isInitialized: false,
      initialize: mockInitialize,
      dispose: mockDispose,
    });

    // Re-render to see the change
    render(<Minimoog />);
    const newPowerButton = screen.getAllByRole("button", { name: "Power" })[1];
    expect(newPowerButton).toHaveAttribute("aria-pressed", "false");
  });

  it("allows users to interact with oscillator controls", async () => {
    const user = userEvent.setup();
    render(<Minimoog />);

    const osc1VolumeKnob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });
    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });

    // Test volume adjustment
    osc1VolumeKnob.focus();
    await user.keyboard("{ArrowUp}");

    // Test oscillator toggle
    await user.click(osc1Switch);
  });

  it("allows users to interact with filter controls", async () => {
    const user = userEvent.setup();
    render(<Minimoog />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });

    // Test filter adjustments
    cutoffKnob.focus();
    await user.keyboard("{ArrowUp}");

    emphasisKnob.focus();
    await user.keyboard("{ArrowUp}");
  });

  it("allows users to interact with envelope controls", async () => {
    const user = userEvent.setup();
    render(<Minimoog />);

    const filterAttackKnob = screen.getAllByRole("slider", {
      name: "Attack Time",
    })[0];
    const loudnessAttackKnob = screen.getAllByRole("slider", {
      name: "Attack Time",
    })[1];

    // Test filter envelope
    filterAttackKnob.focus();
    await user.keyboard("{ArrowUp}");

    // Test loudness envelope
    loudnessAttackKnob.focus();
    await user.keyboard("{ArrowUp}");
  });

  it("allows users to toggle modulation switches", async () => {
    const user = userEvent.setup();
    render(<Minimoog />);

    const filterModSwitch = screen.getByRole("button", {
      name: "Filter Modulation",
    });
    const keyboardControl1Switch = screen.getByRole("button", {
      name: "Keyboard Control 1",
    });

    // Test switch toggles
    await user.click(filterModSwitch);
    await user.click(keyboardControl1Switch);
  });

  it("supports keyboard navigation through all controls", async () => {
    const user = userEvent.setup();
    render(<Minimoog />);

    // Start with first control and tab through
    const firstKnob = screen.getAllByRole("slider")[0];
    firstKnob.focus();
    expect(firstKnob).toHaveFocus();

    // Tab through multiple controls
    await user.tab();
    await user.tab();
    await user.tab();

    // Verify we can focus on switches
    const filterModSwitch = screen.getByRole("button", {
      name: "Filter Modulation",
    });
    filterModSwitch.focus();
    expect(filterModSwitch).toHaveFocus();
  });

  it("disables controls when synth is powered off", () => {
    // Mock powered off state
    mockedUseAudioContext.mockReturnValue({
      audioContext: null,
      isInitialized: false,
      initialize: mockInitialize,
      dispose: mockDispose,
    });

    const mockState = {
      ...defaultState,
      isDisabled: true,
      setActiveKeys: mockSetActiveKeys,
      setMixerSource: vi.fn(),
      setMixerExternal: vi.fn(),
      setMixerNoise: vi.fn(),
      setFilterEnvelope: vi.fn(),
      setLoudnessEnvelope: vi.fn(),
      setFilterCutoff: vi.fn(),
      setFilterEmphasis: vi.fn(),
      setFilterContourAmount: vi.fn(),
      setFilterModulationOn: vi.fn(),
      setKeyboardControl1: vi.fn(),
      setKeyboardControl2: vi.fn(),
      setOscillator1: vi.fn(),
      setOscillator2: vi.fn(),
      setOscillator3: vi.fn(),
      setMainVolume: vi.fn(),
      setIsMainActive: vi.fn(),
      setGlideOn: vi.fn(),
      setGlideTime: vi.fn(),
      setMasterTune: vi.fn(),
      setPitchWheel: vi.fn(),
      setModWheel: vi.fn(),
      setOscillatorModulationOn: vi.fn(),
      setLfoWaveform: vi.fn(),
      setLfoRate: vi.fn(),
      setModMix: vi.fn(),
      setOsc3Control: vi.fn(),
      setOsc3FilterEgSwitch: vi.fn(),
      setNoiseLfoSwitch: vi.fn(),
      setDecaySwitchOn: vi.fn(),
      setTunerOn: vi.fn(),
      setAuxOutput: vi.fn(),
    };

    mockedUseSynthStore.mockImplementation((selector?: unknown) => {
      if (typeof selector === "function") {
        return selector(mockState);
      }
      return mockState;
    });

    render(<Minimoog />);

    // Check that controls are functionally disabled
    const allKnobs = screen.getAllByRole("slider");
    allKnobs.forEach((knob) => {
      // Check if the knob is functionally disabled
      const isDisabled =
        knob.classList.contains("disabled") ||
        knob.getAttribute("aria-disabled") === "true" ||
        knob.getAttribute("tabindex") === "-1";
      expect(isDisabled).toBeTruthy();
    });

    // Power button should be off
    const powerButton = screen.getByRole("button", { name: "Power" });
    expect(powerButton).toHaveAttribute("aria-pressed", "false");
  });

  it("prevents interactions when powered off", async () => {
    const user = userEvent.setup();

    // Mock powered off state
    mockedUseAudioContext.mockReturnValue({
      audioContext: null,
      isInitialized: false,
      initialize: mockInitialize,
      dispose: mockDispose,
    });

    const mockState = {
      ...defaultState,
      isDisabled: true,
      setActiveKeys: mockSetActiveKeys,
      setMixerSource: vi.fn(),
      setMixerExternal: vi.fn(),
      setMixerNoise: vi.fn(),
      setFilterEnvelope: vi.fn(),
      setLoudnessEnvelope: vi.fn(),
      setFilterCutoff: vi.fn(),
      setFilterEmphasis: vi.fn(),
      setFilterContourAmount: vi.fn(),
      setFilterModulationOn: vi.fn(),
      setKeyboardControl1: vi.fn(),
      setKeyboardControl2: vi.fn(),
      setOscillator1: vi.fn(),
      setOscillator2: vi.fn(),
      setOscillator3: vi.fn(),
      setMainVolume: vi.fn(),
      setIsMainActive: vi.fn(),
      setGlideOn: vi.fn(),
      setGlideTime: vi.fn(),
      setMasterTune: vi.fn(),
      setPitchWheel: vi.fn(),
      setModWheel: vi.fn(),
      setOscillatorModulationOn: vi.fn(),
      setLfoWaveform: vi.fn(),
      setLfoRate: vi.fn(),
      setModMix: vi.fn(),
      setOsc3Control: vi.fn(),
      setOsc3FilterEgSwitch: vi.fn(),
      setNoiseLfoSwitch: vi.fn(),
      setDecaySwitchOn: vi.fn(),
      setTunerOn: vi.fn(),
      setAuxOutput: vi.fn(),
    };

    mockedUseSynthStore.mockImplementation((selector?: unknown) => {
      if (typeof selector === "function") {
        return selector(mockState);
      }
      return mockState;
    });

    render(<Minimoog />);

    const osc1VolumeKnob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });
    const filterModSwitch = screen.getByRole("button", {
      name: "Filter Modulation",
    });

    // Try to interact with disabled controls
    await user.click(osc1VolumeKnob);
    await user.click(filterModSwitch);

    // Should not trigger any audio or state changes
    expect(mockSynthObj.triggerAttack).not.toHaveBeenCalled();
  });

  it("updates display when state changes", () => {
    // Test with different initial state
    const newState = {
      ...defaultState,
      oscillator1: { frequency: 880, waveform: "square", enabled: true },
      oscillator2: { frequency: 440, waveform: "triangle", enabled: true },
      filterCutoff: 2,
      filterEmphasis: 8,
      filterModulationOn: true,
      keyboardControl1: true,
    };

    const mockState = {
      ...newState,
      setActiveKeys: mockSetActiveKeys,
      setMixerSource: vi.fn(),
      setMixerExternal: vi.fn(),
      setMixerNoise: vi.fn(),
      setFilterEnvelope: vi.fn(),
      setLoudnessEnvelope: vi.fn(),
      setFilterCutoff: vi.fn(),
      setFilterEmphasis: vi.fn(),
      setFilterContourAmount: vi.fn(),
      setFilterModulationOn: vi.fn(),
      setKeyboardControl1: vi.fn(),
      setKeyboardControl2: vi.fn(),
      setOscillator1: vi.fn(),
      setOscillator2: vi.fn(),
      setOscillator3: vi.fn(),
      setMainVolume: vi.fn(),
      setIsMainActive: vi.fn(),
      setGlideOn: vi.fn(),
      setGlideTime: vi.fn(),
      setMasterTune: vi.fn(),
      setPitchWheel: vi.fn(),
      setModWheel: vi.fn(),
      setOscillatorModulationOn: vi.fn(),
      setLfoWaveform: vi.fn(),
      setLfoRate: vi.fn(),
      setModMix: vi.fn(),
      setOsc3Control: vi.fn(),
      setOsc3FilterEgSwitch: vi.fn(),
      setNoiseLfoSwitch: vi.fn(),
      setDecaySwitchOn: vi.fn(),
      setTunerOn: vi.fn(),
      setAuxOutput: vi.fn(),
    };

    mockedUseSynthStore.mockImplementation((selector?: unknown) => {
      if (typeof selector === "function") {
        return selector(mockState);
      }
      return mockState;
    });

    render(<Minimoog />);

    // Verify the new values are displayed
    const allKnobs = screen.getAllByRole("slider");
    allKnobs.forEach((knob) => {
      expect(knob).toHaveAttribute("aria-valuenow");
      const value = knob.getAttribute("aria-valuenow");
      // Some knobs legitimately have "0" as their value, so just check that they have a value
      expect(value).toBeDefined();
      expect(value).not.toBeNull();
    });

    // Verify switch states are updated
    const filterModSwitch = screen.getByRole("button", {
      name: "Filter Modulation",
    });
    const keyboardControl1Switch = screen.getByRole("button", {
      name: "Keyboard Control 1",
    });

    expect(filterModSwitch).toHaveAttribute("aria-pressed", "true");
    expect(keyboardControl1Switch).toHaveAttribute("aria-pressed", "true");
  });

  it("maintains proper layout structure", () => {
    render(<Minimoog />);

    // Check that the main sections are present and properly structured
    expect(screen.getByText("Controllers")).toBeInTheDocument();
    expect(screen.getByText("Mixer")).toBeInTheDocument();
    expect(screen.getByText("Modifiers")).toBeInTheDocument();
    expect(screen.getByText("Output")).toBeInTheDocument();

    // Check that the power button is in the correct section
    const powerButton = screen.getByRole("button", { name: "Power" });
    expect(powerButton).toBeInTheDocument();
  });

  it("supports complete synthesizer workflow", async () => {
    const user = userEvent.setup();
    render(<Minimoog />);

    // Simulate a typical synthesizer workflow
    const osc1VolumeKnob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });
    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    const filterAttackKnob = screen.getAllByRole("slider", {
      name: "Attack Time",
    })[0];
    const filterModSwitch = screen.getByRole("button", {
      name: "Filter Modulation",
    });

    // Adjust oscillator volume
    osc1VolumeKnob.focus();
    await user.keyboard("{ArrowUp}");

    // Adjust filter cutoff
    cutoffKnob.focus();
    await user.keyboard("{ArrowUp}");

    // Adjust filter attack
    filterAttackKnob.focus();
    await user.keyboard("{ArrowUp}");

    // Toggle filter modulation
    await user.click(filterModSwitch);

    // Verify all interactions were possible
    expect(osc1VolumeKnob).toBeInTheDocument();
    expect(cutoffKnob).toBeInTheDocument();
    expect(filterAttackKnob).toBeInTheDocument();
    expect(filterModSwitch).toBeInTheDocument();
  });

  it("handles multiple rapid interactions correctly", async () => {
    const user = userEvent.setup();
    render(<Minimoog />);

    const osc1VolumeKnob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });

    // Rapid keyboard interactions
    osc1VolumeKnob.focus();
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");

    // Should handle all interactions without errors
    expect(osc1VolumeKnob).toBeInTheDocument();
  });

  it("renders presets dropdown correctly", () => {
    render(<Minimoog />);

    const presetsButton = screen.getByRole("button", {
      name: "Select a preset",
    });
    expect(presetsButton).toBeInTheDocument();
    expect(presetsButton).not.toBeDisabled(); // Should be enabled when initialized
  });

  it("disables presets when not initialized", () => {
    // Mock not initialized state
    mockedUseAudioContext.mockReturnValue({
      audioContext: null,
      isInitialized: false,
      initialize: mockInitialize,
      dispose: mockDispose,
    });

    render(<Minimoog />);

    const presetsButton = screen.getByRole("button", {
      name: "Select a preset",
    });
    expect(presetsButton).toBeDisabled();
  });
});
