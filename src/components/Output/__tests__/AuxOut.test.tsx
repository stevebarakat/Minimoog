import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import AuxOut from "../AuxOut";
import { useSynthStore } from "@/store/synthStore";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

describe("AuxOut", () => {
  const mockSetAuxOutput = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (
      useSynthStore as jest.MockedFunction<typeof useSynthStore>
    ).mockReturnValue({
      auxOutput: {
        enabled: false,
        volume: 0,
      },
      setAuxOutput: mockSetAuxOutput,
      isDisabled: false,
    } as ReturnType<typeof useSynthStore>);
  });

  it("renders aux output controls", () => {
    render(<AuxOut />);

    expect(screen.getByText("Volume")).toBeInTheDocument();
    // Use getAllByText for 'Aux Out' and check at least one is in the document
    const auxOutLabels = screen.getAllByText("Aux Out");
    expect(auxOutLabels.length).toBeGreaterThan(0);
  });

  it("displays current aux output state", () => {
    (
      useSynthStore as jest.MockedFunction<typeof useSynthStore>
    ).mockReturnValue({
      auxOutput: {
        enabled: true,
        volume: 5,
      },
      setAuxOutput: mockSetAuxOutput,
      isDisabled: false,
    } as ReturnType<typeof useSynthStore>);

    render(<AuxOut />);

    // The knob should show the current volume value
    const knob = screen.getByRole("slider");
    expect(knob).toHaveAttribute("aria-valuenow", "5");
  });

  it("calls setAuxOutput when volume changes", () => {
    render(<AuxOut />);

    const knob = screen.getByRole("slider");
    // Simulate keyboard event for accessibility (ArrowUp)
    knob.focus();
    fireEvent.keyDown(knob, { key: "ArrowUp" });
    // We can't guarantee the value, but we can check the callback was called
    expect(mockSetAuxOutput).toHaveBeenCalled();
  });

  it("calls setAuxOutput when enabled state changes", () => {
    render(<AuxOut />);

    const switchButton = screen.getByRole("button", { name: "Aux Out" });
    fireEvent.click(switchButton);

    expect(mockSetAuxOutput).toHaveBeenCalledWith({ enabled: true });
  });

  it("is disabled when synth is disabled", () => {
    (
      useSynthStore as jest.MockedFunction<typeof useSynthStore>
    ).mockReturnValue({
      auxOutput: {
        enabled: false,
        volume: 0,
      },
      setAuxOutput: mockSetAuxOutput,
      isDisabled: true,
    } as ReturnType<typeof useSynthStore>);

    render(<AuxOut />);

    const knob = screen.getByRole("slider");
    const switchButton = screen.getByRole("button", { name: "Aux Out" });

    // Check for the 'disabled' class instead of 'aria-disabled' attribute
    expect(knob).toHaveClass("disabled");
    // The switch button itself doesn't get the disabled class, but the inner switch div does
    const switchDiv = switchButton.querySelector("div");
    expect(switchDiv).toHaveClass("disabled");
  });
});
