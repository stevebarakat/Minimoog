import { getTooltipDescription } from "@/data/tooltipDescriptions";

export function getTooltipContent(key: string): string {
  const description = getTooltipDescription(key);
  return description || "";
}

export function getTooltipTitle(key: string): string {
  return key.replace(/-/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
}

export function hasTooltipData(key: string): boolean {
  const description = getTooltipDescription(key);
  return Boolean(description?.trim());
}
