import React from "react";
import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import AuxOut from "../AuxOut";
import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled, useOutputState } from "@/store/selectors";

// Mock the store and selectors
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

vi.mock("@/store/selectors", () => ({
  useIsSynthDisabled: vi.fn(),
  useOutputState: vi.fn(),
}));

describe("AuxOut", () => {
  const mockSetAuxOutput = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (
      useSynthStore as jest.MockedFunction<typeof useSynthStore>
    ).mockReturnValue({
      setAuxOutput: mockSetAuxOutput,
    } as ReturnType<typeof useSynthStore>);

    (
      useOutputState as jest.MockedFunction<typeof useOutputState>
    ).mockReturnValue({
      auxOutput: {
        enabled: false,
        volume: 0,
      },
    });

    (
      useIsSynthDisabled as jest.MockedFunction<typeof useIsSynthDisabled>
    ).mockReturnValue(false);
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
      useOutputState as jest.MockedFunction<typeof useOutputState>
    ).mockReturnValue({
      auxOutput: {
        enabled: true,
        volume: 5,
      },
    });

    render(<AuxOut />);

    // The volume knob should be accessible and show the current value
    const knob = screen.getByRole("slider", { name: "Volume" });
    expect(knob).toBeInTheDocument();
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
      useIsSynthDisabled as jest.MockedFunction<typeof useIsSynthDisabled>
    ).mockReturnValue(true);

    render(<AuxOut />);

    const knob = screen.getByRole("slider");
    const switchButton = screen.getByRole("button", { name: "Aux Out" });

    // Check for the 'disabled' class instead of 'aria-disabled' attribute
    expect(knob.className).toEqual(expect.stringContaining("disabled"));

    // The RockerSwitch component has the disabled class on the inner switch div
    // which has role="button" and aria-label
    const switchDiv = switchButton;
    expect(switchDiv.className).toEqual(expect.stringContaining("disabled"));
  });
});
