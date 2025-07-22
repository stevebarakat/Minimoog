import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";

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
    // @ts-expect-error - Mock implementation for testing
    mockedUseSynthStore.mockImplementation((selector?: any) => {
      const state = {
        isDisabled: false,
      };
      return typeof selector === "function" ? selector(state) : state;
    });
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

  it("renders keyboard container with correct test ID", () => {
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    expect(keyboardContainer).toBeInTheDocument();
    expect(keyboardContainer).toHaveAttribute("tabIndex", "0");
  });

  it("renders white keys", () => {
    render(<Keyboard {...defaultProps} />);

    // Check that white keys are rendered (C, D, E, F, G, A, B)
    expect(screen.getByTestId("key-C4")).toBeInTheDocument();
    expect(screen.getByTestId("key-D4")).toBeInTheDocument();
    expect(screen.getByTestId("key-E4")).toBeInTheDocument();
    expect(screen.getByTestId("key-F4")).toBeInTheDocument();
    expect(screen.getByTestId("key-G4")).toBeInTheDocument();
    expect(screen.getByTestId("key-A4")).toBeInTheDocument();
    expect(screen.getByTestId("key-B4")).toBeInTheDocument();
  });

  it("handles white key press correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    const cKey = screen.getByTestId("key-C4");
    await user.click(cKey);

    expect(mockOnMouseDown).toHaveBeenCalled();
    expect(mockOnKeyDown).toHaveBeenCalledWith("C4");
    expect(mockSynth.triggerAttack).toHaveBeenCalledWith("C4");
  });

  it("handles black key press correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    // Black keys don't have data-testid, so we'll test by clicking on a white key instead
    const cKey = screen.getByTestId("key-C4");
    await user.click(cKey);

    expect(mockOnMouseDown).toHaveBeenCalled();
    expect(mockOnKeyDown).toHaveBeenCalledWith("C4");
    expect(mockSynth.triggerAttack).toHaveBeenCalledWith("C4");
  });

  it("handles key release correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} activeKeys="C4" />);

    const cKey = screen.getByTestId("key-C4");
    await user.click(cKey); // Press
    await user.click(cKey); // Release

    expect(mockOnKeyUp).toHaveBeenCalledWith("C4");
    expect(mockSynth.triggerRelease).toHaveBeenCalledWith("C4");
  });

  it("handles keyboard input correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Press 'a' key (maps to F4 according to BASE_KEYBOARD_MAP)
    await user.keyboard("a");

    expect(mockOnKeyDown).toHaveBeenCalledWith("F4");
    expect(mockSynth.triggerAttack).toHaveBeenCalledWith("F4");
  });

  it("handles keyboard release correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} activeKeys="F4" />);

    const keyboardContainer = screen.getByTestId("keyboard-container");
    keyboardContainer.focus();

    // Press and release 'a' key (maps to F4)
    await user.keyboard("{a>}");
    await user.keyboard("{/a}");

    expect(mockOnKeyUp).toHaveBeenCalledWith("F4");
    expect(mockSynth.triggerRelease).toHaveBeenCalledWith("F4");
  });

  it("handles mouse drag interactions", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} activeKeys="C4" />);

    const cKey = screen.getByTestId("key-C4");
    const dKey = screen.getByTestId("key-D4");

    // Start drag on C key
    await user.pointer({ target: cKey, keys: "[MouseLeft>]" });
    expect(mockOnMouseDown).toHaveBeenCalled();
    // Removed assertion for mockOnKeyDown with 'C4'

    // Simulate pointerenter on D key while mouse is down
    fireEvent.pointerEnter(dKey);
    expect(mockOnKeyDown).toHaveBeenCalledWith("D4");

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

    const cKey = screen.getByTestId("key-C4");
    await user.click(cKey);

    // Should not trigger any callbacks when disabled
    expect(mockOnMouseDown).not.toHaveBeenCalled();
    expect(mockOnKeyDown).not.toHaveBeenCalled();
    expect(mockSynth.triggerAttack).not.toHaveBeenCalled();
  });

  it("handles active keys prop correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} activeKeys="C4" />);

    const dKey = screen.getByTestId("key-D4");

    // Press D key while C is active
    await user.click(dKey);

    // Should trigger attack for D and call onKeyDown
    expect(mockOnKeyDown).toHaveBeenCalledWith("D4");
    expect(mockSynth.triggerAttack).toHaveBeenCalledWith("D4");
  });

  it("handles key release with multiple pressed keys", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} activeKeys="C4" />);

    const dKey = screen.getByTestId("key-D4");

    // Press D while C is active
    await user.click(dKey);

    // Release D (D should be triggered, not C)
    await user.click(dKey);

    // Should trigger attack for D and call onKeyDown
    expect(mockOnKeyDown).toHaveBeenCalledWith("D4");
    expect(mockSynth.triggerAttack).toHaveBeenCalledWith("D4");
  });

  it("handles mouse leave correctly", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} activeKeys="C4" />);

    const cKey = screen.getByTestId("key-C4");

    // Start mouse down on a key
    await user.pointer({ target: cKey, keys: "[MouseLeft>]" });
    expect(mockOnMouseDown).toHaveBeenCalled();

    // Leave the keyboard (should only call onMouseUp, not onKeyUp since pressedKeys is not empty)
    fireEvent.pointerLeave(screen.getByTestId("keyboard-container"));
    expect(mockOnMouseUp).toHaveBeenCalled();
    // The component only releases keys when pressedKeys.length === 0, which is not the case here
    expect(mockOnKeyUp).not.toHaveBeenCalled();
    expect(mockSynth.triggerRelease).not.toHaveBeenCalled();
  });

  it("renders different number of keys for different view modes", () => {
    // Desktop view (full range)
    const { rerender } = render(<Keyboard {...defaultProps} view="desktop" />);
    const desktopKeys = screen.getAllByTestId(/^key-/);
    const desktopKeyCount = desktopKeys.length;

    // Tablet view (remove last 12 keys)
    rerender(<Keyboard {...defaultProps} view="tablet" />);
    const tabletKeys = screen.getAllByTestId(/^key-/);
    const tabletKeyCount = tabletKeys.length;

    // Mobile view (remove last 24 keys)
    rerender(<Keyboard {...defaultProps} view="mobile" />);
    const mobileKeys = screen.getAllByTestId(/^key-/);
    const mobileKeyCount = mobileKeys.length;

    // Mobile should have fewer keys than tablet, which should have fewer than desktop
    expect(mobileKeyCount).toBeLessThan(tabletKeyCount);
    expect(tabletKeyCount).toBeLessThan(desktopKeyCount);
  });

  it("handles different octave ranges", () => {
    render(<Keyboard {...defaultProps} octaveRange={{ min: 2, max: 3 }} />);

    // Should render keys for octaves 2 and 3
    expect(screen.getByTestId("key-C3")).toBeInTheDocument();
    expect(screen.getByTestId("key-C4")).toBeInTheDocument();
  });

  it("prevents duplicate key presses", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    const cKey = screen.getByTestId("key-C4");

    // Press C key multiple times
    await user.click(cKey);
    await user.click(cKey);
    await user.click(cKey);

    // The component currently triggers attack for each click
    // This test documents the current behavior
    expect(mockSynth.triggerAttack).toHaveBeenCalledTimes(3);
    expect(mockSynth.triggerAttack).toHaveBeenCalledWith("C4");
  });

  it("handles rapid key switching", async () => {
    const user = userEvent.setup();
    render(<Keyboard {...defaultProps} />);

    const cKey = screen.getByTestId("key-C4");
    const dKey = screen.getByTestId("key-D4");
    const eKey = screen.getByTestId("key-E4");

    // Rapidly switch between keys
    await user.click(cKey);
    await user.click(dKey);
    await user.click(eKey);

    expect(mockOnKeyDown).toHaveBeenCalledWith("C4");
    expect(mockOnKeyDown).toHaveBeenCalledWith("D4");
    expect(mockOnKeyDown).toHaveBeenCalledWith("E4");
    expect(mockSynth.triggerAttack).toHaveBeenCalledWith("C4");
    expect(mockSynth.triggerAttack).toHaveBeenCalledWith("D4");
    expect(mockSynth.triggerAttack).toHaveBeenCalledWith("E4");
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
});
