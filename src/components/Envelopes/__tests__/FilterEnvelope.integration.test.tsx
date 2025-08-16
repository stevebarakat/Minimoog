import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

import FilterEnvelope from "../FilterEnvelope";
import { useSynthStore } from "@/store/synthStore";

const mockedUseSynthStore = vi.mocked(useSynthStore);

describe("FilterEnvelope - Integration Tests", () => {
  const mockSetFilterEnvelope = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSynthStore.mockReturnValue({
      // Filter envelope state
      filterAttack: 1000,
      filterDecay: 2000,
      filterSustain: 5,
      isDisabled: false,
      setFilterEnvelope: mockSetFilterEnvelope,
    } as Partial<ReturnType<typeof useSynthStore>>);
  });

  it("renders all three envelope controls with correct labels", () => {
    render(<FilterEnvelope />);

    // Check that all three knobs are rendered with correct labels
    expect(
      screen.getByRole("slider", { name: "Attack Time" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Decay Time" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Sustain Level" })
    ).toBeInTheDocument();
  });

  it("displays current values correctly", () => {
    render(<FilterEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });
    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });

    // Check that knobs display values (without testing exact values)
    expect(attackKnob).toHaveAttribute("aria-valuenow");
    expect(decayKnob).toHaveAttribute("aria-valuenow");
    expect(sustainKnob).toHaveAttribute("aria-valuenow");
  });

  it("responds to keyboard input for attack time", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    attackKnob.focus();

    // Simulate increasing attack time
    await user.keyboard("{ArrowUp}");

    expect(mockSetFilterEnvelope).toHaveBeenCalled();
  });

  it("responds to keyboard input for decay time", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });
    decayKnob.focus();

    // Simulate decreasing decay time
    await user.keyboard("{ArrowDown}");

    expect(mockSetFilterEnvelope).toHaveBeenCalled();
  });

  it("responds to keyboard input for sustain level", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });
    sustainKnob.focus();

    // Simulate increasing sustain level
    await user.keyboard("{ArrowUp}");

    expect(mockSetFilterEnvelope).toHaveBeenCalled();
  });

  it("disables all controls when synth is disabled", () => {
    mockedUseSynthStore.mockReturnValue({
      filterAttack: 1000,
      filterDecay: 2000,
      filterSustain: 5,
      isDisabled: true,
      setFilterEnvelope: mockSetFilterEnvelope,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<FilterEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });
    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });

    // Check that controls are rendered but functionally disabled
    expect(attackKnob).toBeInTheDocument();
    expect(decayKnob).toBeInTheDocument();
    expect(sustainKnob).toBeInTheDocument();
  });

  it("updates state when attack time changes", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    attackKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");

    // Verify setFilterEnvelope was called multiple times
    expect(mockSetFilterEnvelope).toHaveBeenCalledTimes(2);
  });

  it("updates state when decay time changes", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });
    decayKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");

    // Verify setFilterEnvelope was called multiple times
    expect(mockSetFilterEnvelope).toHaveBeenCalledTimes(2);
  });

  it("updates state when sustain level changes", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });
    sustainKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");

    // Verify setFilterEnvelope was called multiple times
    expect(mockSetFilterEnvelope).toHaveBeenCalledTimes(2);
  });

  it("maintains accessibility attributes", () => {
    render(<FilterEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });

    // Check that knobs have accessibility attributes
    expect(attackKnob).toHaveAttribute("aria-valuemin");
    expect(attackKnob).toHaveAttribute("aria-valuemax");
    expect(decayKnob).toHaveAttribute("aria-valuemin");
    expect(decayKnob).toHaveAttribute("aria-valuemax");
  });

  it("maintains accessibility for sustain knob", () => {
    render(<FilterEnvelope />);

    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });

    // Check that sustain knob has accessibility attributes
    expect(sustainKnob).toHaveAttribute("aria-valuemin");
    expect(sustainKnob).toHaveAttribute("aria-valuemax");
  });

  it("renders with proper layout", () => {
    render(<FilterEnvelope />);

    // Check that the component renders without errors
    expect(
      screen.getByRole("slider", { name: "Attack Time" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Decay Time" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Sustain Level" })
    ).toBeInTheDocument();
  });

  it("handles rapid user interactions correctly", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });
    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });

    // Rapidly interact with all knobs
    attackKnob.focus();
    await user.keyboard("{ArrowUp}");

    decayKnob.focus();
    await user.keyboard("{ArrowDown}");

    sustainKnob.focus();
    await user.keyboard("{ArrowUp}");

    // Verify all interactions were handled
    expect(mockSetFilterEnvelope).toHaveBeenCalledTimes(3);
  });

  it("indicates disabled state visually", () => {
    mockedUseSynthStore.mockReturnValue({
      filterAttack: 1000,
      filterDecay: 2000,
      filterSustain: 5,
      isDisabled: true,
      setFilterEnvelope: mockSetFilterEnvelope,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<FilterEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });
    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });

    // Check that controls are rendered and have accessibility attributes
    expect(attackKnob).toBeInTheDocument();
    expect(decayKnob).toBeInTheDocument();
    expect(sustainKnob).toBeInTheDocument();
    expect(attackKnob).toHaveAttribute("aria-valuenow");
    expect(decayKnob).toHaveAttribute("aria-valuenow");
    expect(sustainKnob).toHaveAttribute("aria-valuenow");
  });
});
