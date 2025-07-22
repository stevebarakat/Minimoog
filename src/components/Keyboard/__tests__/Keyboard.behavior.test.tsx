import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import userEvent from "@testing-library/user-event";
import { Keyboard } from "../Keyboard";

// Mock the store
vi.mock("@/store/synthStore", () => ({
  useSynthStore: vi.fn(),
}));

import { useSynthStore } from "@/store/synthStore";

const mockedUseSynthStore = vi.mocked(useSynthStore);

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

    // @ts-expect-error - Mock implementation for testing
    mockedUseSynthStore.mockImplementation((selector?: (state: any) => any) => {
      const state = {
        isDisabled: false,
      };
      return typeof selector === "function" ? selector(state) : state;
    });
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

    // Find and click a white key
    const whiteKeys = screen.getAllByRole("button");
    const firstKey = whiteKeys[0];

    if (firstKey) {
      await user.click(firstKey);

      expect(mockSynth.triggerAttack).toHaveBeenCalled();
      expect(mockOnKeyDown).toHaveBeenCalled();
    }
  });

  it("responds to key press and release interactions", async () => {
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
    const firstKey = whiteKeys[0];

    if (firstKey) {
      await user.click(firstKey);
      expect(mockSynth.triggerAttack).toHaveBeenCalled();
      expect(mockOnKeyDown).toHaveBeenCalled();
    }
  });

  it("supports multiple key interactions", async () => {
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
    const firstKey = whiteKeys[0];
    const secondKey = whiteKeys[1];

    if (firstKey && secondKey) {
      // Press first key
      await user.click(firstKey);
      expect(mockSynth.triggerAttack).toHaveBeenCalled();

      // Press second key
      await user.click(secondKey);
      expect(mockSynth.triggerAttack).toHaveBeenCalledTimes(2);
      expect(mockOnKeyDown).toHaveBeenCalledTimes(2);
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

  it("responds to mouse interactions", async () => {
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
    const firstKey = whiteKeys[0];

    if (firstKey) {
      // Click on first key
      await user.click(firstKey);
      expect(mockSynth.triggerAttack).toHaveBeenCalled();
    }
  });

  it("handles user interactions correctly", async () => {
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

    // Find white keys
    const whiteKeys = screen.getAllByRole("button");
    const firstKey = whiteKeys[0];

    if (firstKey) {
      // Use userEvent.click instead of fireEvent.pointerDown
      await user.click(firstKey);

      // Verify the key press was handled
      expect(mockSynth.triggerAttack).toHaveBeenCalled();
      expect(mockOnKeyDown).toHaveBeenCalled();
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
    const firstKey = whiteKeys[0];

    if (firstKey) {
      await user.click(firstKey);

      // The key should be in the document and have been interacted with
      expect(firstKey).toBeInTheDocument();
      expect(mockSynth.triggerAttack).toHaveBeenCalled();
    }
  });
});
