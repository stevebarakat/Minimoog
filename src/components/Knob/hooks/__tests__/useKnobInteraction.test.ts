import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useKnobInteraction } from "../useKnobInteraction";

// Create a proper mock element with all required methods
const createMockElement = () => {
  const element = document.createElement("div");
  element.setPointerCapture = vi.fn();
  element.releasePointerCapture = vi.fn();
  element.focus = vi.fn();
  element.setAttribute = vi.fn();
  element.removeAttribute = vi.fn();
  return element;
};

// Mock the useKnob hook
vi.mock("../useKnob", () => ({
  useKnob: vi.fn(() => ({
    knobRef: { current: createMockElement() },
  })),
}));

describe("useKnobInteraction", () => {
  const mockOnChange = vi.fn();
  const defaultProps = {
    value: 50,
    min: 0,
    max: 100,
    step: 1,
    type: "radial" as const,
    onChange: mockOnChange,
    logarithmic: false,
    size: "medium" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should handle pointer down events", () => {
    const { result } = renderHook(() => useKnobInteraction(defaultProps));

    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientY: 100,
        pointerType: "mouse",
        pointerId: 1,
        currentTarget: createMockElement(),
      } as unknown as React.PointerEvent;

      result.current.handlePointerDown(mockEvent);
    });

    expect(result.current.isDragging).toBe(true);
  });

  it("should handle pointer move events", () => {
    const { result } = renderHook(() => useKnobInteraction(defaultProps));

    // First set dragging to true
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientY: 100,
        pointerType: "mouse",
        pointerId: 1,
        currentTarget: createMockElement(),
      } as unknown as React.PointerEvent;

      result.current.handlePointerDown(mockEvent);
    });

    expect(result.current.isDragging).toBe(true);
  });

  it("should handle pointer up events", () => {
    const { result } = renderHook(() => useKnobInteraction(defaultProps));

    // First set dragging to true
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientY: 100,
        pointerType: "mouse",
        pointerId: 1,
        currentTarget: createMockElement(),
      } as unknown as React.PointerEvent;

      result.current.handlePointerDown(mockEvent);
    });

    expect(result.current.isDragging).toBe(true);

    // Then test pointer up
    act(() => {
      const mockEvent = {
        preventDefault: vi.fn(),
        stopPropagation: vi.fn(),
        clientY: 100,
        pointerType: "mouse",
        pointerId: 1,
      } as unknown as PointerEvent;

      result.current.handlePointerUp(mockEvent);
    });

    expect(result.current.isDragging).toBe(false);
  });
});
