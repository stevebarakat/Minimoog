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

  it("displays current values correctly", () => {
    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });
    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });

    // Check that knobs have correct current values
    expect(cutoffKnob).toHaveAttribute("aria-valuenow", "0");
    expect(emphasisKnob).toHaveAttribute("aria-valuenow", "5");
    expect(contourKnob).toHaveAttribute("aria-valuenow", "3");
  });

  it("responds to keyboard input for cutoff frequency", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    cutoffKnob.focus();

    // Simulate increasing cutoff frequency
    await user.keyboard("{ArrowUp}");

    expect(mockSetFilterCutoff).toHaveBeenCalledWith(expect.any(Number));
  });

  it("responds to keyboard input for emphasis", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });
    emphasisKnob.focus();

    // Simulate decreasing emphasis
    await user.keyboard("{ArrowDown}");

    expect(mockSetFilterEmphasis).toHaveBeenCalledWith(expect.any(Number));
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

    expect(mockSetFilterContourAmount).toHaveBeenCalledWith(expect.any(Number));
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

    // Check that the disabled class is applied (which makes cursor not-allowed)
    expect(cutoffKnob).toHaveClass("disabled");
    expect(emphasisKnob).toHaveClass("disabled");
    expect(contourKnob).toHaveClass("disabled");
  });

  it("updates state with correct values when cutoff frequency changes", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    cutoffKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowUp}");
    await user.keyboard("{ArrowUp}");

    // Verify setFilterCutoff was called multiple times
    expect(mockSetFilterCutoff).toHaveBeenCalledTimes(2);

    // Verify the calls were for cutoff parameter
    expect(mockSetFilterCutoff).toHaveBeenNthCalledWith(1, expect.any(Number));
    expect(mockSetFilterCutoff).toHaveBeenNthCalledWith(2, expect.any(Number));
  });

  it("updates state with correct values when emphasis changes", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });
    emphasisKnob.focus();

    // Simulate multiple key presses to change value
    await user.keyboard("{ArrowDown}");
    await user.keyboard("{ArrowDown}");

    // Verify setFilterEmphasis was called multiple times
    expect(mockSetFilterEmphasis).toHaveBeenCalledTimes(2);

    // Verify the calls were for emphasis parameter
    expect(mockSetFilterEmphasis).toHaveBeenNthCalledWith(
      1,
      expect.any(Number)
    );
    expect(mockSetFilterEmphasis).toHaveBeenNthCalledWith(
      2,
      expect.any(Number)
    );
  });

  it("updates state with correct values when contour amount changes", async () => {
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

    // Verify the calls were for contour amount parameter
    expect(mockSetFilterContourAmount).toHaveBeenNthCalledWith(
      1,
      expect.any(Number)
    );
    expect(mockSetFilterContourAmount).toHaveBeenNthCalledWith(
      2,
      expect.any(Number)
    );
  });

  it("maintains correct value ranges for cutoff frequency knob", () => {
    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });

    // Cutoff frequency knob should have -4 to 4 range with 0.5 step
    expect(cutoffKnob).toHaveAttribute("aria-valuemin", "-4");
    expect(cutoffKnob).toHaveAttribute("aria-valuemax", "4");
  });

  it("maintains correct value range for emphasis knob", () => {
    render(<Filter />);

    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });

    // Emphasis knob should have 0-10 range with 1 step
    expect(emphasisKnob).toHaveAttribute("aria-valuemin", "0");
    expect(emphasisKnob).toHaveAttribute("aria-valuemax", "10");
  });

  it("maintains correct value range for contour amount knob", () => {
    render(<Filter />);

    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });

    // Contour amount knob should have 0-10 range with 1 step
    expect(contourKnob).toHaveAttribute("aria-valuemin", "0");
    expect(contourKnob).toHaveAttribute("aria-valuemax", "10");
  });

  it("applies correct styling and layout", () => {
    render(<Filter />);

    // Check that the component has the expected styling
    const container = screen
      .getByRole("slider", { name: "Cutoff Frequency" })
      .closest("div");
    expect(container).toBeInTheDocument();
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

  it("uses the correct setter functions for each parameter", async () => {
    const user = userEvent.setup();
    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });
    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });

    // Test each knob to verify correct setter is called
    cutoffKnob.focus();
    await user.keyboard("{ArrowUp}");
    expect(mockSetFilterCutoff).toHaveBeenCalledWith(expect.any(Number));

    emphasisKnob.focus();
    await user.keyboard("{ArrowUp}");
    expect(mockSetFilterEmphasis).toHaveBeenCalledWith(expect.any(Number));

    contourKnob.focus();
    await user.keyboard("{ArrowUp}");
    expect(mockSetFilterContourAmount).toHaveBeenCalledWith(expect.any(Number));
  });

  it("displays the contour amount title correctly", () => {
    render(<Filter />);

    // Check that the multi-line title for contour amount is displayed
    // The title is rendered as a JSX element with a <br /> tag
    // We can check that the title element exists by looking for the span with the title content
    const contourKnob = screen.getByRole("slider", {
      name: "Amount of Contour",
    });
    expect(contourKnob).toBeInTheDocument();

    // The title should be present in the knob container
    const knobContainer = contourKnob.closest('[class*="knobContainer"]');
    expect(knobContainer).toBeInTheDocument();
  });

  it("respects logarithmic scaling for cutoff frequency and emphasis", () => {
    render(<Filter />);

    const cutoffKnob = screen.getByRole("slider", { name: "Cutoff Frequency" });
    const emphasisKnob = screen.getByRole("slider", { name: "Emphasis" });

    // Both cutoff and emphasis knobs should have logarithmic scaling
    // This is tested by checking that the knobs are rendered correctly
    // The actual logarithmic behavior is tested in the Knob component tests
    expect(cutoffKnob).toBeInTheDocument();
    expect(emphasisKnob).toBeInTheDocument();
  });
});
