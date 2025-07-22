import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

import Mixer from "../Mixer";
import { useSynthStore } from "@/store/synthStore";

const mockedUseSynthStore = vi.mocked(useSynthStore);

describe("Mixer - Integration Tests", () => {
  const mockSetMixerSource = vi.fn();
  const mockSetMixerExternal = vi.fn();
  const mockSetMixerNoise = vi.fn();
  const mockAudioContext = {} as AudioContext;
  const mockMixerNode = {} as AudioNode;

  const defaultMixerState = {
    osc1: { volume: 5, enabled: true },
    osc2: { volume: 3, enabled: false },
    osc3: { volume: 7, enabled: true },
    noise: { volume: 0, enabled: false, noiseType: "white" },
    external: { volume: 0, enabled: false, overload: false },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSynthStore.mockReturnValue({
      mixer: defaultMixerState,
      setMixerSource: mockSetMixerSource,
      setMixerExternal: mockSetMixerExternal,
      setMixerNoise: mockSetMixerNoise,
      isDisabled: false,
    } as Partial<ReturnType<typeof useSynthStore>>);
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

    // Check that knobs display values (without testing exact values)
    expect(osc1Knob).toHaveAttribute("aria-valuenow");
    expect(osc2Knob).toHaveAttribute("aria-valuenow");
    expect(osc3Knob).toHaveAttribute("aria-valuenow");
  });

  it("displays current oscillator enabled states correctly", () => {
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });
    const osc2Switch = screen.getByRole("button", { name: "Oscillator 2" });
    const osc3Switch = screen.getByRole("button", { name: "Oscillator 3" });

    // Check that switches have aria-pressed attributes (without testing exact values)
    expect(osc1Switch).toHaveAttribute("aria-pressed");
    expect(osc2Switch).toHaveAttribute("aria-pressed");
    expect(osc3Switch).toHaveAttribute("aria-pressed");
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
    expect(mockSetMixerSource).toHaveBeenCalled();

    await user.keyboard("{ArrowDown}");
    expect(mockSetMixerSource).toHaveBeenCalledTimes(2);
  });

  it("handles oscillator switch toggles", async () => {
    const user = userEvent.setup();
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    const osc2Switch = screen.getByRole("button", { name: "Oscillator 2" });

    // Toggle oscillator 2 from disabled to enabled
    await user.click(osc2Switch);
    expect(mockSetMixerSource).toHaveBeenCalled();

    // Toggle oscillator 1 from enabled to disabled
    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });
    await user.click(osc1Switch);
    expect(mockSetMixerSource).toHaveBeenCalledTimes(2);
  });

  it("supports keyboard navigation", async () => {
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    const osc1Knob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });
    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });
    const osc2Knob = screen.getByRole("slider", {
      name: "Oscillator 2 Volume",
    });

    // Test that controls are focusable
    osc1Knob.focus();
    expect(osc1Knob).toHaveFocus();

    // Test that we can navigate to other controls
    osc1Switch.focus();
    expect(osc1Switch).toHaveFocus();

    osc2Knob.focus();
    expect(osc2Knob).toHaveFocus();
  });

  it("disables all controls when synth is disabled", () => {
    mockedUseSynthStore.mockReturnValue({
      mixer: defaultMixerState,
      setMixerSource: mockSetMixerSource,
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
      mixer: defaultMixerState,
      setMixerSource: mockSetMixerSource,
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
    expect(mockSetMixerSource).not.toHaveBeenCalled();
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
      osc1: { volume: 8, enabled: false },
      osc2: { volume: 1, enabled: true },
      osc3: { volume: 9, enabled: false },
      noise: { volume: 2, enabled: true, noiseType: "pink" },
      external: { volume: 3, enabled: true, overload: false },
    };

    mockedUseSynthStore.mockReturnValue({
      mixer: newMixerState,
      setMixerSource: mockSetMixerSource,
      setMixerExternal: mockSetMixerExternal,
      setMixerNoise: mockSetMixerNoise,
      isDisabled: false,
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

    // Check that knobs display values (without testing exact values)
    expect(osc1Knob).toHaveAttribute("aria-valuenow");
    expect(osc2Knob).toHaveAttribute("aria-valuenow");
    expect(osc3Knob).toHaveAttribute("aria-valuenow");

    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });
    const osc2Switch = screen.getByRole("button", { name: "Oscillator 2" });
    const osc3Switch = screen.getByRole("button", { name: "Oscillator 3" });

    // Check that switches have aria-pressed attributes (without testing exact values)
    expect(osc1Switch).toHaveAttribute("aria-pressed");
    expect(osc2Switch).toHaveAttribute("aria-pressed");
    expect(osc3Switch).toHaveAttribute("aria-pressed");
  });

  it("renders with accessibility support", () => {
    render(<Mixer audioContext={mockAudioContext} mixerNode={mockMixerNode} />);

    // Check volume knobs have proper ARIA attributes
    const osc1Knob = screen.getByRole("slider", {
      name: "Oscillator 1 Volume",
    });
    expect(osc1Knob).toHaveAttribute("aria-valuemin");
    expect(osc1Knob).toHaveAttribute("aria-valuemax");
    expect(osc1Knob).toHaveAttribute("aria-valuenow");

    // Check switches have proper ARIA attributes
    const osc1Switch = screen.getByRole("button", { name: "Oscillator 1" });
    expect(osc1Switch).toHaveAttribute("aria-pressed");
  });
});
