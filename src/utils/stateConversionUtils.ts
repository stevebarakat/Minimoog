import { clampParameter } from "@/utils";

/**
 * Parse a string to float and clamp to a range. Returns default if parse fails.
 */
export function parseAndClamp(
  value: string | null,
  min: number,
  max: number,
  defaultValue: number
): number {
  const parsed = parseFloat(value ?? "");
  if (isNaN(parsed)) return defaultValue;
  return clampParameter(parsed, min, max);
}

/**
 * Parse a string to float, or return default if parse fails.
 */
export function parseOrDefault(
  value: string | null,
  defaultValue: number
): number {
  const parsed = parseFloat(value ?? "");
  return isNaN(parsed) ? defaultValue : parsed;
}

// clampParameter is already exported from audioUtils
