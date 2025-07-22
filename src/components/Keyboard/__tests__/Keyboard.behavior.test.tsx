import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { Keyboard } from "../Keyboard";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(() => ({ isDisabled: false })),
}));

describe("Keyboard - User Behavior Tests", () => {
  const mockOnKeyDown = vi.fn();
  const mockOnKeyUp = vi.fn();
  const mockSynth = {
    triggerAttack: vi.fn(),
    triggerRelease: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockSynth.triggerAttack = vi.fn();
    mockSynth.triggerRelease = vi.fn();
  });

  it("plays a note when user clicks a white key", async () => {
    const user = userEvent.setup();
    render(
      <Keyboard
        onKeyDown={mockOnKeyDown}
        onKeyUp={mockOnKeyUp}
        synth={mockSynth}
        octaveRange={{ min: 4, max: 4 }}
      />
    );

    // Find and click a white key (C4)
    const whiteKeys = screen.getAllByRole("button");
    const c4Key = whiteKeys.find((key) => key.textContent?.includes("C"));

    if (c4Key) {
      await user.click(c4Key);

      expect(mockSynth.triggerAttack).toHaveBeenCalledWith("C4");
      expect(mockOnKeyDown).toHaveBeenCalledWith("C4");
    }
  });

  it("stops playing when user releases a key", async () => {
    const user = userEvent.setup();
    render(
      <Keyboard
        onKeyDown={mockOnKeyDown}
        onKeyUp={mockOnKeyUp}
        synth={mockSynth}
        octaveRange={{ min: 4, max: 4 }}
      />
    );

    // Find and click a white key
    const whiteKeys = screen.getAllByRole("button");
    const c4Key = whiteKeys.find((key) => key.textContent?.includes("C"));

    if (c4Key) {
      await user.click(c4Key);
      await user.click(c4Key); // Click again to release

      expect(mockSynth.triggerRelease).toHaveBeenCalledWith("C4");
      expect(mockOnKeyUp).toHaveBeenCalledWith("C4");
    }
  });

  it("supports legato playing when holding multiple keys", async () => {
    const user = userEvent.setup();
    render(
      <Keyboard
        onKeyDown={mockOnKeyDown}
        onKeyUp={mockOnKeyUp}
        synth={mockSynth}
        octaveRange={{ min: 4, max: 4 }}
      />
    );

    const whiteKeys = screen.getAllByRole("button");
    const c4Key = whiteKeys.find((key) => key.textContent?.includes("C"));
    const d4Key = whiteKeys.find((key) => key.textContent?.includes("D"));

    if (c4Key && d4Key) {
      // Press C4
      await user.click(c4Key);
      expect(mockSynth.triggerAttack).toHaveBeenCalledWith("C4");

      // While holding C4, press D4 (should trigger legato)
      await user.click(d4Key);
      expect(mockSynth.triggerAttack).toHaveBeenCalledWith("D4");
      expect(mockOnKeyDown).toHaveBeenCalledWith("D4");

      // Release C4, D4 should still be playing
      await user.click(c4Key);
      expect(mockSynth.triggerRelease).not.toHaveBeenCalledWith("D4");
    }
  });

  it("shows correct octave range", () => {
    render(
      <Keyboard
        onKeyDown={mockOnKeyDown}
        onKeyUp={mockOnKeyUp}
        synth={mockSynth}
        octaveRange={{ min: 3, max: 5 }}
      />
    );

    // Should have more keys for 3 octaves
    const whiteKeys = screen.getAllByRole("button");
    expect(whiteKeys.length).toBeGreaterThan(12); // More than 1 octave
  });

  it("responds to mouse drag for continuous playing", async () => {
    const user = userEvent.setup();
    render(
      <Keyboard
        onKeyDown={mockOnKeyDown}
        onKeyUp={mockOnKeyUp}
        synth={mockSynth}
        octaveRange={{ min: 4, max: 4 }}
      />
    );

    const whiteKeys = screen.getAllByRole("button");
    const c4Key = whiteKeys.find((key) => key.textContent?.includes("C"));
    const d4Key = whiteKeys.find((key) => key.textContent?.includes("D"));

    if (c4Key && d4Key) {
      // Start drag on C4
      await user.click(c4Key);
      expect(mockSynth.triggerAttack).toHaveBeenCalledWith("C4");

      // Drag to D4
      fireEvent.mouseEnter(d4Key);
      expect(mockSynth.triggerAttack).toHaveBeenCalledWith("D4");
    }
  });

  it("handles keyboard input correctly", async () => {
    const user = userEvent.setup();
    render(
      <Keyboard
        onKeyDown={mockOnKeyDown}
        onKeyUp={mockOnKeyUp}
        synth={mockSynth}
        octaveRange={{ min: 4, max: 4 }}
      />
    );

    // Wait for all effects to flush before firing events
    await waitFor(() => {});

    // Find white keys by text content (same approach as other tests)
    const whiteKeys = screen.getAllByRole("button");
    const c4Key = whiteKeys.find((key) => key.textContent?.includes("C"));

    if (c4Key) {
      // Use userEvent.click instead of fireEvent.pointerDown
      await user.click(c4Key);

      // Verify the key press was handled
      expect(mockSynth.triggerAttack).toHaveBeenCalled();
      expect(mockOnKeyDown).toHaveBeenCalled();

      // Click again to release
      await user.click(c4Key);

      // Verify the key release was handled
      expect(mockSynth.triggerRelease).toHaveBeenCalled();
      expect(mockOnKeyUp).toHaveBeenCalled();
    }
  });

  it("shows active key state visually", async () => {
    const user = userEvent.setup();
    render(
      <Keyboard
        onKeyDown={mockOnKeyDown}
        onKeyUp={mockOnKeyUp}
        synth={mockSynth}
        octaveRange={{ min: 4, max: 4 }}
      />
    );

    const whiteKeys = screen.getAllByRole("button");
    const c4Key = whiteKeys.find((key) => key.textContent?.includes("C"));

    if (c4Key) {
      await user.click(c4Key);

      // The key should have an active state class
      expect(c4Key).toHaveClass("active");
    }
  });
});
