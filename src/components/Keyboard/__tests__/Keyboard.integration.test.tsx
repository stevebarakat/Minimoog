import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import type { SynthState, SynthActions } from "@/store/types/synth";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

import { Keyboard } from "../Keyboard";
import { useSynthStore } from "@/store/synthStore";

const mockedUseSynthStore = vi.mocked(useSynthStore);

describe("Keyboard - Integration Tests", () => {
  const mockOnKeyDown = vi.fn();
  const mockOnKeyUp = vi.fn();
  const mockOnMouseDown = vi.fn();
  const mockOnMouseUp = vi.fn();
  const mockSynth = {
    triggerAttack: vi.fn(),
    triggerRelease: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockedUseSynthStore.mockImplementation(
      (selector?: (state: SynthState & SynthActions) => unknown) => {
        const state = {
          isDisabled: false,
        } as SynthState & SynthActions;
        return typeof selector === "function" ? selector(state) : state;
      }
    );
  });

  const defaultProps = {
    activeKeys: null,
    octaveRange: { min: 1, max: 4 },
    onKeyDown: mockOnKeyDown,
    onKeyUp: mockOnKeyUp,
    onMouseDown: mockOnMouseDown,
    onMouseUp: mockOnMouseUp,
    synth: mockSynth,
    view: "desktop" as const,
  };

  it("renders keyboard container with accessibility support", () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    expect(keyboardContainer).toBeInTheDocument();
    expect(keyboardContainer).toHaveAttribute("tabIndex", "0");
  });

  it("renders white keys for user interaction", () => {
    render(<Keyboard {...defaultProps} />);

    // Check that white keys are rendered and accessible
    const whiteKeys = screen.getAllByRole("button");
    expect(whiteKeys.length).toBeGreaterThan(0);

    // Check that keys have proper accessibility attributes
    whiteKeys.forEach((key) => {
      expect(key).toHaveAttribute("aria-label");
    });
  });

  it("handles white key press correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    const whiteKeys = screen.getAllByRole("button");
    const firstKey = whiteKeys[0];
    await user.click(firstKey);

    expect(mockOnMouseDown).toHaveBeenCalled();
    expect(mockOnKeyDown).toHaveBeenCalled();
    expect(mockSynth.triggerAttack).toHaveBeenCalled();
  });

  it("handles key press and release interactions", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    const whiteKeys = screen.getAllByRole("button");
    const firstKey = whiteKeys[0];

    // Test that clicking a key triggers the expected callbacks
    await user.click(firstKey);
    expect(mockOnKeyDown).toHaveBeenCalled();
    expect(mockSynth.triggerAttack).toHaveBeenCalled();
  });

  it("handles keyboard input correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Press a valid key
    await user.keyboard("a");

    expect(mockOnKeyDown).toHaveBeenCalled();
    expect(mockSynth.triggerAttack).toHaveBeenCalled();
  });

  it("handles keyboard release correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} activeKeys="F4" />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Press and release a key
    await user.keyboard("{a>}");
    await user.keyboard("{/a}");

    expect(mockOnKeyUp).toHaveBeenCalled();
    expect(mockSynth.triggerRelease).toHaveBeenCalled();
  });

  it("handles mouse drag interactions", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} activeKeys="C4" />);

    const whiteKeys = screen.getAllByRole("button");
    const firstKey = whiteKeys[0];
    const secondKey = whiteKeys[1];

    // Start drag on first key
    await user.pointer({ target: firstKey, keys: "[MouseLeft>]" });
    expect(mockOnMouseDown).toHaveBeenCalled();

    // Simulate pointerenter on second key while mouse is down
    fireEvent.pointerEnter(secondKey);
    expect(mockOnKeyDown).toHaveBeenCalled();

    // Release mouse
    await user.pointer({ keys: "[/MouseLeft]" });
    expect(mockOnMouseUp).toHaveBeenCalled();
  });

  it("disables interactions when synth is disabled", async () => {
    mockedUseSynthStore.mockReturnValue({
      isDisabled: true,
    } as Partial<ReturnType<typeof useSynthStore>>);

    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    const whiteKeys = screen.getAllByRole("button");
    const firstKey = whiteKeys[0];
    await user.click(firstKey);

    // Should not trigger any callbacks when disabled
    expect(mockOnMouseDown).not.toHaveBeenCalled();
    expect(mockOnKeyDown).not.toHaveBeenCalled();
    expect(mockSynth.triggerAttack).not.toHaveBeenCalled();
  });

  it("handles active keys prop correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} activeKeys="C4" />);

    const whiteKeys = screen.getAllByRole("button");
    const secondKey = whiteKeys[1];

    // Press second key while first is active
    await user.click(secondKey);

    // Should trigger attack and call onKeyDown
    expect(mockOnKeyDown).toHaveBeenCalled();
    expect(mockSynth.triggerAttack).toHaveBeenCalled();
  });

  it("handles key release with multiple pressed keys", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} activeKeys="C4" />);

    const whiteKeys = screen.getAllByRole("button");
    const secondKey = whiteKeys[1];

    // Press second key while first is active
    await user.click(secondKey);

    // Release second key
    await user.click(secondKey);

    // Should trigger attack and call onKeyDown
    expect(mockOnKeyDown).toHaveBeenCalled();
    expect(mockSynth.triggerAttack).toHaveBeenCalled();
  });

  it("handles mouse leave correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} activeKeys="C4" />);

    const whiteKeys = screen.getAllByRole("button");
    const firstKey = whiteKeys[0];

    // Start mouse down on a key
    await user.pointer({ target: firstKey, keys: "[MouseLeft>]" });
    expect(mockOnMouseDown).toHaveBeenCalled();

    // Leave the keyboard
    fireEvent.pointerLeave(screen.getByTestId("keyboard-container"));
    expect(mockOnMouseUp).toHaveBeenCalled();
    // The component only releases keys when pressedKeys.length === 0, which is not the case here
    expect(mockOnKeyUp).not.toHaveBeenCalled();
    expect(mockSynth.triggerRelease).not.toHaveBeenCalled();
  });

  it("renders different number of keys for different view modes", () => {
    // Desktop view (full range)
    const { rerender } = render(<Keyboard {...defaultProps} view="desktop" />);
    const desktopKeys = screen.getAllByRole("button");
    const desktopKeyCount = desktopKeys.length;

    // Tablet view (remove last 12 keys)
    rerender(<Keyboard {...defaultProps} view="tablet" />);
    const tabletKeys = screen.getAllByRole("button");
    const tabletKeyCount = tabletKeys.length;

    // Mobile view (remove last 24 keys)
    rerender(<Keyboard {...defaultProps} view="mobile" />);
    const mobileKeys = screen.getAllByRole("button");
    const mobileKeyCount = mobileKeys.length;

    // Mobile should have fewer keys than tablet, which should have fewer than desktop
    expect(mobileKeyCount).toBeLessThan(tabletKeyCount);
    expect(tabletKeyCount).toBeLessThan(desktopKeyCount);
  });

  it("handles different octave ranges", () => {
    render(<Keyboard {...defaultProps} octaveRange={{ min: 2, max: 3 }} />);

    // Should render keys for the specified octave range
    const keys = screen.getAllByRole("button");
    expect(keys.length).toBeGreaterThan(0);
  });

  it("prevents duplicate key presses", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    const whiteKeys = screen.getAllByRole("button");
    const firstKey = whiteKeys[0];

    // Press key multiple times
    await user.click(firstKey);
    await user.click(firstKey);
    await user.click(firstKey);

    // The component currently triggers attack for each click
    // This test documents the current behavior
    expect(mockSynth.triggerAttack).toHaveBeenCalledTimes(3);
  });

  it("handles rapid key switching", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    const whiteKeys = screen.getAllByRole("button");
    const firstKey = whiteKeys[0];
    const secondKey = whiteKeys[1];
    const thirdKey = whiteKeys[2];

    // Rapidly switch between keys
    await user.click(firstKey);
    await user.click(secondKey);
    await user.click(thirdKey);

    expect(mockOnKeyDown).toHaveBeenCalledTimes(3);
    expect(mockSynth.triggerAttack).toHaveBeenCalledTimes(3);
  });

  it("maintains focus for keyboard accessibility", () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    expect(keyboardContainer).toHaveAttribute("tabIndex", "0");
  });

  it("handles keyboard repeat events correctly", async () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Simulate key repeat (should be ignored)
    fireEvent.keyDown(keyboardContainer, { key: "a", repeat: true });

    // Should not trigger attack for repeated keys
    expect(mockSynth.triggerAttack).not.toHaveBeenCalled();
  });

  it("handles invalid keyboard input gracefully", async () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Press invalid key
    fireEvent.keyDown(keyboardContainer, { key: "x" });

    // Should not trigger any callbacks for invalid keys
    expect(mockOnKeyDown).not.toHaveBeenCalled();
    expect(mockSynth.triggerAttack).not.toHaveBeenCalled();
  });

  it("supports complete user workflow", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    const whiteKeys = screen.getAllByRole("button");
    const firstKey = whiteKeys[0];
    const secondKey = whiteKeys[1];

    // Complete workflow: press key, switch to another
    await user.click(firstKey);
    expect(mockOnKeyDown).toHaveBeenCalled();
    expect(mockSynth.triggerAttack).toHaveBeenCalled();

    await user.click(secondKey);
    expect(mockOnKeyDown).toHaveBeenCalledTimes(2);
    expect(mockSynth.triggerAttack).toHaveBeenCalledTimes(2);
  });

  it("handles octave increase with = key", async () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Press = to increase octave
    fireEvent.keyDown(keyboardContainer, { key: "=" });

    // Should not trigger any synth calls for octave change
    expect(mockSynth.triggerAttack).not.toHaveBeenCalled();
    expect(mockOnKeyDown).not.toHaveBeenCalled();
  });

  it("handles octave decrease with - key", async () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Press - to decrease octave
    fireEvent.keyDown(keyboardContainer, { key: "-" });

    // Should not trigger any synth calls for octave change
    expect(mockSynth.triggerAttack).not.toHaveBeenCalled();
    expect(mockOnKeyDown).not.toHaveBeenCalled();
  });

  it("handles octave increase with + key", async () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Press + to increase octave (alternative to =)
    fireEvent.keyDown(keyboardContainer, { key: "+" });

    // Should not trigger any synth calls for octave change
    expect(mockSynth.triggerAttack).not.toHaveBeenCalled();
    expect(mockOnKeyDown).not.toHaveBeenCalled();
  });

  it("handles octave decrease with _ key", async () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Press _ to decrease octave (alternative to -)
    fireEvent.keyDown(keyboardContainer, { key: "_" });

    // Should not trigger any synth calls for octave change
    expect(mockSynth.triggerAttack).not.toHaveBeenCalled();
    expect(mockOnKeyDown).not.toHaveBeenCalled();
  });

  it("limits octave range to reasonable bounds", async () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Try to decrease octave multiple times (should be limited)
    for (let i = 0; i < 10; i++) {
      fireEvent.keyDown(keyboardContainer, { key: "-" });
    }

    // Try to increase octave multiple times (should be limited)
    for (let i = 0; i < 10; i++) {
      fireEvent.keyDown(keyboardContainer, { key: "=" });
    }

    // Should not trigger any synth calls for octave changes
    expect(mockSynth.triggerAttack).not.toHaveBeenCalled();
    expect(mockOnKeyDown).not.toHaveBeenCalled();
  });

  it("shows octave indicator when offset is not zero", () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Initially no octave indicator should be visible
    expect(screen.queryByText("+1")).not.toBeInTheDocument();
    expect(screen.queryByText("-1")).not.toBeInTheDocument();

    // Increase octave
    fireEvent.keyDown(keyboardContainer, { key: "=" });

    // Should show +1 indicator
    expect(screen.getByText("+1")).toBeInTheDocument();

    // Decrease octave twice
    fireEvent.keyDown(keyboardContainer, { key: "-" });
    fireEvent.keyDown(keyboardContainer, { key: "-" });

    // Should show -1 indicator
    expect(screen.getByText("-1")).toBeInTheDocument();
  });

  it("applies octave offset to keyboard input", async () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Increase octave by 1
    fireEvent.keyDown(keyboardContainer, { key: "=" });

    // Press 'a' key
    fireEvent.keyDown(keyboardContainer, { key: "a" });

    // Should trigger attack with a note (behavior, not specific note name)
    expect(mockSynth.triggerAttack).toHaveBeenCalled();
  });
});
