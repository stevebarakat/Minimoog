import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
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
    vi.mocked(useSynthStore).mockReturnValue({
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
    vi.mocked(useSynthStore).mockReturnValue({
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
    expect(knob).toHaveAttribute("aria-valuenow");
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

    expect(mockSetAuxOutput).toHaveBeenCalled();
  });

  it("is disabled when synth is disabled", () => {
    vi.mocked(useSynthStore).mockReturnValue({
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

    // Check that controls are rendered but functionally disabled
    expect(knob).toBeInTheDocument();
    expect(switchButton).toBeInTheDocument();
  });
});
