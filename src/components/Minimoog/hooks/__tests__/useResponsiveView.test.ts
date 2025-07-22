import { renderHook, act } from "@testing-library/react";
import { describe, it, expect, beforeEach } from "vitest";
import { useResponsiveView } from "../useResponsiveView";

describe("useResponsiveView", () => {
  const setWindowWidth = (width: number) => {
    window.innerWidth = width;
    window.dispatchEvent(new Event("resize"));
  };

  beforeEach(() => {
    setWindowWidth(1200); // default to desktop
  });

  it('returns "desktop" for width >= 980', () => {
    setWindowWidth(1200);
    const { result } = renderHook(() => useResponsiveView());
    expect(result.current).toBe("desktop");
  });

  it('returns "tablet" for 768 <= width < 980', () => {
    setWindowWidth(900);
    const { result } = renderHook(() => useResponsiveView());
    expect(result.current).toBe("tablet");
  });

  it('returns "mobile" for width < 768', () => {
    setWindowWidth(500);
    const { result } = renderHook(() => useResponsiveView());
    expect(result.current).toBe("mobile");
  });

  it("updates view on window resize", () => {
    const { result } = renderHook(() => useResponsiveView());
    act(() => setWindowWidth(700));
    expect(result.current).toBe("mobile");
    act(() => setWindowWidth(900));
    expect(result.current).toBe("tablet");
    act(() => setWindowWidth(1200));
    expect(result.current).toBe("desktop");
  });
});
