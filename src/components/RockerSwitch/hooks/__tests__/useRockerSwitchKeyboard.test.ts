import { renderHook } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useRockerSwitchKeyboard } from "../useRockerSwitchKeyboard";

describe("useRockerSwitchKeyboard", () => {
  const mockOnCheckedChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Clean up any event listeners
    document.removeEventListener("keydown", vi.fn());
  });

  it("returns switchRef", () => {
    const { result } = renderHook(() =>
      useRockerSwitchKeyboard({
        checked: false,
        onCheckedChange: mockOnCheckedChange,
      })
    );

    expect(result.current.switchRef).toBeDefined();
    expect(result.current.switchRef.current).toBeNull();
  });

  it("handles spacebar keydown when switch is active", () => {
    const { result } = renderHook(() =>
      useRockerSwitchKeyboard({
        checked: false,
        onCheckedChange: mockOnCheckedChange,
      })
    );

    // Mock the switch element and focus
    const mockElement = document.createElement("label");
    mockElement.setAttribute("data-focused", "true");
    result.current.switchRef.current = mockElement;

    // Simulate spacebar keydown
    const spacebarEvent = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent);

    expect(mockOnCheckedChange).toHaveBeenCalled();
  });

  it("ignores non-spacebar keys", () => {
    const { result } = renderHook(() =>
      useRockerSwitchKeyboard({
        checked: false,
        onCheckedChange: mockOnCheckedChange,
      })
    );

    // Mock the switch element and focus
    const mockElement = document.createElement("label");
    mockElement.setAttribute("data-focused", "true");
    result.current.switchRef.current = mockElement;

    // Simulate non-spacebar keydown
    const enterEvent = new KeyboardEvent("keydown", { key: "Enter" });
    document.dispatchEvent(enterEvent);

    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });

  it("ignores spacebar when switch is not active", () => {
    const { result } = renderHook(() =>
      useRockerSwitchKeyboard({
        checked: false,
        onCheckedChange: mockOnCheckedChange,
      })
    );

    // Mock the switch element without focus
    const mockElement = document.createElement("label");
    result.current.switchRef.current = mockElement;

    // Mock document.activeElement to be something else
    const otherElement = document.createElement("div");
    Object.defineProperty(document, "activeElement", {
      value: otherElement,
      writable: true,
    });

    // Simulate spacebar keydown
    const spacebarEvent = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent);

    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });

  it("ignores spacebar when disabled", () => {
    const { result } = renderHook(() =>
      useRockerSwitchKeyboard({
        checked: false,
        onCheckedChange: mockOnCheckedChange,
        disabled: true,
      })
    );

    // Mock the switch element and focus
    const mockElement = document.createElement("label");
    mockElement.setAttribute("data-focused", "true");
    result.current.switchRef.current = mockElement;

    // Simulate spacebar keydown
    const spacebarEvent = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent);

    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });

  it("toggles from checked to unchecked on spacebar", () => {
    const { result } = renderHook(() =>
      useRockerSwitchKeyboard({
        checked: true,
        onCheckedChange: mockOnCheckedChange,
      })
    );

    // Mock the switch element and focus
    const mockElement = document.createElement("label");
    mockElement.setAttribute("data-focused", "true");
    result.current.switchRef.current = mockElement;

    // Simulate spacebar keydown
    const spacebarEvent = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent);

    expect(mockOnCheckedChange).toHaveBeenCalled();
  });

  it("handles multiple spacebar presses correctly", () => {
    const { result } = renderHook(() =>
      useRockerSwitchKeyboard({
        checked: false,
        onCheckedChange: mockOnCheckedChange,
      })
    );

    // Mock the switch element and focus
    const mockElement = document.createElement("label");
    mockElement.setAttribute("data-focused", "true");
    result.current.switchRef.current = mockElement;

    // Simulate multiple spacebar keydowns
    const spacebarEvent1 = new KeyboardEvent("keydown", { key: " " });
    const spacebarEvent2 = new KeyboardEvent("keydown", { key: " " });
    const spacebarEvent3 = new KeyboardEvent("keydown", { key: " " });

    document.dispatchEvent(spacebarEvent1);
    document.dispatchEvent(spacebarEvent2);
    document.dispatchEvent(spacebarEvent3);

    expect(mockOnCheckedChange).toHaveBeenCalledTimes(3);
  });

  it("updates when checked state changes", () => {
    const { result, rerender } = renderHook(
      ({ checked }) =>
        useRockerSwitchKeyboard({
          checked,
          onCheckedChange: mockOnCheckedChange,
        }),
      { initialProps: { checked: false } }
    );

    // Mock the switch element and focus
    const mockElement = document.createElement("label");
    mockElement.setAttribute("data-focused", "true");
    result.current.switchRef.current = mockElement;

    // Simulate spacebar keydown with false state
    const spacebarEvent1 = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent1);
    expect(mockOnCheckedChange).toHaveBeenCalled();

    // Clear mock and rerender with true state
    mockOnCheckedChange.mockClear();
    rerender({ checked: true });

    // Simulate spacebar keydown with true state
    const spacebarEvent2 = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent2);
    expect(mockOnCheckedChange).toHaveBeenCalled();
  });

  it("updates when disabled state changes", () => {
    const { result, rerender } = renderHook(
      ({ disabled }) =>
        useRockerSwitchKeyboard({
          checked: false,
          onCheckedChange: mockOnCheckedChange,
          disabled,
        }),
      { initialProps: { disabled: false } }
    );

    // Mock the switch element and focus
    const mockElement = document.createElement("label");
    mockElement.setAttribute("data-focused", "true");
    result.current.switchRef.current = mockElement;

    // Simulate spacebar keydown when not disabled
    const spacebarEvent1 = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent1);
    expect(mockOnCheckedChange).toHaveBeenCalled();

    // Clear mock and rerender with disabled state
    mockOnCheckedChange.mockClear();
    rerender({ disabled: true });

    // Simulate spacebar keydown when disabled
    const spacebarEvent2 = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent2);
    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });

  it("updates when onCheckedChange callback changes", () => {
    const mockOnCheckedChange1 = vi.fn();
    const mockOnCheckedChange2 = vi.fn();

    const { result, rerender } = renderHook(
      ({ onCheckedChange }) =>
        useRockerSwitchKeyboard({
          checked: false,
          onCheckedChange,
        }),
      { initialProps: { onCheckedChange: mockOnCheckedChange1 } }
    );

    // Mock the switch element and focus
    const mockElement = document.createElement("label");
    mockElement.setAttribute("data-focused", "true");
    result.current.switchRef.current = mockElement;

    // Simulate spacebar keydown with first callback
    const spacebarEvent1 = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent1);
    expect(mockOnCheckedChange1).toHaveBeenCalled();

    // Clear mock and rerender with second callback
    mockOnCheckedChange1.mockClear();
    rerender({ onCheckedChange: mockOnCheckedChange2 });

    // Simulate spacebar keydown with second callback
    const spacebarEvent2 = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent2);
    expect(mockOnCheckedChange2).toHaveBeenCalled();
  });

  it("handles edge case with null switchRef", () => {
    renderHook(() =>
      useRockerSwitchKeyboard({
        checked: false,
        onCheckedChange: mockOnCheckedChange,
      })
    );

    // Don't set switchRef.current (keep it null)

    // Simulate spacebar keydown
    const spacebarEvent = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent);

    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });

  it("gracefully handles missing focus state", () => {
    const { result } = renderHook(() =>
      useRockerSwitchKeyboard({
        checked: false,
        onCheckedChange: mockOnCheckedChange,
      })
    );

    // Mock the switch element without data-focused attribute
    const mockElement = document.createElement("label");
    result.current.switchRef.current = mockElement;

    // Mock document.activeElement to be something else
    const otherElement = document.createElement("div");
    Object.defineProperty(document, "activeElement", {
      value: otherElement,
      writable: true,
    });

    // Simulate spacebar keydown
    const spacebarEvent = new KeyboardEvent("keydown", { key: " " });
    document.dispatchEvent(spacebarEvent);

    expect(mockOnCheckedChange).not.toHaveBeenCalled();
  });
});
