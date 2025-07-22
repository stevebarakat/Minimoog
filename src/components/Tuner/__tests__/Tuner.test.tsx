import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import Tuner from "../Tuner";
import { useSynthStore } from "@/store/synthStore";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

const mockedUseSynthStore = vi.mocked(useSynthStore);

describe("Tuner", () => {
  it("renders with correct labels", () => {
    mockedUseSynthStore.mockReturnValue({
      isDisabled: false,
      tunerOn: false,
      setTunerOn: vi.fn(),
    });

    render(<Tuner />);

    expect(screen.getByText("Tuner")).toBeInTheDocument();
    expect(screen.getByText("A-440")).toBeInTheDocument();
    expect(screen.getByText("On")).toBeInTheDocument();
  });

  it("calls setTunerOn when toggled", () => {
    const mockSetTunerOn = vi.fn();
    mockedUseSynthStore.mockReturnValue({
      isDisabled: false,
      tunerOn: false,
      setTunerOn: mockSetTunerOn,
    });

    render(<Tuner />);

    const switchElement = screen.getByRole("button", { name: "Tuner" });
    fireEvent.click(switchElement);

    expect(mockSetTunerOn).toHaveBeenCalledWith(true);
  });

  it("is disabled when synth is disabled", () => {
    mockedUseSynthStore.mockReturnValue({
      isDisabled: true,
      tunerOn: false,
      setTunerOn: vi.fn(),
    });

    render(<Tuner />);

    const switchElement = screen.getByRole("button", { name: "Tuner" });
    // Check for the 'disabled' class on the inner switch div instead of 'aria-disabled' attribute
    const switchDiv = switchElement.querySelector("div");
    expect(switchDiv).toHaveClass("disabled");
  });
});
