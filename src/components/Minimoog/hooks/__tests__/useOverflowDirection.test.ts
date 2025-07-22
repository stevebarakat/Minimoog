import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useOverflowDirection } from "../useOverflowDirection";

describe("useOverflowDirection", () => {
  it("returns a ref object", () => {
    const { result } = renderHook(() => useOverflowDirection());
    expect(result.current).toHaveProperty("current");
  });

  // NOTE: We cannot reliably test event listener setup in jsdom/RTL because
  // the effect runs before the ref is assigned, so the event listener is never set up.
  // This is a limitation of React Testing Library and jsdom.
});
