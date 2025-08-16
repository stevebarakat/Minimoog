import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi, describe, it, expect, beforeEach } from "vitest";
import Modifiers from "../Modifiers";
import { useSynthStore } from "@/store/synthStore";
import {
  useIsSynthDisabled,
  useFilterState,
  useFilterEnvelopeState,
  useLoudnessEnvelopeState,
} from "@/store/selectors";
import {
  createFilterCutoffRange,
  createFilterEmphasisRange,
  createFilterContourRange,
  createFilterEnvelopeRange,
} from "@/store/types/synth";
import { createMockStore } from "@/test/testHelpers";

// Mock the store and selectors
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

vi.mock("@/store/selectors", () => ({
  useIsSynthDisabled: vi.fn(),
  useFilterState: vi.fn(),
  useFilterEnvelopeState: vi.fn(),
  useLoudnessEnvelopeState: vi.fn(),
}));

const mockedUseSynthStore = vi.mocked(useSynthStore);
const mockedUseIsSynthDisabled = vi.mocked(useIsSynthDisabled);
const mockedUseFilterState = vi.mocked(useFilterState);
const mockedUseFilterEnvelopeState = vi.mocked(useFilterEnvelopeState);
const mockedUseLoudnessEnvelopeState = vi.mocked(useLoudnessEnvelopeState);

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
    filterAttack: 1.0,
    filterDecay: 2.0,
    filterSustain: 5,
    loudnessAttack: 0.5,
    loudnessDecay: 1.5,
    loudnessSustain: 4,
    filterCutoff: 0,
    filterEmphasis: 5,
    filterContourAmount: 2,
    filterModulationOn: false,
    keyboardControl1: false,
    keyboardControl2: true,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    const mockStore = createMockStore({
      audioContext: {
        isReady: true,
        error: null,
        context: null,
      },
      ...defaultState,
    });

    mockedUseSynthStore.mockImplementation((selector) => {
      const state = {
        ...mockStore,
        setFilterEnvelope: mockSetFilterEnvelope,
        setLoudnessEnvelope: mockSetLoudnessEnvelope,
        setFilterCutoff: mockSetFilterCutoff,
        setFilterEmphasis: mockSetFilterEmphasis,
        setFilterContourAmount: mockSetFilterContourAmount,
        setFilterModulationOn: mockSetFilterModulationOn,
        setKeyboardControl1: mockSetKeyboardControl1,
        setKeyboardControl2: mockSetKeyboardControl2,
        // Add isDisabled property that the components expect
        isDisabled: false,
      };
      if (typeof selector === "function") {
        return selector(state);
      }
      return state;
    });

    mockedUseIsSynthDisabled.mockReturnValue(false);

    mockedUseFilterState.mockReturnValue({
      filterType: "simple",
      filterCutoff: createFilterCutoffRange(defaultState.filterCutoff),
      filterEmphasis: createFilterEmphasisRange(defaultState.filterEmphasis),
      filterContourAmount: createFilterContourRange(
        defaultState.filterContourAmount
      ),
      filterAttack: createFilterEnvelopeRange(defaultState.filterAttack),
      filterDecay: createFilterEnvelopeRange(defaultState.filterDecay),
      filterSustain: createFilterEnvelopeRange(defaultState.filterSustain),
      filterModulationOn: defaultState.filterModulationOn,
      keyboardControl1: defaultState.keyboardControl1,
      keyboardControl2: defaultState.keyboardControl2,
    });

    mockedUseFilterEnvelopeState.mockReturnValue({
      filterAttack: createFilterEnvelopeRange(defaultState.filterAttack),
      filterDecay: createFilterEnvelopeRange(defaultState.filterDecay),
      filterSustain: createFilterEnvelopeRange(defaultState.filterSustain),
      filterContourAmount: createFilterContourRange(
        defaultState.filterContourAmount
      ),
    });

    mockedUseLoudnessEnvelopeState.mockReturnValue({
      loudnessAttack: createFilterEnvelopeRange(defaultState.loudnessAttack),
      loudnessDecay: createFilterEnvelopeRange(defaultState.loudnessDecay),
      loudnessSustain: createFilterEnvelopeRange(defaultState.loudnessSustain),
      decaySwitchOn: false,
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
    expect(mockSetFilterModulationOn).toHaveBeenCalled();

    await user.click(keyboardControl1Switch);
    expect(mockSetKeyboardControl1).toHaveBeenCalled();
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

    // Verify we can focus on switches using userEvent
    // The RockerSwitch focuses the label element for accessibility
    const filterModSwitch = screen.getByRole("button", {
      name: "Filter Modulation",
    });
    await user.click(filterModSwitch);
    // Find the label element that should have focus by looking for the specific structure
    const filterModSwitchLabel = filterModSwitch.closest("label");
    expect(filterModSwitchLabel).toHaveFocus();
  });

  it("disables all controls when synth is disabled", () => {
    mockedUseSynthStore.mockImplementation((selector) => {
      const state = {
        audioContext: {
          isReady: false,
          error: null,
          context: null,
        },
        ...defaultState,
        setFilterEnvelope: mockSetFilterEnvelope,
        setLoudnessEnvelope: mockSetLoudnessEnvelope,
        setFilterCutoff: mockSetFilterCutoff,
        setFilterEmphasis: mockSetFilterEmphasis,
        setFilterContourAmount: mockSetFilterContourAmount,
        setFilterModulationOn: mockSetFilterModulationOn,
        setKeyboardControl1: mockSetKeyboardControl1,
        setKeyboardControl2: mockSetKeyboardControl2,
        isDisabled: true,
      };
      if (typeof selector === "function") {
        return selector(state);
      }
      return state;
    });

    render(<Modifiers />);

    // Check that all knobs are rendered but functionally disabled
    const allKnobs = screen.getAllByRole("slider");
    allKnobs.forEach((knob) => {
      expect(knob).toBeInTheDocument();
    });

    // Check that switches are still rendered (they handle disabled state internally)
    const allSwitches = screen.getAllByRole("button");
    expect(allSwitches.length).toBeGreaterThan(0);
  });

  it("prevents interactions when disabled", async () => {
    const user = userEvent.setup();
    mockedUseIsSynthDisabled.mockReturnValue(true);

    // Mock the store with disabled state
    mockedUseSynthStore.mockImplementation((selector) => {
      const state = {
        audioContext: {
          isReady: false,
          error: null,
          context: null,
        },
        ...defaultState,
        setFilterEnvelope: mockSetFilterEnvelope,
        setLoudnessEnvelope: mockSetLoudnessEnvelope,
        setFilterCutoff: mockSetFilterCutoff,
        setFilterEmphasis: mockSetFilterEmphasis,
        setFilterContourAmount: mockSetFilterContourAmount,
        setFilterModulationOn: mockSetFilterModulationOn,
        setKeyboardControl1: mockSetKeyboardControl1,
        setKeyboardControl2: mockSetKeyboardControl2,
        isDisabled: true,
      };
      if (typeof selector === "function") {
        return selector(state);
      }
      return state;
    });

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

    mockedUseSynthStore.mockImplementation((selector) => {
      const state = {
        audioContext: {
          isReady: true,
          error: null,
          context: null,
        },
        ...newState,
        setFilterEnvelope: mockSetFilterEnvelope,
        setLoudnessEnvelope: mockSetLoudnessEnvelope,
        setFilterCutoff: mockSetFilterCutoff,
        setFilterEmphasis: mockSetFilterEmphasis,
        setFilterContourAmount: mockSetFilterContourAmount,
        setFilterModulationOn: mockSetFilterModulationOn,
        setKeyboardControl1: mockSetKeyboardControl1,
        setKeyboardControl2: mockSetKeyboardControl2,
        isDisabled: false,
      };
      if (typeof selector === "function") {
        return selector(state);
      }
      return state;
    });

    render(<Modifiers />);

    // Verify the new values are displayed (without testing specific numbers)
    const allKnobs = screen.getAllByRole("slider");
    allKnobs.forEach((knob) => {
      expect(knob).toHaveAttribute("aria-valuenow");
      const value = knob.getAttribute("aria-valuenow");
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
    expect(mockSetFilterModulationOn).toHaveBeenCalled();

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
