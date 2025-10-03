export function isTouchDevice(): boolean {
  if (typeof window === "undefined") return false;

  return (
    "ontouchstart" in window ||
    navigator.maxTouchPoints > 0 ||
    // @ts-ignore - for older browsers
    navigator.msMaxTouchPoints > 0
  );
}

export function useIsTouchDevice(): boolean {
  if (typeof window === "undefined") return false;

  return isTouchDevice();
}
