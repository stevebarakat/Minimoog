import { render, screen } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import PowerButton from "../PowerButton";

// Mock the audio context hook
vi.mock("@/hooks/useAudioContext", () => ({
  useAudioContext: vi.fn(),
}));

import { useAudioContext } from "@/hooks/useAudioContext";

const mockedUseAudioContext = vi.mocked(useAudioContext);

// Helper function to get the LED checkbox specifically
const getLEDCheckbox = () => {
  return document.querySelector(
    "input[class*='vintageLedInput']"
  ) as HTMLInputElement;
};

describe("PowerButton - Integration Tests", () => {
  const mockOnPowerOn = vi.fn();
  const mockOnPowerOff = vi.fn();
  const mockInitialize = vi.fn();
  const mockDispose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock implementation
    mockedUseAudioContext.mockReturnValue({
      isInitialized: true,
      initialize: mockInitialize,
      dispose: mockDispose,
      audioContext: null,
    });
  });

  it("renders power button with LED and rocker switch", () => {
    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    // Check that both components are rendered
    expect(screen.getByTestId("power-button")).toBeInTheDocument();
    expect(getLEDCheckbox()).toBeInTheDocument();
  });

  it("turns power on when user clicks the rocker switch", async () => {
    const user = userEvent.setup();
    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    const rockerSwitch = screen.getByTestId("power-button");
    await user.click(rockerSwitch);

    expect(mockOnPowerOn).toHaveBeenCalledTimes(1);
    expect(mockOnPowerOff).not.toHaveBeenCalled();
  });

  it("turns power off when user clicks the rocker switch while powered on", async () => {
    const user = userEvent.setup();
    render(
      <PowerButton
        isOn={true}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    const rockerSwitch = screen.getByTestId("power-button");
    await user.click(rockerSwitch);

    expect(mockOnPowerOff).toHaveBeenCalledTimes(1);
    expect(mockOnPowerOn).not.toHaveBeenCalled();
  });

  it("turns power on when user clicks the LED", async () => {
    const user = userEvent.setup();
    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    // Find the LED checkbox input by class
    const ledCheckbox = getLEDCheckbox();
    await user.click(ledCheckbox);

    expect(mockOnPowerOn).toHaveBeenCalledTimes(1);
    expect(mockOnPowerOff).not.toHaveBeenCalled();
  });

  it("turns power off when user clicks the LED while powered on", async () => {
    const user = userEvent.setup();
    render(
      <PowerButton
        isOn={true}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    const ledCheckbox = getLEDCheckbox();
    await user.click(ledCheckbox);

    expect(mockOnPowerOff).toHaveBeenCalledTimes(1);
    expect(mockOnPowerOn).not.toHaveBeenCalled();
  });

  it("initializes audio context when component mounts and isInitialized is true", () => {
    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    expect(mockInitialize).toHaveBeenCalledTimes(1);
  });

  it("does not initialize audio context when isInitialized is false", () => {
    mockedUseAudioContext.mockReturnValue({
      isInitialized: false,
      initialize: mockInitialize,
      dispose: mockDispose,
      audioContext: null,
    });

    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    expect(mockInitialize).not.toHaveBeenCalled();
  });

  it("disposes audio context when component unmounts", () => {
    const { unmount } = render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    unmount();

    expect(mockDispose).toHaveBeenCalledTimes(1);
  });

  it("shows correct visual state when powered on", () => {
    render(
      <PowerButton
        isOn={true}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    // LED should be checked when powered on
    const ledCheckbox = getLEDCheckbox();
    expect(ledCheckbox).toBeChecked();

    // Rocker switch should be in "on" position
    const rockerSwitch = screen.getByTestId("power-button");
    expect(rockerSwitch).toBeChecked();
  });

  it("shows correct visual state when powered off", () => {
    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    // LED should be unchecked when powered off
    const ledCheckbox = getLEDCheckbox();
    expect(ledCheckbox).not.toBeChecked();

    // Rocker switch should be in "off" position
    const rockerSwitch = screen.getByTestId("power-button");
    expect(rockerSwitch).not.toBeChecked();
  });

  it("supports keyboard navigation for rocker switch", async () => {
    const user = userEvent.setup();
    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    const rockerSwitch = screen.getByTestId("power-button");
    rockerSwitch.focus();

    // Test spacebar toggle
    await user.keyboard(" ");

    expect(mockOnPowerOn).toHaveBeenCalledTimes(1);
  });

  it("supports keyboard navigation for LED", async () => {
    const user = userEvent.setup();
    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    const ledCheckbox = getLEDCheckbox();
    ledCheckbox.focus();

    // Test spacebar toggle
    await user.keyboard(" ");

    expect(mockOnPowerOn).toHaveBeenCalledTimes(1);
  });

  it("handles rapid user interactions correctly", async () => {
    const user = userEvent.setup();
    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    const rockerSwitch = screen.getByTestId("power-button");
    const ledCheckbox = getLEDCheckbox();

    // Rapid clicks on both controls
    await user.click(rockerSwitch);
    await user.click(ledCheckbox);
    await user.click(rockerSwitch);

    // Should handle all interactions without errors
    // The LED click toggles the state, so we get 3 power on calls
    expect(mockOnPowerOn).toHaveBeenCalledTimes(3);
    expect(mockOnPowerOff).toHaveBeenCalledTimes(0);
  });

  it("maintains consistent state between LED and rocker switch", async () => {
    const user = userEvent.setup();
    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    const rockerSwitch = screen.getByTestId("power-button");
    const ledCheckbox = getLEDCheckbox();

    // Both controls should call the same handlers
    await user.click(rockerSwitch);
    expect(mockOnPowerOn).toHaveBeenCalledTimes(1);

    await user.click(ledCheckbox);
    expect(mockOnPowerOn).toHaveBeenCalledTimes(2);

    // Both controls work together to manage the same state
    expect(mockOnPowerOff).not.toHaveBeenCalled();
  });

  it("is accessible with proper ARIA labels", () => {
    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    // Check that both controls have proper accessibility
    const ledCheckbox = getLEDCheckbox();
    const rockerSwitch = screen.getByTestId("power-button");

    expect(ledCheckbox).toBeInTheDocument();
    expect(rockerSwitch).toBeInTheDocument();
    // Check that the rocker switch has proper accessibility
    expect(screen.getByRole("button", { name: "Power" })).toBeInTheDocument();
  });

  it("handles audio context errors gracefully", () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    mockedUseAudioContext.mockReturnValue({
      isInitialized: true,
      initialize: vi.fn().mockRejectedValue(new Error("Audio context error")),
      dispose: mockDispose,
      audioContext: null,
    });

    render(
      <PowerButton
        isOn={false}
        onPowerOn={mockOnPowerOn}
        onPowerOff={mockOnPowerOff}
      />
    );

    // Should not throw error and should still render
    expect(screen.getByTestId("power-button")).toBeInTheDocument();

    consoleSpy.mockRestore();
  });
});
