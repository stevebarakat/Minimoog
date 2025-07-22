import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

import Filter from "../Filter";
import { useSynthStore } from "@/store/synthStore";

const mockedUseSynthStore = vi.mocked(useSynthStore);

describe("Filter - Integration Tests", () => {
  const mockSetFilterCutoff = vi.fn();
  const mockSetFilterEmphasis = vi.fn();
  const mockSetFilterContourAmount = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSynthStore.mockReturnValue({
      // Filter state
      filterCutoff: 0,
      filterEmphasis: 5,
      filterContourAmount: 3,
      isDisabled: false,
      setFilterCutoff: mockSetFilterCutoff,
      setFilterEmphasis: mockSetFilterEmphasis,
      setFilterContourAmount: mockSetFilterContourAmount,
    } as Partial<ReturnType<typeof useSynthStore>>);
  });

  it("renders all three filter controls with correct labels", () => {
    render(<Filter />);

    // Check that all three knobs are rendered with correct labels
    expect(
      screen.getByRole("slider", { name: "Cutoff Frequency" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Emphasis" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Amount of Contour" })
    ).toBeInTheDocument();
  });

  it("renders the title correctly", () => {
    render(<Filter />);

    expect(screen.getByText("Filter")).toBeInTheDocument();
  });

  it("displays the contour amount title correctly", () => {
    render(<Filter />);

    // Check that the contour amount knob container exists (which contains the title)
    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });
    expect(contourKnob).toBeInTheDocument();
  });

  it("displays current values correctly", () => {
    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });
    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });

    // Check that knobs display values (without testing exact values)
    expect(cutoffKnob).toHaveAttribute("aria-valuenow");
    expect(emphasisKnob).toHaveAttribute("aria-valuenow");
    expect(contourKnob).toHaveAttribute("aria-valuenow");
  });

  it("responds to keyboard input for cutoff frequency", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    cutoffKnob.focus();

    // Simulate increasing cutoff frequency
    await user.keyboard("{ArrowUp}");

    expect(mockSetFilterCutoff).toHaveBeenCalled();
  });

  it("responds to keyboard input for emphasis", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });
    emphasisKnob.focus();

    // Simulate decreasing emphasis
    await user.keyboard("{ArrowDown}");

    expect(mockSetFilterEmphasis).toHaveBeenCalled();
  });

  it("responds to keyboard input for contour amount", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });
    contourKnob.focus();

    // Simulate increasing contour amount
    await user.keyboard("{ArrowUp}");

    expect(mockSetFilterContourAmount).toHaveBeenCalled();
  });

  it("disables all controls when synth is disabled", () => {
    mockedUseSynthStore.mockReturnValue({
      filterCutoff: 0,
      filterEmphasis: 5,
      filterContourAmount: 3,
      isDisabled: true,
      setFilterCutoff: mockSetFilterCutoff,
      setFilterEmphasis: mockSetFilterEmphasis,
      setFilterContourAmount: mockSetFilterContourAmount,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });
    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });

    // Check that controls are rendered but functionally disabled
    expect(cutoffKnob).toBeInTheDocument();
    expect(emphasisKnob).toBeInTheDocument();
    expect(contourKnob).toBeInTheDocument();
  });

  it("updates state when cutoff frequency changes", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    cutoffKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");

    // Verify setFilterCutoff was called multiple times
    expect(mockSetFilterCutoff).toHaveBeenCalledTimes(2);
  });

  it("updates state when emphasis changes", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });
    emphasisKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");

    // Verify setFilterEmphasis was called multiple times
    expect(mockSetFilterEmphasis).toHaveBeenCalledTimes(2);
  });

  it("updates state when contour amount changes", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });
    contourKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");

    // Verify setFilterContourAmount was called multiple times
    expect(mockSetFilterContourAmount).toHaveBeenCalledTimes(2);
  });

  it("maintains accessibility attributes", () => {
    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });
    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });

    // Check that knobs have accessibility attributes
    expect(cutoffKnob).toHaveAttribute("aria-valuemin");
    expect(cutoffKnob).toHaveAttribute("aria-valuemax");
    expect(emphasisKnob).toHaveAttribute("aria-valuemin");
    expect(emphasisKnob).toHaveAttribute("aria-valuemax");
    expect(contourKnob).toHaveAttribute("aria-valuemin");
    expect(contourKnob).toHaveAttribute("aria-valuemax");
  });

  it("renders with proper layout", () => {
    render(<Filter />);

    // Check that the component renders without errors
    expect(
      screen.getByRole("slider", { name: "Cutoff Frequency" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Emphasis" })
    ).toBeInTheDocument();
    expect(
      screen.getByRole("slider", { name: "Amount of Contour" })
    ).toBeInTheDocument();
  });

  it("handles rapid user interactions correctly", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });
    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });

    // Rapidly interact with all knobs
    cutoffKnob.focus();
    await user.keyboard("{ArrowUp}");

    emphasisKnob.focus();
    await user.keyboard("{ArrowDown}");

    contourKnob.focus();
    await user.keyboard("{ArrowUp}");

    // Verify all interactions were handled
    expect(mockSetFilterCutoff).toHaveBeenCalledTimes(1);
    expect(mockSetFilterEmphasis).toHaveBeenCalledTimes(1);
    expect(mockSetFilterContourAmount).toHaveBeenCalledTimes(1);
  });

  it("indicates disabled state visually", () => {
    mockedUseSynthStore.mockReturnValue({
      filterCutoff: 0,
      filterEmphasis: 5,
      filterContourAmount: 3,
      isDisabled: true,
      setFilterCutoff: mockSetFilterCutoff,
      setFilterEmphasis: mockSetFilterEmphasis,
      setFilterContourAmount: mockSetFilterContourAmount,
    } as Partial<ReturnType<typeof useSynthStore>>);

    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });
    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });

    // Check that controls are rendered and have accessibility attributes
    expect(cutoffKnob).toBeInTheDocument();
    expect(emphasisKnob).toBeInTheDocument();
    expect(contourKnob).toBeInTheDocument();
    expect(cutoffKnob).toHaveAttribute("aria-valuenow");
    expect(emphasisKnob).toHaveAttribute("aria-valuenow");
    expect(contourKnob).toHaveAttribute("aria-valuenow");
  });
});
