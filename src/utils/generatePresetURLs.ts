import { presets, Preset } from "@/data/presets";
import { presetToURL } from "./presetToURL";

/**
 * Generates URLs for all presets
 */
export function generatePresetURLs(
  baseURL: string = window.location.origin
): (Preset & { shareURL: string })[] {
  return presets.map((preset) => ({
    ...preset,
    shareURL: presetToURL(preset, baseURL),
  }));
}

/**
 * Gets a specific preset with its URL
 */
export function getPresetWithURL(
  presetId: string,
  baseURL: string = window.location.origin
): (Preset & { shareURL: string }) | undefined {
  const preset = presets.find((p) => p.id === presetId);
  if (!preset) return undefined;

  return {
    ...preset,
    shareURL: presetToURL(preset, baseURL),
  };
}

/**
 * Gets all presets by category with URLs
 */
export function getPresetsByCategoryWithURLs(
  category: string,
  baseURL: string = window.location.origin
): (Preset & { shareURL: string })[] {
  return presets
    .filter((preset) => preset.category === category)
    .map((preset) => ({
      ...preset,
      shareURL: presetToURL(preset, baseURL),
    }));
}
