import { renderHook, act } from "@testing-library/react";
import { vi, describe, it, expect, beforeEach, afterEach } from "vitest";
import { useFirstClickDetection } from "../useFirstClickDetection";

describe("useFirstClickDetection", () => {
  const mockOnFirstClick = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should trigger onFirstClick on first non-interactive click", () => {
    renderHook(() =>
      useFirstClickDetection({
        onFirstClick: mockOnFirstClick,
        enabled: true,
      })
    );

    const div = document.createElement("div");
    document.body.appendChild(div);

    act(() => {
      const pointerEvent = new Event("pointerdown", { bubbles: true });
      div.dispatchEvent(pointerEvent);
    });

    expect(mockOnFirstClick).toHaveBeenCalledTimes(1);
  });

  it("should not trigger onFirstClick for interactive elements", () => {
    renderHook(() =>
      useFirstClickDetection({
        onFirstClick: mockOnFirstClick,
        enabled: true,
      })
    );

    const button = document.createElement("button");
    document.body.appendChild(button);

    act(() => {
      const pointerEvent = new Event("pointerdown", { bubbles: true });
      button.dispatchEvent(pointerEvent);
    });

    expect(mockOnFirstClick).not.toHaveBeenCalled();
  });

  it("should not trigger when disabled", () => {
    renderHook(() =>
      useFirstClickDetection({
        onFirstClick: mockOnFirstClick,
        enabled: false,
      })
    );

    const div = document.createElement("div");
    document.body.appendChild(div);

    act(() => {
      const pointerEvent = new Event("pointerdown", { bubbles: true });
      div.dispatchEvent(pointerEvent);
    });

    expect(mockOnFirstClick).not.toHaveBeenCalled();
  });

  it("should only trigger once", () => {
    renderHook(() =>
      useFirstClickDetection({
        onFirstClick: mockOnFirstClick,
        enabled: true,
      })
    );

    const div1 = document.createElement("div");
    const div2 = document.createElement("div");
    document.body.appendChild(div1);
    document.body.appendChild(div2);

    act(() => {
      const pointerEvent1 = new Event("pointerdown", { bubbles: true });
      const pointerEvent2 = new Event("pointerdown", { bubbles: true });
      div1.dispatchEvent(pointerEvent1);
      div2.dispatchEvent(pointerEvent2);
    });

    expect(mockOnFirstClick).toHaveBeenCalledTimes(1);
  });

  it("should handle nested interactive elements", () => {
    renderHook(() =>
      useFirstClickDetection({
        onFirstClick: mockOnFirstClick,
        enabled: true,
      })
    );

    const div = document.createElement("div");
    const button = document.createElement("button");
    div.appendChild(button);
    document.body.appendChild(div);

    act(() => {
      const pointerEvent = new Event("pointerdown", { bubbles: true });
      button.dispatchEvent(pointerEvent);
    });

    expect(mockOnFirstClick).not.toHaveBeenCalled();
  });

  it("should trigger onFirstClick for keyboard keys", () => {
    renderHook(() =>
      useFirstClickDetection({
        onFirstClick: mockOnFirstClick,
        enabled: true,
      })
    );

    const keyboardKey = document.createElement("button");
    keyboardKey.setAttribute("data-testid", "key-C4");
    keyboardKey.setAttribute("aria-label", "Piano key");
    document.body.appendChild(keyboardKey);

    act(() => {
      const pointerEvent = new Event("pointerdown", { bubbles: true });
      keyboardKey.dispatchEvent(pointerEvent);
    });

    expect(mockOnFirstClick).toHaveBeenCalledTimes(1);
  });

  it("should trigger onFirstClick for pointer events", () => {
    renderHook(() =>
      useFirstClickDetection({
        onFirstClick: mockOnFirstClick,
        enabled: true,
      })
    );

    const div = document.createElement("div");
    document.body.appendChild(div);

    act(() => {
      const pointerEvent = new Event("pointerdown", { bubbles: true });
      div.dispatchEvent(pointerEvent);
    });

    expect(mockOnFirstClick).toHaveBeenCalledTimes(1);
  });

  it("should trigger onFirstClick for pointer events on keyboard keys", () => {
    renderHook(() =>
      useFirstClickDetection({
        onFirstClick: mockOnFirstClick,
        enabled: true,
      })
    );

    const keyboardKey = document.createElement("button");
    keyboardKey.setAttribute("data-testid", "key-C4");
    keyboardKey.setAttribute("aria-label", "Piano key");
    document.body.appendChild(keyboardKey);

    act(() => {
      const pointerEvent = new Event("pointerdown", { bubbles: true });
      keyboardKey.dispatchEvent(pointerEvent);
    });

    expect(mockOnFirstClick).toHaveBeenCalledTimes(1);
  });
});
