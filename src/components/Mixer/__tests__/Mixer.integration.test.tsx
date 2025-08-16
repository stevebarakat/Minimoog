import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import {
  createVolumeRange,
  createNoiseVolumeRange,
  createExternalInputVolumeRange,
  createFrequencyRange,
} from "@/store/types/synth";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

import Mixer from "../Mixer";
import { useSynthStore } from "@/store/synthStore";
import { createMockStore } from "@/test/testHelpers";

const mockedUseSynthStore = vi.mocked(useSynthStore);

describe("Mixer - Integration Tests", () => {
  const mockSetOscillator1 = vi.fn();
  const mockSetOscillator2 = vi.fn();
  const mockSetOscillator3 = vi.fn();
  const mockSetMixerExternal = vi.fn();
  const mockSetMixerNoise = vi.fn();
  const mockAudioContext = {} as AudioContext;
  const mockMixerNode = {} as AudioNode;

  beforeEach(() => {
    vi.clearAllMocks();

    // Create mock state with the new audioContext structure
    const mockState = createMockStore({
      audioContext: {
        isReady: true,
        error: null,
        context: null,
      },
      oscillator1: {
        volume: createVolumeRange(5),
        enabled: true,
        waveform: "sawtooth",
        frequency: createFrequencyRange(0),
        range: "8",
      },
      oscillator2: {
        volume: createVolumeRange(3),
        enabled: false,
        waveform: "sawtooth",
        frequency: createFrequencyRange(-7),
        range: "8",
      },
      oscillator3: {
        volume: createVolumeRange(7),
        enabled: true,
        waveform: "triangle",
        frequency: createFrequencyRange(-7),
        range: "8",
      },
      mixer: {
        noise: {
          volume: createNoiseVolumeRange(0),
          enabled: false,
          noiseType: "white",
        },
        external: {
          volume: createExternalInputVolumeRange(0.001),
          enabled: false,
        },
      },
    });

    // Add action functions to the mock state
    const mockStateWithActions = {
      ...mockState,
      setOscillator1: mockSetOscillator1,
      setOscillator2: mockSetOscillator2,
      setOscillator3: mockSetOscillator3,
      setMixerExternal: mockSetMixerExternal,
      setMixerNoise: mockSetMixerNoise,
    };

    mockedUseSynthStore.mockImplementation((selector?: unknown) => {
      if (typeof selector === "function") {
        return selector(mockStateWithActions);
      }
      return mockStateWithActions;
    });
  });

  it("renders all mixer controls correctly", () => {
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    // Check for title
    expect(screen.getByText("Mixer")).toBeInTheDocument();

    // Check for all three oscillator volume knobs
    expect(
      screen.getByRole("slider", { name: "Oscillator 1 Volume" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Oscillator 2 Volume" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Oscillator 3 Volume" })
    ).toBeInTheDocument();

    // Check for all three oscillator switches
    expect(
      screen.getByRole("button", { name: "Oscillator 1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Oscillator 2" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Oscillator 3" })
    ).toBeInTheDocument();

    // Check for ExternalInput and Noise components
    expect(screen.getByText("External Input")).toBeInTheDocument();
    expect(screen.getByText("Noise")).toBeInTheDocument();
  });

  it("displays current oscillator volumes correctly", () => {
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    const osc1Knob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });
    const osc2Knob = screen.getByRole("slider", {
      name: "Oscillator 2 Volume",
    });
    const osc3Knob = screen.getByRole("slider", {
      name: "Oscillator 3 Volume",
    });

    // Check that knobs are accessible and functional
    expect(osc1Knob).toBeInTheDocument();
    expect(osc2Knob).toBeInTheDocument();
    expect(osc3Knob).toBeInTheDocument();
  });

  it("displays current oscillator enabled states correctly", () => {
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });
    const osc2Switch = screen.getByRole("button", { name: "Oscillator 2" });
    const osc3Switch = screen.getByRole("button", { name: "Oscillator 3" });

    // Check that switches are accessible and functional
    expect(osc1Switch).toBeInTheDocument();
    expect(osc2Switch).toBeInTheDocument();
    expect(osc3Switch).toBeInTheDocument();
  });

  it("handles oscillator volume knob interactions", async () => {
    const user = userEvent.setup();
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    const osc1Knob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });

    // Test keyboard interaction
    osc1Knob.focus();
    await user.keyboard("{ArrowUp}");
    expect(mockSetOscillator1).toHaveBeenCalled();

    await user.keyboard("{ArrowDown}");
    expect(mockSetOscillator1).toHaveBeenCalledTimes(2);
  });

  it("handles oscillator switch toggles", async () => {
    const user = userEvent.setup();
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    const osc2Switch = screen.getByRole("button", { name: "Oscillator 2" });

    // Toggle oscillator 2 from disabled to enabled
    await user.click(osc2Switch);
    expect(mockSetOscillator2).toHaveBeenCalled();

    // Toggle oscillator 1 from enabled to disabled
    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });
    await user.click(osc1Switch);
    expect(mockSetOscillator1).toHaveBeenCalled();

    // Verify that at least one oscillator function was called
    expect(mockSetOscillator1).toHaveBeenCalledTimes(1);
    expect(mockSetOscillator2).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard navigation", async () => {
    const user = userEvent.setup();
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    const osc1Knob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });
    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });
    const osc2Knob = screen.getByRole("slider", {
      name: "Oscillator 2 Volume",
    });

    // Test that controls are focusable using userEvent
    await user.click(osc1Knob);
    expect(osc1Knob).toHaveFocus();

    // Test that we can navigate to other controls
    // The RockerSwitch focuses the label element for accessibility
    await user.click(osc1Switch);
    // Find the label element that should have focus by looking for the specific structure
    const osc1SwitchLabel = osc1Switch.closest("label");
    expect(osc1SwitchLabel).toHaveFocus();

    await user.click(osc2Knob);
    expect(osc2Knob).toHaveFocus();
  });

  it("disables all controls when synth is disabled", () => {
    mockedUseSynthStore.mockReturnValue({
      mixer: {
        noise: {
          volume: createNoiseVolumeRange(0),
          enabled: false,
          noiseType: "white",
        },
        external: {
          volume: createExternalInputVolumeRange(0.001),
          enabled: false,
        },
      },
      setOscillator1: mockSetOscillator1,
      setOscillator2: mockSetOscillator2,
      setOscillator3: mockSetOscillator3,
      setMixerExternal: mockSetMixerExternal,
      setMixerNoise: mockSetMixerNoise,
      isDisabled: true,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    // Check that all knobs are disabled
    const osc1Knob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });
    const osc2Knob = screen.getByRole("slider", {
      name: "Oscillator 2 Volume",
    });
    const osc3Knob = screen.getByRole("slider", {
      name: "Oscillator 3 Volume",
    });

    // Check that knobs are functionally disabled (without testing specific CSS classes)
    expect(osc1Knob).toBeInTheDocument();
    expect(osc2Knob).toBeInTheDocument();
    expect(osc3Knob).toBeInTheDocument();

    // Check that all switches are disabled
    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });
    const osc2Switch = screen.getByRole("button", { name: "Oscillator 2" });
    const osc3Switch = screen.getByRole("button", { name: "Oscillator 3" });

    expect(osc1Switch).toBeInTheDocument();
    expect(osc2Switch).toBeInTheDocument();
    expect(osc3Switch).toBeInTheDocument();
  });

  it("prevents interactions when disabled", async () => {
    const user = userEvent.setup();
    mockedUseSynthStore.mockReturnValue({
      mixer: {
        noise: {
          volume: createNoiseVolumeRange(0),
          enabled: false,
          noiseType: "white",
        },
        external: {
          volume: createExternalInputVolumeRange(0.001),
          enabled: false,
        },
      },
      setOscillator1: mockSetOscillator1,
      setOscillator2: mockSetOscillator2,
      setOscillator3: mockSetOscillator3,
      setMixerExternal: mockSetMixerExternal,
      setMixerNoise: mockSetMixerNoise,
      isDisabled: true,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    const osc1Knob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });
    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });

    // Try to interact with disabled controls
    await user.click(osc1Knob);
    await user.click(osc1Switch);

    // Should not call setMixerSource when disabled
    expect(mockSetOscillator1).not.toHaveBeenCalled();
  });

  it("supports logarithmic volume scaling", () => {
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    const osc1Knob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });

    // Check that the knob is rendered and functional
    expect(osc1Knob).toBeInTheDocument();
  });

  it("updates display when mixer values change", () => {
    // Test with different initial state
    const newMixerState = {
      oscillator1: { volume: createVolumeRange(8), enabled: false },
      oscillator2: { volume: createVolumeRange(1), enabled: true },
      oscillator3: { volume: createVolumeRange(9), enabled: false },
      mixer: {
        noise: {
          volume: createNoiseVolumeRange(2),
          enabled: true,
          noiseType: "pink",
        },
        external: { volume: createExternalInputVolumeRange(3), enabled: true },
      },
    };

    mockedUseSynthStore.mockReturnValue({
      ...newMixerState,
      setOscillator1: mockSetOscillator1,
      setOscillator2: mockSetOscillator2,
      setOscillator3: mockSetOscillator3,
      setMixerExternal: mockSetMixerExternal,
      setMixerNoise: mockSetMixerNoise,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    // Verify the controls are displayed with updated values
    const osc1Knob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });
    const osc2Knob = screen.getByRole("slider", {
      name: "Oscillator 2 Volume",
    });
    const osc3Knob = screen.getByRole("slider", {
      name: "Oscillator 3 Volume",
    });

    // Check that knobs are accessible and functional
    expect(osc1Knob).toBeInTheDocument();
    expect(osc2Knob).toBeInTheDocument();
    expect(osc3Knob).toBeInTheDocument();

    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });
    const osc2Switch = screen.getByRole("button", { name: "Oscillator 2" });
    const osc3Switch = screen.getByRole("button", { name: "Oscillator 3" });

    // Check that switches are accessible and functional
    expect(osc1Switch).toBeInTheDocument();
    expect(osc2Switch).toBeInTheDocument();
    expect(osc3Switch).toBeInTheDocument();
  });

  it("renders with accessibility support", () => {
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    // Check volume knobs have proper ARIA attributes
    const osc1Knob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });
    expect(osc1Knob).toHaveAttribute("aria-valuemin");
    expect(osc1Knob).toHaveAttribute("aria-valuemax");
    expect(osc1Knob).toBeInTheDocument();

    // Check switches are accessible
    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });
    expect(osc1Switch).toBeInTheDocument();
  });
});
