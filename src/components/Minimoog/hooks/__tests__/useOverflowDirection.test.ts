import { renderHook } from "@testing-library/react";
import { describe, it, expect } from "vitest";
import { useOverflowDirection } from "../useOverflowDirection";

describe("useOverflowDirection", () => {
  it("returns a ref object", () => {
    const { result } = renderHook(() => useOverflowDirection());
    expect(result.current).toHaveProperty("current");
  });

  // Event listener setup cannot be reliably tested in jsdom/RTL due to timing issues
});
