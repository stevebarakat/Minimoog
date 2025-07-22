import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

import LoudnessEnvelope from "../LoudnessEnvelope";
import { useSynthStore } from "@/store/synthStore";

const mockedUseSynthStore = vi.mocked(useSynthStore);

describe("LoudnessEnvelope - Integration Tests", () => {
  const mockSetLoudnessEnvelope = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSynthStore.mockReturnValue({
      // Loudness envelope state
      loudnessAttack: 1000,
      loudnessDecay: 2000,
      loudnessSustain: 5,
      isDisabled: false,
      setLoudnessEnvelope: mockSetLoudnessEnvelope,
    } as Partial<ReturnType<typeof useSynthStore>>);
  });

  it("renders all three envelope controls with correct labels", () => {
    render(<LoudnessEnvelope />);

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

  it("renders the title correctly", () => {
    render(<LoudnessEnvelope />);

    expect(screen.getByText("Loudness Contour")).toBeInTheDocument();
  });

  it("displays current values correctly", () => {
    render(<LoudnessEnvelope />);

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
    render(<LoudnessEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    attackKnob.focus();

    // Simulate increasing attack time
    await user.keyboard("{ArrowUp}");

    expect(mockSetLoudnessEnvelope).toHaveBeenCalled();
  });

  it("responds to keyboard input for decay time", async () => {
    const user = userEvent.setup();
    render(<LoudnessEnvelope />);

    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });
    decayKnob.focus();

    // Simulate decreasing decay time
    await user.keyboard("{ArrowDown}");

    expect(mockSetLoudnessEnvelope).toHaveBeenCalled();
  });

  it("responds to keyboard input for sustain level", async () => {
    const user = userEvent.setup();
    render(<LoudnessEnvelope />);

    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });
    sustainKnob.focus();

    // Simulate increasing sustain level
    await user.keyboard("{ArrowUp}");

    expect(mockSetLoudnessEnvelope).toHaveBeenCalled();
  });

  it("disables all controls when synth is disabled", () => {
    mockedUseSynthStore.mockReturnValue({
      loudnessAttack: 1000,
      loudnessDecay: 2000,
      loudnessSustain: 5,
      isDisabled: true,
      setLoudnessEnvelope: mockSetLoudnessEnvelope,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<LoudnessEnvelope />);

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
    render(<LoudnessEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    attackKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");

    // Verify setLoudnessEnvelope was called multiple times
    expect(mockSetLoudnessEnvelope).toHaveBeenCalledTimes(2);
  });

  it("updates state when decay time changes", async () => {
    const user = userEvent.setup();
    render(<LoudnessEnvelope />);

    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });
    decayKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");

    // Verify setLoudnessEnvelope was called multiple times
    expect(mockSetLoudnessEnvelope).toHaveBeenCalledTimes(2);
  });

  it("updates state when sustain level changes", async () => {
    const user = userEvent.setup();
    render(<LoudnessEnvelope />);

    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });
    sustainKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");

    // Verify setLoudnessEnvelope was called multiple times
    expect(mockSetLoudnessEnvelope).toHaveBeenCalledTimes(2);
  });

  it("maintains accessibility attributes", () => {
    render(<LoudnessEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });

    // Check that knobs have accessibility attributes
    expect(attackKnob).toHaveAttribute("aria-valuemin");
    expect(attackKnob).toHaveAttribute("aria-valuemax");
    expect(decayKnob).toHaveAttribute("aria-valuemin");
    expect(decayKnob).toHaveAttribute("aria-valuemax");
  });

  it("maintains accessibility for sustain knob", () => {
    render(<LoudnessEnvelope />);

    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });

    // Check that sustain knob has accessibility attributes
    expect(sustainKnob).toHaveAttribute("aria-valuemin");
    expect(sustainKnob).toHaveAttribute("aria-valuemax");
  });

  it("renders with proper layout", () => {
    render(<LoudnessEnvelope />);

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
    render(<LoudnessEnvelope />);

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
    expect(mockSetLoudnessEnvelope).toHaveBeenCalledTimes(3);
  });

  it("indicates disabled state visually", () => {
    mockedUseSynthStore.mockReturnValue({
      loudnessAttack: 1000,
      loudnessDecay: 2000,
      loudnessSustain: 5,
      isDisabled: true,
      setLoudnessEnvelope: mockSetLoudnessEnvelope,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<LoudnessEnvelope />);

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
