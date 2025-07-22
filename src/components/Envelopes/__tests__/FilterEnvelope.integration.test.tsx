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

    // Check that knobs have correct current values
    // valueToKnobPos(1000) = 6000 (1 second maps to position 6000)
    // valueToKnobPos(2000) = 6500 (2 seconds maps to position 6500)
    expect(attackKnob).toHaveAttribute("aria-valuenow", "6000");
    expect(decayKnob).toHaveAttribute("aria-valuenow", "6500");
    expect(sustainKnob).toHaveAttribute("aria-valuenow", "5");
  });

  it("responds to keyboard input for attack time", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    attackKnob.focus();

    // Simulate increasing attack time
    await user.keyboard("{ArrowUp}");

    expect(mockSetFilterEnvelope).toHaveBeenCalledWith({
      attack: expect.any(Number),
    });
  });

  it("responds to keyboard input for decay time", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });
    decayKnob.focus();

    // Simulate decreasing decay time
    await user.keyboard("{ArrowDown}");

    expect(mockSetFilterEnvelope).toHaveBeenCalledWith({
      decay: expect.any(Number),
    });
  });

  it("responds to keyboard input for sustain level", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });
    sustainKnob.focus();

    // Simulate increasing sustain level
    await user.keyboard("{ArrowUp}");

    expect(mockSetFilterEnvelope).toHaveBeenCalledWith({
      sustain: expect.any(Number),
    });
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

    // Check that the disabled class is applied (which makes cursor not-allowed)
    expect(attackKnob).toHaveClass("disabled");
    expect(decayKnob).toHaveClass("disabled");
    expect(sustainKnob).toHaveClass("disabled");
  });

  it("updates state with correct values when attack time changes", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    attackKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");

    // Verify setFilterEnvelope was called multiple times
    expect(mockSetFilterEnvelope).toHaveBeenCalledTimes(2);

    // Verify the calls were for attack parameter
    expect(mockSetFilterEnvelope).toHaveBeenNthCalledWith(1, {
      attack: expect.any(Number),
    });
    expect(mockSetFilterEnvelope).toHaveBeenNthCalledWith(2, {
      attack: expect.any(Number),
    });
  });

  it("updates state with correct values when decay time changes", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });
    decayKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");

    // Verify setFilterEnvelope was called multiple times
    expect(mockSetFilterEnvelope).toHaveBeenCalledTimes(2);

    // Verify the calls were for decay parameter
    expect(mockSetFilterEnvelope).toHaveBeenNthCalledWith(1, {
      decay: expect.any(Number),
    });
    expect(mockSetFilterEnvelope).toHaveBeenNthCalledWith(2, {
      decay: expect.any(Number),
    });
  });

  it("updates state with correct values when sustain level changes", async () => {
    const user = userEvent.setup();
    render(<FilterEnvelope />);

    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });
    sustainKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");

    // Verify setFilterEnvelope was called multiple times
    expect(mockSetFilterEnvelope).toHaveBeenCalledTimes(2);

    // Verify the calls were for sustain parameter
    expect(mockSetFilterEnvelope).toHaveBeenNthCalledWith(1, {
      sustain: expect.any(Number),
    });
    expect(mockSetFilterEnvelope).toHaveBeenNthCalledWith(2, {
      sustain: expect.any(Number),
    });
  });

  it("maintains correct value ranges for attack and decay knobs", () => {
    render(<FilterEnvelope />);

    const attackKnob = screen.getByRole("slider", { name: "Attack Time" });
    const decayKnob = screen.getByRole("slider", { name: "Decay Time" });

    // Attack and decay knobs should have 0-10000 range with 100 step
    expect(attackKnob).toHaveAttribute("aria-valuemin", "0");
    expect(attackKnob).toHaveAttribute("aria-valuemax", "10000");
    expect(decayKnob).toHaveAttribute("aria-valuemin", "0");
    expect(decayKnob).toHaveAttribute("aria-valuemax", "10000");
  });

  it("maintains correct value range for sustain knob", () => {
    render(<FilterEnvelope />);

    const sustainKnob = screen.getByRole("slider", { name: "Sustain Level" });

    // Sustain knob should have 0-10 range with 1 step
    expect(sustainKnob).toHaveAttribute("aria-valuemin", "0");
    expect(sustainKnob).toHaveAttribute("aria-valuemax", "10");
  });

  it("applies correct styling and layout", () => {
    render(<FilterEnvelope />);

    // Check that the component has the expected styling
    const container = screen
      .getByRole("slider", { name: "Attack Time" })
      .closest('[style*="padding-right"]');
    expect(container).toBeInTheDocument();
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
});
