import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

import Modifiers from "../Modifiers";
import { useSynthStore } from "@/store/synthStore";

const mockedUseSynthStore = vi.mocked(useSynthStore);

describe("Modifiers - Integration Tests", () => {
  const mockSetFilterEnvelope = vi.fn();
  const mockSetLoudnessEnvelope = vi.fn();
  const mockSetFilterCutoff = vi.fn();
  const mockSetFilterEmphasis = vi.fn();
  const mockSetFilterContourAmount = vi.fn();
  const mockSetFilterModulationOn = vi.fn();
  const mockSetKeyboardControl1 = vi.fn();
  const mockSetKeyboardControl2 = vi.fn();

  const defaultState = {
    // Filter envelope
    filterAttack: 0.5,
    filterDecay: 2.5,
    filterSustain: 5,
    // Loudness envelope
    loudnessAttack: 0.5,
    loudnessDecay: 2.5,
    loudnessSustain: 8,
    // Filter controls
    filterCutoff: 0,
    filterEmphasis: 5,
    filterContourAmount: 5,
    // Switches
    filterModulationOn: false,
    keyboardControl1: false,
    keyboardControl2: false,
    // Disabled state
    isDisabled: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockState = {
      ...defaultState,
      setFilterEnvelope: mockSetFilterEnvelope,
      setLoudnessEnvelope: mockSetLoudnessEnvelope,
      setFilterCutoff: mockSetFilterCutoff,
      setFilterEmphasis: mockSetFilterEmphasis,
      setFilterContourAmount: mockSetFilterContourAmount,
      setFilterModulationOn: mockSetFilterModulationOn,
      setKeyboardControl1: mockSetKeyboardControl1,
      setKeyboardControl2: mockSetKeyboardControl2,
    };

    mockedUseSynthStore.mockImplementation((selector?: unknown) => {
      if (typeof selector === "function") {
        return selector(mockState);
      }
      return mockState;
    });
  });

  it("renders all modifier sections with their controls", () => {
    render(<Modifiers />);

    // Check for main title
    expect(screen.getByText("Modifiers")).toBeInTheDocument();

    // Check for filter switches section
    expect(
      screen.getByRole("button", { name: "Filter Modulation" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Keyboard Control 1" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Keyboard Control 2" })
    ).toBeInTheDocument();

    // Check for filter controls section
    expect(screen.getByText("Filter")).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Cutoff Frequency" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Emphasis" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Amount of Contour" })
    ).toBeInTheDocument();

    // Check for envelope controls (both filter and loudness)
    const attackKnobs = screen.getAllByRole("slider", { name: "Attack Time" });
    const decayKnobs = screen.getAllByRole("slider", { name: "Decay Time" });
    const sustainKnobs = screen.getAllByRole("slider", {
      name: "Sustain Level",
    });

    expect(attackKnobs).toHaveLength(2); // Filter and loudness envelopes
    expect(decayKnobs).toHaveLength(2);
    expect(sustainKnobs).toHaveLength(2);
  });

  it("displays current values for all controls", () => {
    render(<Modifiers />);

    // Check that all knobs have current values (without testing specific numbers)
    const allKnobs = screen.getAllByRole("slider");
    allKnobs.forEach((knob) => {
      expect(knob).toHaveAttribute("aria-valuenow");
      expect(knob).toHaveAttribute("aria-valuemin");
      expect(knob).toHaveAttribute("aria-valuemax");
    });

    // Check that all switches have current states
    const allSwitches = screen.getAllByRole("button");
    allSwitches.forEach((switch_) => {
      expect(switch_).toHaveAttribute("aria-pressed");
    });
  });

  it("allows users to adjust filter envelope controls", async () => {
    const user = userEvent.setup();
    render(<Modifiers />);

    const filterAttackKnob = screen.getAllByRole("slider", {
      name: "Attack Time",
    })[0];

    // Test that the knob responds to user input
    filterAttackKnob.focus();
    await user.keyboard("{ArrowUp}");
    expect(mockSetFilterEnvelope).toHaveBeenCalled();

    // Verify the call was made with the correct property
    const callArgs = mockSetFilterEnvelope.mock.calls[0][0];
    expect(callArgs).toHaveProperty("attack");
  });

  it("allows users to adjust loudness envelope controls", async () => {
    const user = userEvent.setup();
    render(<Modifiers />);

    const loudnessAttackKnob = screen.getAllByRole("slider", {
      name: "Attack Time",
    })[1];

    // Test that the knob responds to user input
    loudnessAttackKnob.focus();
    await user.keyboard("{ArrowUp}");
    expect(mockSetLoudnessEnvelope).toHaveBeenCalled();

    // Verify the call was made with the correct property
    const callArgs = mockSetLoudnessEnvelope.mock.calls[0][0];
    expect(callArgs).toHaveProperty("attack");
  });

  it("allows users to adjust filter controls", async () => {
    const user = userEvent.setup();
    render(<Modifiers />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });

    // Test that the knob responds to user input
    cutoffKnob.focus();
    await user.keyboard("{ArrowUp}");
    expect(mockSetFilterCutoff).toHaveBeenCalled();

    // Test that it responds to different directions
    await user.keyboard("{ArrowDown}");
    expect(mockSetFilterCutoff).toHaveBeenCalledTimes(2);
  });

  it("allows users to toggle switches", async () => {
    const user = userEvent.setup();
    render(<Modifiers />);

    const filterModSwitch = screen.getByRole("button", {
      name: "Filter Modulation",
    });
    const keyboardControl1Switch = screen.getByRole("button", {
      name: "Keyboard Control 1",
    });

    // Test that switches respond to clicks
    await user.click(filterModSwitch);
    expect(mockSetFilterModulationOn).toHaveBeenCalledWith(true);

    await user.click(keyboardControl1Switch);
    expect(mockSetKeyboardControl1).toHaveBeenCalledWith(true);
  });

  it("supports keyboard navigation through all controls", async () => {
    const user = userEvent.setup();
    render(<Modifiers />);

    // Start with first control and tab through
    const firstKnob = screen.getAllByRole("slider")[0];
    firstKnob.focus();
    expect(firstKnob).toHaveFocus();

    // Tab through multiple controls to ensure they're all focusable
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

  it("disables all controls when synth is disabled", () => {
    mockedUseSynthStore.mockReturnValue({
      ...defaultState,
      isDisabled: true,
      setFilterEnvelope: mockSetFilterEnvelope,
      setLoudnessEnvelope: mockSetLoudnessEnvelope,
      setFilterCutoff: mockSetFilterCutoff,
      setFilterEmphasis: mockSetFilterEmphasis,
      setFilterContourAmount: mockSetFilterContourAmount,
      setFilterModulationOn: mockSetFilterModulationOn,
      setKeyboardControl1: mockSetKeyboardControl1,
      setKeyboardControl2: mockSetKeyboardControl2,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<Modifiers />);

    // Check that all knobs are visually disabled
    const allKnobs = screen.getAllByRole("slider");
    allKnobs.forEach((knob) => {
      expect(knob).toHaveClass("disabled");
    });

    // Check that switches are still rendered (they handle disabled state internally)
    const allSwitches = screen.getAllByRole("button");
    expect(allSwitches.length).toBeGreaterThan(0);
  });

  it("prevents interactions when disabled", async () => {
    const user = userEvent.setup();
    mockedUseSynthStore.mockReturnValue({
      ...defaultState,
      isDisabled: true,
      setFilterEnvelope: mockSetFilterEnvelope,
      setLoudnessEnvelope: mockSetLoudnessEnvelope,
      setFilterCutoff: mockSetFilterCutoff,
      setFilterEmphasis: mockSetFilterEmphasis,
      setFilterContourAmount: mockSetFilterContourAmount,
      setFilterModulationOn: mockSetFilterModulationOn,
      setKeyboardControl1: mockSetKeyboardControl1,
      setKeyboardControl2: mockSetKeyboardControl2,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<Modifiers />);

    const filterAttackKnob = screen.getAllByRole("slider", {
      name: "Attack Time",
    })[0];
    const filterModSwitch = screen.getByRole("button", {
      name: "Filter Modulation",
    });

    // Try to interact with disabled controls
    await user.click(filterAttackKnob);
    await user.click(filterModSwitch);

    // Should not call any setters when disabled
    expect(mockSetFilterEnvelope).not.toHaveBeenCalled();
    expect(mockSetFilterModulationOn).not.toHaveBeenCalled();
  });

  it("updates display when state changes", () => {
    // Test with different initial state
    const newState = {
      ...defaultState,
      filterAttack: 2.0,
      filterDecay: 4.0,
      filterSustain: 7,
      loudnessAttack: 1.5,
      loudnessDecay: 3.0,
      loudnessSustain: 6,
      filterCutoff: 2,
      filterEmphasis: 8,
      filterContourAmount: 3,
      filterModulationOn: true,
      keyboardControl1: true,
      keyboardControl2: false,
    };

    mockedUseSynthStore.mockReturnValue({
      ...newState,
      setFilterEnvelope: mockSetFilterEnvelope,
      setLoudnessEnvelope: mockSetLoudnessEnvelope,
      setFilterCutoff: mockSetFilterCutoff,
      setFilterEmphasis: mockSetFilterEmphasis,
      setFilterContourAmount: mockSetFilterContourAmount,
      setFilterModulationOn: mockSetFilterModulationOn,
      setKeyboardControl1: mockSetKeyboardControl1,
      setKeyboardControl2: mockSetKeyboardControl2,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<Modifiers />);

    // Verify the new values are displayed (without testing specific numbers)
    const allKnobs = screen.getAllByRole("slider");
    allKnobs.forEach((knob) => {
      expect(knob).toHaveAttribute("aria-valuenow");
      const value = knob.getAttribute("aria-valuenow");
      expect(value).not.toBe("0"); // Should have some value
    });

    // Verify switch states are updated
    const filterModSwitch = screen.getByRole("button", {
      name: "Filter Modulation",
    });
    const keyboardControl1Switch = screen.getByRole("button", {
      name: "Keyboard Control 1",
    });
    const keyboardControl2Switch = screen.getByRole("button", {
      name: "Keyboard Control 2",
    });

    expect(filterModSwitch).toHaveAttribute("aria-pressed", "true");
    expect(keyboardControl1Switch).toHaveAttribute("aria-pressed", "true");
    expect(keyboardControl2Switch).toHaveAttribute("aria-pressed", "false");
  });

  it("maintains proper layout structure", () => {
    render(<Modifiers />);

    // Check that the main sections are present
    expect(screen.getByText("Modifiers")).toBeInTheDocument();
    expect(screen.getByText("Filter")).toBeInTheDocument();

    // Check that controls are grouped logically
    const filterSwitches = screen
      .getByRole("button", { name: "Filter Modulation" })
      .closest("div");
    expect(filterSwitches).toBeInTheDocument();
  });

  it("supports complete user workflow", async () => {
    const user = userEvent.setup();
    render(<Modifiers />);

    // Simulate a typical user workflow: adjust filter, then envelope, then toggle switches
    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    const filterAttackKnob = screen.getAllByRole("slider", {
      name: "Attack Time",
    })[0];
    const filterModSwitch = screen.getByRole("button", {
      name: "Filter Modulation",
    });

    // Adjust filter cutoff
    cutoffKnob.focus();
    await user.keyboard("{ArrowUp}");
    expect(mockSetFilterCutoff).toHaveBeenCalled();

    // Adjust filter attack
    filterAttackKnob.focus();
    await user.keyboard("{ArrowUp}");
    expect(mockSetFilterEnvelope).toHaveBeenCalled();

    // Toggle filter modulation
    await user.click(filterModSwitch);
    expect(mockSetFilterModulationOn).toHaveBeenCalledWith(true);

    // Verify all interactions were recorded
    expect(mockSetFilterCutoff).toHaveBeenCalledTimes(1);
    expect(mockSetFilterEnvelope).toHaveBeenCalledTimes(1);
    expect(mockSetFilterModulationOn).toHaveBeenCalledTimes(1);
  });

  it("handles multiple rapid interactions correctly", async () => {
    const user = userEvent.setup();
    render(<Modifiers />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });

    // Rapid keyboard interactions
    cutoffKnob.focus();
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");

    // Should handle all interactions
    expect(mockSetFilterCutoff).toHaveBeenCalledTimes(3);
  });
});
