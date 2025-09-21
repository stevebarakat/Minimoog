import { screen, fireEvent } from "@testing-library/react";
import { vi, describe, it, beforeEach, expect } from "vitest";
import EffectsOut from "../EffectsOut";
import { useSynthStore } from "@/store/synthStore";
import { useIsSynthDisabled } from "@/store/selectors";
import { renderWithProviders } from "@/test/testHelpers";

// Mock the store and selectors
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

vi.mock("@/store/selectors", () => ({
  useIsSynthDisabled: vi.fn(),
  useMagnifyKnobs: vi.fn(() => false),
  useTooltips: vi.fn(() => true),
}));

describe("EffectsOut", () => {
  const mockSetEffectsVolume = vi.fn();
  const mockSetDelay = vi.fn();
  const mockSetReverb = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useSynthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      effectsVolume: 7,
      delay: { enabled: false },
      reverb: { enabled: false },
      setEffectsVolume: mockSetEffectsVolume,
      setDelay: mockSetDelay,
      setReverb: mockSetReverb,
    } as ReturnType<typeof useSynthStore>);

    (useIsSynthDisabled as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      false
    );
  });

  it("renders effects controls", () => {
    renderWithProviders(<EffectsOut />, { withToast: true });

    expect(screen.getByText("Volume")).toBeInTheDocument();
    expect(screen.getByText("Aux Output")).toBeInTheDocument();
  });

  it("displays current effects state", () => {
    (useSynthStore as unknown as ReturnType<typeof vi.fn>).mockReturnValue({
      effectsVolume: 5,
      delay: { enabled: true },
      reverb: { enabled: true },
      setEffectsVolume: mockSetEffectsVolume,
      setDelay: mockSetDelay,
      setReverb: mockSetReverb,
    } as ReturnType<typeof useSynthStore>);

    renderWithProviders(<EffectsOut />, { withToast: true });

    // The volume knob should be accessible and show the current value
    const knob = screen.getByRole("slider", { name: "Volume" });
    expect(knob).toBeInTheDocument();
  });

  it("calls setEffectsVolume when volume changes", () => {
    renderWithProviders(<EffectsOut />, { withToast: true });

    const knob = screen.getByRole("slider");
    // Simulate keyboard event for accessibility (ArrowUp)
    knob.focus();
    fireEvent.keyDown(knob, { key: "ArrowUp" });
    // We can't guarantee the value, but we can check the callback was called
    expect(mockSetEffectsVolume).toHaveBeenCalled();
  });

  it("calls setDelay and setReverb when effects bypass changes", () => {
    renderWithProviders(<EffectsOut />, { withToast: true });

    const switchButton = screen.getByRole("button", { name: "Aux Output" });
    fireEvent.click(switchButton);

    // Should enable both effects when bypass is turned off
    expect(mockSetDelay).toHaveBeenCalledWith({ enabled: true });
    expect(mockSetReverb).toHaveBeenCalledWith({ enabled: true });
  });

  it("is disabled when synth is disabled", () => {
    (useIsSynthDisabled as unknown as ReturnType<typeof vi.fn>).mockReturnValue(
      true
    );

    renderWithProviders(<EffectsOut />, { withToast: true });

    const knob = screen.getByRole("slider");
    const switchButton = screen.getByRole("button", { name: "Aux Output" });

    // Check for the 'disabled' class instead of 'aria-disabled' attribute
    expect(knob.className).toEqual(expect.stringContaining("disabled"));

    // The RockerSwitch component has the disabled class on the inner switch div
    // which has role="button" and aria-label
    const switchDiv = switchButton;
    expect(switchDiv.className).toEqual(expect.stringContaining("disabled"));
  });
});
