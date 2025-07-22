import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import Knob from "../Knob";

describe("Knob - User Behavior Tests", () => {
  const mockOnChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("responds to keyboard input", async () => {
    const user = userEvent.setup();
    render(
      <Knob
        value={5}
        onChange={mockOnChange}
        min={0}
        max={10}
        step={1}
        label="Volume"
      />
    );

    const knob = screen.getByRole("slider");
    knob.focus();

    // User presses arrow up
    await user.keyboard("{ArrowUp}");

    // Verify the knob responded to user input
    expect(mockOnChange).toHaveBeenCalled();
    expect(mockOnChange).toHaveBeenCalledWith(expect.any(Number));
  });

  it("shows current value to user", () => {
    render(
      <Knob
        value={7}
        onChange={mockOnChange}
        min={0}
        max={10}
        step={1}
        label="Filter Cutoff"
      />
    );

    const knob = screen.getByRole("slider");

    // User can see the current value
    expect(knob).toHaveAttribute("aria-valuenow", "7");
    expect(knob).toHaveAttribute("aria-label", "Filter Cutoff");
  });

  it("respects value boundaries", async () => {
    const user = userEvent.setup();
    render(
      <Knob
        value={0}
        onChange={mockOnChange}
        min={0}
        max={10}
        step={1}
        label="Volume"
      />
    );

    const knob = screen.getByRole("slider");
    knob.focus();

    // User tries to go below minimum
    await user.keyboard("{ArrowDown}");

    // Should stay at minimum
    expect(mockOnChange).toHaveBeenCalledWith(0);
  });

  it("can be disabled", () => {
    render(
      <Knob
        value={5}
        onChange={mockOnChange}
        min={0}
        max={10}
        step={1}
        label="Volume"
        disabled={true}
      />
    );

    const knob = screen.getByRole("slider");

    // User can see it's disabled (has disabled class)
    expect(knob).toHaveClass("disabled");
  });

  it("is accessible", () => {
    render(
      <Knob
        value={5}
        onChange={mockOnChange}
        min={0}
        max={10}
        step={1}
        label="Master Volume"
      />
    );

    const knob = screen.getByRole("slider");

    // Screen reader users can understand the control
    expect(knob).toHaveAttribute("aria-label", "Master Volume");
    expect(knob).toHaveAttribute("aria-valuemin", "0");
    expect(knob).toHaveAttribute("aria-valuemax", "10");
    expect(knob).toHaveAttribute("aria-valuenow", "5");
    expect(knob).toHaveAttribute("tabindex", "0");
  });
});
